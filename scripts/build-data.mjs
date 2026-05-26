import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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

export function parseDocument(source) {
  const frontendMatch = source.match(/^FRONTEND\s*\n([\s\S]*?)(?=^BACKEND\s*$|$(?![\s\S]))/m);
  if (!frontendMatch) {
    throw new Error('FRONTEND marker bulunamadı');
  }
  const frontendText = frontendMatch[1];

  const frontendSubs = parseFrontend(frontendText);

  return {
    categories: [
      { id: 'frontend', title: 'Frontend', subcategories: frontendSubs }
    ]
  };
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
