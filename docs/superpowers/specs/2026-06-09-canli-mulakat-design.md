# Canlı Mülakat Modu — Tasarım Dokümanı

**Tarih:** 2026-06-09
**Durum:** Onaylandı, implementasyona hazır

## Amaç

Mevcut Q&A platformuna, kullanıcının sistemin sorduğu soruları yazarak cevapladığı
ve cevabının ne kadar doğru olduğunun yüzde olarak puanlandığı bir "canlı mülakat"
modu eklemek. Bilgiler hâlihazırda alanlara ayrılmış şekilde okunabilir durumda;
bu mod aktif pratik (mülakat simülasyonu) sağlar. Tamamen client-side, mevcut
Vite + React + TS + Tailwind + Vitest yığınına oturur.

## Karara bağlanmış gereksinimler

- **Soru kapsamı:** Varsayılan tüm havuz; kullanıcı isterse alan (Frontend/Backend)
  veya kategori filtresi uygulayabilir.
- **Anahtar kelime kaynağı:** Otomatik (dolgu/stop-word ayıklama) + opsiyonel elle override.
- **Eşleşme:** Esnek — Türkçe duyarlı normalize, kök/prefix eşleşmesi, 1-2 harf
  Levenshtein toleransı. Her anahtar kelime en fazla **bir kez** sayılır (tekrar problemi çözülür).
- **Geri bildirim:** Yüzde skor + yakalanan/kaçırılan anahtarlar + gerçek cevap.
- **Oturum:** Tekrarsız sorularla sürekli; kullanıcı "Bitir" diyene veya havuz
  tükenene kadar. Sonunda özet (soru sayısı + ortalama skor).

## Mimari

Saf client-side, modüler. Puanlama saf fonksiyonlar, oturum bir hook, UI ayrı view.
Backend yok. (İleride "dinamik/büyük veri" aşamasında yalnız veri kaynağı değişir,
mantık aynı kalır. Anlamsal/eş-anlamlı eşleşme istenirse backend/LLM o aşamada eklenebilir — şimdilik kapsam dışı.)

### 1. Puanlama motoru — `src/lib/scoring.ts` (saf fonksiyonlar)

- `normalize(text)`: Türkçe duyarlı küçük harf; Türkçe karakter katlama
  (ç→c, ğ→g, ı/i→i, ö→o, ş→s, ü→u); noktalama temizliği; boşluğa göre tokenize.
- `extractKeywords(answer, override?)`: normalize → Türkçe stop-word listesi
  (bir, ve, ile, için, olan, bu, da, de, ki, gibi, daha, çok, en, ama, veya, ya, her…)
  ve 3 harften kısa token'ları at → tekrarsız anahtar küme. `override` (elle liste)
  varsa onu kullan.
- `scoreAnswer(userText, keywords)`: kullanıcı token'larını normalize/dedupe et.
  Her anahtar için kullanıcıda eşleşme ara:
  (a) tam eşleşme, (b) kök/prefix eşleşmesi (standart↔standartlar),
  (c) Levenshtein ≤ 1-2 (harf hatası). Her anahtar en fazla 1 kez sayılır.
  Sonuç: `{ score: number /* % */, matched: string[], missed: string[] }`.

İzole ve test edilebilir; UI'dan bağımsız.

### 2. Oturum yönetimi — `src/hooks/useInterview.ts`

- **Havuz kurma:** `loadData`'dan tüm `FlatQAItem`'lar; opsiyonel
  `{ categoryId?, subcategoryId? }` filtresi; shuffle.
- **Tekrarsız çekme:** `asked` seti; sıradaki soru havuzdan çekilir; biterse oturum kapanır.
- **State:** `current`, `phase` ('answering' | 'feedback'), `history`
  (`{ itemId, score }[]`), `status` ('setup' | 'active' | 'finished').
- **Aksiyonlar:** `start(filter)`, `submit(userText)` (scoring çağırır → feedback),
  `next()`, `end()`, `reset()`.
- **Özet:** `history`'den soru sayısı + ortalama skor.

### 3. UI — `src/components/`

- `InterviewSetup`: "Tüm havuz" varsayılan + opsiyonel alan/kategori seçimi + "Başla".
- `InterviewView`: soru metni, `<textarea>`, "Gönder"; feedback panelinde büyük % skor,
  yakalanan anahtarlar (yeşil) / kaçırılanlar (kırmızı), altında gerçek cevap
  (mevcut `renderAnswer.tsx` ile). "Sonraki soru" ve "Bitir".
- `InterviewSummary`: oturum sonu — soru sayısı, ortalama skor, "Yeni oturum" / "Ana sayfa".

### 4. Entegrasyon

- `App.tsx`'e yeni `'interview'` view'ı.
- Giriş noktaları: `Welcome` ekranına "Canlı Mülakat" kartı/butonu; `Sidebar`'a menü girişi.
- Mevcut klavye kısayol deseni korunur; textarea'da yazarken kısayollar tetiklenmez
  (App'teki `isInput` kontrolü zaten mevcut).

### 5. Opsiyonel anahtar override

- `QAItem`'a opsiyonel `keywords?: string[]` alanı.
- `scripts/build-data.mjs`, `overrides.json`'daki `keywordOverrides` (slug → liste)
  varsa öğeye iliştirir; yoksa runtime otomatik ayıklama devreye girer. Mevcut
  override desenini bozmadan genişletir.

## Hata yönetimi

- Boş cevap gönderimi → %0 + uyarı.
- Filtre sonucu boş havuz → "bu kapsamda soru yok" mesajı.
- Havuzda tek soru kaldıysa "Sonraki" yerine yalnız "Bitir".

## Test (Vitest)

- `scoring.test.ts`: normalize (Türkçe), keyword ayıklama (stop-word), eşleşme
  (tam/kök/typo), **tekrar sayma** ("ECMA" 2 kez → 1 puan), boş cevap, %100 cevap.
- `useInterview.test.ts`: tekrarsız çekme, filtre uygulama, ortalama skor, havuz tükenmesi.

## Kapsam dışı (YAGNI)

- Anlamsal/eş-anlamlı eşleşme (LLM/backend).
- Kalıcı skor geçmişi / istatistik paneli.
- Çoklu kullanıcı / kimlik doğrulama.
