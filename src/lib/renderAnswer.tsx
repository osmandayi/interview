import { CodeBlock } from '../components/CodeBlock';

export function renderAnswer(answer: string) {
  const parts: React.ReactNode[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      const text = answer.slice(lastIndex, match.index);
      parts.push(renderParagraphs(text, key++));
    }
    parts.push(
      <CodeBlock key={key++} code={match[2].trim()} language={match[1] || 'java'} />
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < answer.length) {
    parts.push(renderParagraphs(answer.slice(lastIndex), key++));
  }
  return parts;
}

function renderParagraphs(text: string, key: number) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '');
  return (
    <div key={key} className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}
