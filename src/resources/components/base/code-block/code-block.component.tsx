import { cn } from '@/shared/lib/utils';

type TokenType =
  'comment' | 'string' | 'regex' | 'keyword' | 'number' | 'call' | 'plain';

// ponytail: regex tokenizer for short JS snippets (no template literals, no
// nested quirks); swap for a real highlighter if we ever show arbitrary code.
const tokenPattern = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*)`,
    String.raw`(?<string>'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")`,
    // A `/` right after ( , = & | ! : starts a regex literal, not a division.
    String.raw`(?<regex>(?<=[(,=&|!:]\s*)\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n])+\/[gimsuy]*)`,
    String.raw`(?<keyword>\b(?:function|var|let|const|return|if|else|for|while|try|finally|catch|new|typeof|null|true|false|undefined)\b)`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    String.raw`(?<call>\b[A-Za-z_$][\w$]*(?=\s*\())`,
  ].join('|'),
  'g',
);

export function tokenizeJs(code: string) {
  const tokens: Array<{ type: TokenType; text: string }> = [];
  let last = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const index = match.index;
    if (index > last) {
      tokens.push({ type: 'plain', text: code.slice(last, index) });
    }
    const type = Object.entries(match.groups ?? {}).find(
      ([, value]) => value !== undefined,
    )?.[0] as TokenType;
    tokens.push({ type, text: match[0] });
    last = index + match[0].length;
  }
  if (last < code.length) {
    tokens.push({ type: 'plain', text: code.slice(last) });
  }

  return tokens;
}

// Fixed dark palette: the block reads as code in light and dark mode.
const tokenClass: Record<TokenType, string> = {
  comment: 'text-slate-500 italic',
  string: 'text-emerald-300',
  regex: 'text-rose-300',
  keyword: 'text-violet-300',
  number: 'text-amber-300',
  call: 'text-sky-300',
  plain: '',
};

/** Read-only JS snippet with syntax colors; long lines wrap (no inner scroll). */
export function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        'rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-100',
        className,
      )}
    >
      <code>
        {tokenizeJs(code).map((token, index) => (
          <span
            key={index}
            className={tokenClass[token.type] || undefined}
          >
            {token.text}
          </span>
        ))}
      </code>
    </pre>
  );
}
