const TR_FOLD: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u'
};

export function normalize(text: string): string[] {
  const lower = text.toLocaleLowerCase('tr');
  const folded = lower.replace(/[çğıöşüâîû]/g, (c) => TR_FOLD[c] ?? c);
  return folded
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function tokensMatch(userToken: string, keyword: string): boolean {
  if (userToken === keyword) return true;

  const [short, long] =
    userToken.length <= keyword.length ? [userToken, keyword] : [keyword, userToken];
  if (short.length >= 4 && long.startsWith(short)) return true;

  const tol = keyword.length >= 6 ? 2 : 1;
  if (Math.abs(userToken.length - keyword.length) <= tol &&
      levenshtein(userToken, keyword) <= tol) {
    return true;
  }
  return false;
}
