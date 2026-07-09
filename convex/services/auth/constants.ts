export const SECOND_FACTOR_OTP_LENGTH = 6;
export const SECOND_FACTOR_OTP_TTL_MS = 10 * 60 * 1000;
export const SECOND_FACTOR_OTP_EXPIRES_IN_MINUTES = SECOND_FACTOR_OTP_TTL_MS / 60_000;
export const SECOND_FACTOR_RESEND_COOLDOWN_MS = 60 * 1000;
export const SECOND_FACTOR_MAX_ATTEMPTS = 5;

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const PASSWORD_RESET_EXPIRES_IN_MINUTES = PASSWORD_RESET_TTL_MS / 60_000;
export const EMAIL_CHANGE_TTL_MS = 60 * 60 * 1000;
export const EMAIL_CHANGE_EXPIRES_IN_MINUTES = EMAIL_CHANGE_TTL_MS / 60_000;

export const AUTH_EMAIL_SUBJECTS = {
  emailChange: "Life Pulse メールアドレス変更確認",
  passwordReset: "Life Pulse パスワード再設定",
  secondFactorOtp: "Life Pulse 確認コード",
} as const satisfies Record<string, `Life Pulse ${string}`>;

export const AUTH_ENV = {
  appBaseUrl: "APP_BASE_URL",
  otpPepper: "AUTH_OTP_PEPPER",
  resendFrom: "RESEND_FROM",
  resendReplyTo: "RESEND_REPLY_TO",
} as const satisfies Record<string, string>;
