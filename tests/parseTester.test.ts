// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { parseTester } from '../scripts/build-data.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE = readFileSync(resolve(__dirname, '..', 'content', 'tester.md'), 'utf-8');
const subs = parseTester(SOURCE);
const items = subs.flatMap((s) => s.items);

describe('parseTester', () => {
  it('parses the 6 sections in order without numbering', () => {
    expect(subs.map((s) => s.title)).toEqual([
      'Test Seviyeleri ve Türleri',
      'Test Yaşam Döngüsü ve Süreçleri',
      'Web & Mobil Otomasyon Temelleri',
      'API & Entegrasyon Testleri',
      'CI/CD & DevOps Entegrasyonu',
      'Metodoloji ve Yaklaşımlar'
    ]);
  });

  it('keeps every question from the source', () => {
    expect(subs.map((s) => s.items.length)).toEqual([11, 7, 6, 6, 4, 4]);
    expect(items[0].question).toBe('Smoke Test (Duman Testi)');
  });

  it('formats definition and example as separate paragraphs', () => {
    const smoke = items[0];
    const [def, example] = smoke.answer.split('\n\n');
    expect(def).toMatch(/^\*\*Kısa Tanım:\*\* Yeni bir yazılım sürümü/);
    expect(example).toMatch(/^\*\*Mülakat Örneği & Akış:\*\* "Bir e-ticaret/);
    expect(example).toMatch(/detaylı teste geçmeyiz\."$/);
  });

  it('turns nested bullets into • lines and strips italic wrappers', () => {
    const http = items.find((i) => i.question === 'HTTP Status Kodları')!;
    expect(http.answer).toContain('• **404 Not Found:** Endpoint/kaynak bulunamadı.');
    expect(http.answer).toMatch(/Sunucu tarafında hata\."$/);
    expect(http.answer).not.toMatch(/\*"|"\*/);
  });

  it('uses only the definition as keyword source', () => {
    const bb = items.find((i) => i.question.startsWith('Black-Box'))!;
    expect(bb.keywordSource).toMatch(/Black-Box: Kod yapısını/);
    expect(bb.keywordSource).not.toMatch(/Mülakat/);
  });

  it('generates valid unique slug IDs', () => {
    const ids = items.map((i) => i.id);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
