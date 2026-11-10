import { CodeBlock } from '../components/CodeBlock';
import { normalize, tokensMatch } from './scoring';

type RenderOptions = {
  /** Bu anahtar kelimelerle eşleşen kelimeler vurgulanır (Canlı Mülakat geri bildirimi). */
  highlight?: string[];
};

export function renderAnswer(answer: string, options: RenderOptions = {}) {
  const parts: React.ReactNode[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      const text = answer.slice(lastIndex, match.index);
      parts.push(renderParagraphs(text, key++, options));
    }
    parts.push(
      <CodeBlock key={key++} code={match[2].trim()} language={match[1] || 'java'} />
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < answer.length) {
    parts.push(renderParagraphs(answer.slice(lastIndex), key++, options));
  }
  return parts;
}

function renderParagraphs(text: string, key: number, options: RenderOptions) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '');
  return (
    <div key={key} className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line">
          {renderInline(p.trim(), options.highlight)}
        </p>
      ))}
    </div>
  );
}

// Satır içi **kalın** ve `kod` işaretlerini render eder; geri kalan metin aynen kalır.
export function renderInline(text: string, highlight?: string[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*([^*\n]+?)\*\*|`([^`\n]+)`/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  const plain = (s: string) => {
    if (highlight && highlight.length > 0) nodes.push(...highlightWords(s, highlight, `h${key++}`));
    else nodes.push(s);
  };
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) plain(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-neutral-900 dark:text-neutral-50">
          {highlight ? highlightWords(m[1], highlight, `b${key}`) : m[1]}
        </strong>
      );
    } else {
      nodes.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[0.88em] font-mono text-brand-700 dark:text-brand-300"
        >
          {m[2]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) plain(text.slice(last));
  return nodes;
}

function highlightWords(text: string, keywords: string[], keyPrefix: string): React.ReactNode[] {
  // Tek elemanlı gruplu split: tek indeksler kelime, çift indeksler ayraçtır.
  const pieces = text.split(/([\p{L}\p{N}]+)/u);
  return pieces.map((piece, i) => {
    if (i % 2 === 0 || piece.length < 3) return piece;
    const tokens = normalize(piece);
    const hit = tokens.some((t) => keywords.some((k) => tokensMatch(t, k)));
    return hit ? (
      <mark
        key={`${keyPrefix}-${i}`}
        className="rounded px-0.5 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
      >
        {piece}
      </mark>
    ) : (
      piece
    );
  });
}
