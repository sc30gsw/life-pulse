// Pure function (CVX-09) — Pearson correlation coefficient over pairwise-
// complete observations. Callers (services/insights/correlations.ts) are
// responsible for excluding days where either value is missing before
// building `pairs` (§4 pairwise exclusion in the insights plan).
export function pearson(pairs: ReadonlyArray<readonly [number, number]>) {
  const n = pairs.length;

  if (n < 2) {
    return null;
  }

  const xs = pairs.map(([x]) => x);
  const ys = pairs.map(([, y]) => y);
  const meanX = mean(xs);
  const meanY = mean(ys);

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;

    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  if (varianceX === 0 || varianceY === 0) {
    return null;
  }

  return covariance / Math.sqrt(varianceX * varianceY);
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
