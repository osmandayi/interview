import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function pathToFileUrlSafe(p) {
  try {
    return pathToFileURL(resolve(p)).href;
  } catch {
    return '';
  }
}

const FRONTEND_SUBCATEGORIES = [
  'JavaScript Temelleri ve Mimari',
  'React Mimarisi ve Ekosistemi',
  'En İyi Pratikler ve Proje Mimarisi'
];

const BACKEND_SUBCATEGORIES = [
  '1. Java Core ve Temel Kavramlar',
  '2. Spring Framework ve Mikroservisler',
  '3. SQL ve Veritabanı',
  '4. Veri Yapıları ve Algoritmalar',
  '5. Yazılım Mühendisliği ve Metodolojiler'
];

// Known question titles per subcategory.
// Use the EXACT text from full_stack.txt including trailing colon or question mark.
const BACKEND_QUESTIONS = {
  '1. Java Core ve Temel Kavramlar': [
    'Integer ve int farkı:',
    'Java HashMap ve List farkı:',
    'HashMap ve List Eleman Ekleme/Çıkarma Metotları:',
    'Final ve Finally farkı:',
    'Metot Overloading (Aşırı Yükleme) nedir?',
    "Bir class birden fazla class'ı extend edebilir mi?",
    'Static ve Normal fonksiyon nasıl çağrılır?',
    'String, StringBuilder, StringBuffer farkları:',
    '.java ve .class farkı nedir?',
    '.jar, .war, .ear farkı ve ne oldukları:'
  ],
  '2. Spring Framework ve Mikroservisler': [
    '@Autowired nedir?',
    'Entity ve Repository nedir?',
    'Service Registry nedir?',
    'Merkezi loglama nasıl yapılır? (Interceptor, AOP)',
    'Aspect Oriented Programming (AOP) nedir?',
    'Spring Core Genel:',
    'Transaction nedir? Anotasyon hangi parametreleri alır?',
    'Resilience4j:',
    'Zipkin:',
    'Grafana:',
    'Mikroservis Design Patternleri Nelerdir?',
    'Saga Pattern nedir?',
    'CQRS (Command Query Responsibility Segregation) nedir?'
  ],
  '3. SQL ve Veritabanı': [
    'HAVING nedir?',
    'JOIN ve UNION nedir?',
    'SQL Normalizasyon Adımları:'
  ],
  '4. Veri Yapıları ve Algoritmalar': [
    'Queue ve Stack farkı nedir?',
    '$O(n)$ ve $O(n^2)$ nedir?',
    'Stream nedir ve metotları nelerdir?',
    'Algoritma Sorusu: boolean isSortedasc(int[] arr)'
  ],
  '5. Yazılım Mühendisliği ve Metodolojiler': [
    'OOP (Object Oriented Programming - Nesne Yönelimli Programlama):',
    'SOLID:',
    'Strategy Pattern nedir?',
    'UML (Unified Modeling Language) nedir?',
    'Git kullandın mı? Merge nedir?',
    'Agile nedir, Scrum nedir, kullandınız mı?'
  ]
};

function findOccurrences(haystack, needle) {
  const positions = [];
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    positions.push(idx);
    idx += needle.length;
  }
  return positions;
}

function wrapJavaCode(answer) {
  // Detect Java method body: optional "Java" preamble, then "public/private/static <return> name(...) { ... }"
  const javaPattern = /(?:Java\s*)?(public\s+(?:boolean|int|void|String|static)\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\})/m;
  return answer.replace(javaPattern, (_match, code) => {
    return '\n```java\n' + code.trim() + '\n```\n';
  });
}

function parseBackend(text) {
  const flat = text.replace(/\r/g, '');

  const subSplits = BACKEND_SUBCATEGORIES.map((title) => {
    const pos = flat.indexOf(title);
    if (pos === -1) throw new Error(`Backend subcategory bulunamadı: ${title}`);
    return { title, pos };
  }).sort((a, b) => a.pos - b.pos);

  const subcategories = [];

  for (let i = 0; i < subSplits.length; i++) {
    const { title, pos } = subSplits[i];
    const end = i + 1 < subSplits.length ? subSplits[i + 1].pos : flat.length;
    const subText = flat.slice(pos + title.length, end);

    const questions = BACKEND_QUESTIONS[title] || [];
    const qSplits = [];
    for (const q of questions) {
      const positions = findOccurrences(subText, q);
      if (positions.length === 0) {
        console.warn(`⚠ Soru bulunamadı (${title}): "${q.slice(0, 50)}..."`);
        continue;
      }
      qSplits.push({ question: q, pos: positions[0] });
    }
    qSplits.sort((a, b) => a.pos - b.pos);

    const items = [];
    for (let j = 0; j < qSplits.length; j++) {
      const { question, pos: qPos } = qSplits[j];
      const qEnd = j + 1 < qSplits.length ? qSplits[j + 1].pos : subText.length;
      const answer = subText.slice(qPos + question.length, qEnd).trim();
      items.push({
        id: slugify(question),
        question: question.replace(/:$/, ''),
        answer,
        tags: []
      });
    }

    subcategories.push({
      id: slugify(title.replace(/^\d+\.\s*/, '')),
      title: title.replace(/^\d+\.\s*/, ''),
      items
    });
  }

  for (const sub of subcategories) {
    for (const item of sub.items) {
      item.answer = wrapJavaCode(formatBackendAnswer(item.answer));
    }
  }

  return subcategories;
}

// Backend cevapları tek satırda sıkışmış geliyor. Bilinen bullet pattern'leri
// öncesine paragraf kırılımı ekleyerek okunabilir hale getirir.
function formatBackendAnswer(answer) {
  let s = answer;

  // SOLID letter enumeration: "S - ", "O - ", "L - ", "I - ", "D - "
  s = s.replace(/([.:])\s*([SOLID])\s+-\s+(?=[A-ZÇĞİÖŞÜ])/g, '$1\n\n$2 - ');

  // Parenthetical-translation bullets: "Encapsulation (Kapsülleme):", "1NF (First Normal Form):"
  s = s.replace(
    /([.:])\s*([\dA-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ]*(?:\s+[\wçğıöşüÇĞİÖŞÜ]+){0,3}\s*\([A-ZÇĞİÖŞÜ][^)]{1,80}\))\s*:/g,
    '$1\n\n$2:'
  );

  // Dotfile bullets: ".class:", ".war (Web Archive):"
  s = s.replace(/(\.)(\.\w{2,8}(?:\s+\([A-Z][^)]+\))?)\s*:/g, '$1\n\n$2:');

  // Acronym bullets: "JOIN:", "UNION:", "AOP:", "2NF:", "3NF:"
  s = s.replace(/([.])\s*(\d?[A-Z]{2,}\d*)\s*:(?=\s+\S)/g, '$1\n\n$2:');

  // CamelCase bullets: "HashMap:", "StringBuilder:", "StringBuffer:"
  s = s.replace(
    /([.])\s*([A-Z][a-z]+(?:[A-Z][a-z]+)+)\s*:\s+(?=\S)/g,
    '$1\n\n$2: '
  );

  // Capitalized noun bullets (1-3 word): "Interceptor:", "Static fonksiyon:", "Integer:"
  s = s.replace(
    /([.])\s*([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[a-zçğıöşü]+){0,2})\s*:\s+(?=\S)/g,
    '$1\n\n$2: '
  );

  // Lowercase technical keyword bullets: "final:", "finally:", "int:", "static:"
  s = s.replace(
    /([.])\s*(final|finally|int|void|static|public|private|protected)\s*:\s+(?=\S)/g,
    '$1\n\n$2: '
  );

  // @Annotation bullets: "@Transactional parametreleri:"
  s = s.replace(/([.])\s*(@[A-Z]\w+\s+\w+)\s*:/g, '$1\n\n$2:');

  // Comma list of patterns at the end of "Mikroservis Design Patternleri": split into bullets
  // Pattern: 4+ comma-separated CapitalizedTerms followed by period at end of answer
  s = s.replace(
    /\b([A-Z][A-Za-z\s]+(?:,\s*[A-Z][A-Za-z\s/]+){3,})\.\s*$/,
    (_, list) => {
      const items = list.split(/,\s*/).map((x) => '• ' + x.trim());
      return items.join('\n') + '.';
    }
  );

  return s.trim();
}

export function slugify(text) {
  const map = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text
    .split('').map((ch) => map[ch] ?? ch).join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

// Heuristic: detects whether a line is the start of a new Q&A (question)
// rather than a continuation/answer paragraph.
function isQuestionLine(line) {
  const t = line.trim();
  if (!t) return false;
  // Lines ending in `?` are very likely questions.
  if (/\?\s*(\(.*\))?\s*$/.test(t)) return true;
  // Short title-like lines without answer-marker punctuation are questions.
  if (t.length < 80 && !t.includes(':') && !t.includes('👉')) return true;
  return false;
}

function parseFrontend(text) {
  const lines = text.split('\n');
  const subcategories = [];
  let currentSub = null;
  // Accumulator: lines forming the current Q&A block.
  // First non-blank line is the question; rest is answer (blanks preserved).
  let currentBlock = [];

  const flushBlock = () => {
    if (!currentSub || currentBlock.length === 0) {
      currentBlock = [];
      return;
    }
    // First non-blank line is question.
    let qIdx = currentBlock.findIndex((l) => l.trim() !== '');
    if (qIdx === -1) {
      currentBlock = [];
      return;
    }
    const question = currentBlock[qIdx].trim();
    const answerLines = currentBlock.slice(qIdx + 1);
    // Trim leading and trailing blank lines from answer.
    while (answerLines.length && answerLines[0].trim() === '') answerLines.shift();
    while (answerLines.length && answerLines[answerLines.length - 1].trim() === '') answerLines.pop();
    const answer = answerLines.join('\n').trim();
    if (question && answer) {
      currentSub.items.push({
        id: slugify(question),
        question,
        answer,
        tags: []
      });
    }
    currentBlock = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();

    // Subcategory header.
    if (FRONTEND_SUBCATEGORIES.includes(trimmed)) {
      flushBlock();
      currentSub = { id: slugify(line), title: trimmed, items: [] };
      subcategories.push(currentSub);
      continue;
    }

    if (currentSub === null) {
      // Skip anything before first subcategory.
      continue;
    }

    if (trimmed === '') {
      // Blank line — accumulate; flush only when we recognise a new question.
      if (currentBlock.length > 0) currentBlock.push(line);
      continue;
    }

    // Non-blank line. Decide: new question or continuation?
    const hasQuestionAlready = currentBlock.some((l) => l.trim() !== '');
    const hasAnswerAlready =
      hasQuestionAlready &&
      currentBlock
        .slice(currentBlock.findIndex((l) => l.trim() !== '') + 1)
        .some((l) => l.trim() !== '');

    if (hasQuestionAlready && hasAnswerAlready && isQuestionLine(line)) {
      // Boundary: flush previous block, start new one with this question.
      flushBlock();
      currentBlock.push(line);
    } else {
      currentBlock.push(line);
    }
  }
  flushBlock();

  return subcategories;
}

function loadOverrides() {
  const path = resolve(__dirname, 'overrides.json');
  if (!existsSync(path)) return { tagOverrides: {} };
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return { tagOverrides: {} };
  }
}

function applyOverrides(data, overrides) {
  for (const cat of data.categories) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        if (overrides.tagOverrides?.[item.id]) {
          item.tags = overrides.tagOverrides[item.id];
        }
        if (overrides.keywordOverrides?.[item.id]) {
          item.keywords = overrides.keywordOverrides[item.id];
        }
      }
    }
  }
  return data;
}

export function parseDocument(source) {
  const frontendMatch = source.match(/^FRONTEND\s*\n([\s\S]*?)\n\s*BACKEND\b/m);
  if (!frontendMatch) {
    throw new Error('FRONTEND marker bulunamadı');
  }
  const backendMatch = source.match(/\bBACKEND\b([\s\S]*)$/);
  if (!backendMatch) {
    throw new Error('BACKEND marker bulunamadı');
  }

  const frontendText = frontendMatch[1];
  const backendText = backendMatch[1];

  const data = {
    categories: [
      { id: 'frontend', title: 'Frontend', subcategories: parseFrontend(frontendText) },
      { id: 'backend',  title: 'Backend',  subcategories: parseBackend(backendText) }
    ]
  };
  return applyOverrides(data, loadOverrides());
}

// CLI entry point — detect direct invocation (node scripts/build-data.mjs ...)
const invokedPath = process.argv[1] ? pathToFileUrlSafe(process.argv[1]) : '';
if (import.meta.url === invokedPath) {
  const verbose = process.argv.includes('--verbose');
  const SRC = 'C:/Users/Pc/Desktop/full_stack.txt';
  const text = readFileSync(SRC, 'utf-8');
  const data = parseDocument(text);
  const outPath = resolve(__dirname, '..', 'src', 'data', 'qa.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

  if (verbose) {
    console.log('✓ Parsed:');
    for (const cat of data.categories) {
      console.log(`  ${cat.title}`);
      for (const sub of cat.subcategories) {
        console.log(`    ├ ${sub.title}: ${sub.items.length} Q&A`);
      }
    }
  }
  console.log(`✓ Yazıldı: ${outPath}`);
}
