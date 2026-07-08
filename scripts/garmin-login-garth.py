#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["garth==0.4.46"]
# ///
#
# Standalone script — NOT part of the Convex or Vite build.
# Run with: uv run scripts/garmin-login-garth.py   (uv resolves garth automatically)
# or:       pip3 install garth && python3 scripts/garmin-login-garth.py
#
# WHY THIS EXISTS (alongside scripts/garmin-login.ts):
# garmin-connect-sdk logs in via Garmin's mobile API (/mobile/api/login), which
# rate-limits per ACCOUNT after repeated attempts (429 persists across IPs).
# garth 0.4.x logs in via the sso.garmin.com web-SSO embed flow (sso/signin
# HTML form) — the same path a browser uses — which is a different endpoint
# from the mobile-login throttle. garth >=0.5 REWROTE login to use the same
# /mobile/api/login?clientId=GCM_ANDROID_DARK endpoint as the SDK and hits the
# identical 429, hence the ==0.4.46 pin above. Both flows end at equivalent
# OAuth2 tokens, so the result is convertible.
#
# Prints a GarminTokens JSON (the exact shape the SDK's TokenStorage expects:
# accessToken / refreshToken / accessTokenExpiresAt). Never writes tokens to
# disk. Set it with:
#   npx convex env set GARMIN_TOKENS_JSON '<paste the printed JSON here>'

import base64
import getpass
import json
import sys
from datetime import datetime, timezone

import garth


def iso_utc(unix_seconds):
    if not unix_seconds:
        return None
    dt = datetime.fromtimestamp(unix_seconds, tz=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def jwt_claim(token, claim):
    try:
        payload_b64 = token.split(".")[1]
        payload_b64 += "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        value = payload.get(claim)
        return value if isinstance(value, str) and value else None
    except Exception:
        return None


def main():
    email = input("Garmin email: ")
    password = getpass.getpass("Garmin password: ")

    # garth calls prompt_mfa only after Garmin's SSO response demands MFA —
    # i.e. after the code email has been triggered — so prompt at that moment.
    garth.login(
        email,
        password,
        prompt_mfa=lambda: input("MFA code (check your email now): ").strip(),
    )

    t = garth.client.oauth2_token
    if t is None:
        raise SystemExit("Login succeeded but garth returned no OAuth2 token.")

    tokens = {
        "accessToken": t.access_token,
        "refreshToken": t.refresh_token,
        # garmin-connect-sdk expects ISO-8601 strings, not unix seconds.
        "accessTokenExpiresAt": iso_utc(t.expires_at),
    }

    refresh_expires = iso_utc(getattr(t, "refresh_token_expires_at", None))
    if refresh_expires:
        tokens["refreshTokenExpiresAt"] = refresh_expires
    if getattr(t, "token_type", None):
        tokens["tokenType"] = t.token_type
    if getattr(t, "scope", None):
        tokens["scope"] = t.scope

    # The SDK's refresh path builds Basic auth from clientId, falling back to
    # its built-in mobile DI client id. Pin the real one from the JWT so the
    # refresh is guaranteed to match this token's issuer.
    client_id = jwt_claim(t.access_token, "client_id")
    if client_id:
        tokens["clientId"] = client_id

    print(json.dumps(tokens))
    sys.stderr.write(
        "\nCopy the JSON line above (single line) and run:\n"
        "  npx convex env set GARMIN_TOKENS_JSON '<paste output here>'\n"
    )


if __name__ == "__main__":
    main()
