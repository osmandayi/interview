import { readJSON, writeJSON } from './storage';

export const SESSIONS_KEY = 'qa-interview-sessions';
const MAX_SESSIONS = 20;

export type InterviewSession = {
  id: string;          // oturum başlangıç zamanı (ms) — tekrar kaydı önler
  finishedAt: number;
  scope: string;       // kullanıcıya gösterilen kapsam etiketi
  count: number;
  average: number;
};

export function loadSessions(): InterviewSession[] {
  const arr = readJSON<unknown>(SESSIONS_KEY, []);
  return Array.isArray(arr) ? (arr as InterviewSession[]) : [];
}

export function saveSession(session: InterviewSession): void {
  const existing = loadSessions().filter((s) => s.id !== session.id);
  writeJSON(SESSIONS_KEY, [session, ...existing].slice(0, MAX_SESSIONS));
}
