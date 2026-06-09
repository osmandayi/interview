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

// Normalized (Turkish-folded) Turkish stop-words.
const STOP_WORDS = new Set([
  'bir', 've', 'ile', 'icin', 'olan', 'bu', 'su', 'da', 'de', 'ki', 'gibi',
  'daha', 'cok', 'en', 'ama', 'veya', 'ya', 'her', 'ise', 'gore', 'kadar',
  'sonra', 'once', 'hem', 'yani', 'tum', 'ancak', 'fakat', 'cunku', 'eger',
  'ayrica', 'hangi', 'nedir', 'olarak', 'yine'
]);

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export function extractKeywords(answer: string, override?: string[]): string[] {
  if (override && override.length > 0) {
    return dedupe(override.flatMap((k) => normalize(k)));
  }
  const tokens = normalize(answer);
  return dedupe(tokens.filter((t) => t.length >= 3 && !STOP_WORDS.has(t)));
}

export type ScoreResult = {
  score: number;       // 0-100
  matched: string[];   // keywords the user covered
  missed: string[];    // keywords the user missed
};

export function scoreAnswer(userText: string, keywords: string[]): ScoreResult {
  const userTokens = dedupe(normalize(userText));
  const matched: string[] = [];
  const missed: string[] = [];

  for (const kw of keywords) {
    if (userTokens.some((ut) => tokensMatch(ut, kw))) matched.push(kw);
    else missed.push(kw);
  }

  const score = keywords.length === 0
    ? 0
    : Math.round((matched.length / keywords.length) * 100);

  return { score, matched, missed };
}
