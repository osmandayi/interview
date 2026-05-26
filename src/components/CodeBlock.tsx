import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useThemeContext } from '../contexts/ThemeContext';

type Props = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = 'java' }: Props) {
  const { theme } = useThemeContext();
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: language,
      theme: theme === 'dark' ? 'github-dark' : 'github-light'
    }).then((result) => {
      if (!cancelled) setHtml(result);
    }).catch(() => {
      if (!cancelled) setHtml(`<pre>${escapeHtml(code)}</pre>`);
    });
    return () => { cancelled = true; };
  }, [code, language, theme]);

  if (!html) {
    return (
      <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-3 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]!));
}
