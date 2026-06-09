"use client";

const KEYWORDS = [
  "import",
  "from",
  "export",
  "default",
  "return",
  "const",
  "new",
  "function",
  "true",
  "false",
];

export const CodeLine = ({ line }: { line: string }) => {
  // Handle comments
  if (line.trim().startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const parts = line.split(/(\s+)/);

  return (
    <>
      {parts.map((part, index) => {
        if (KEYWORDS.includes(part)) {
          return (
            <span
              key={index}
              className="text-red-500 dark:text-red-400 font-semibold"
            >
              {part}
            </span>
          );
        }

        if (
          (part.startsWith("'") && part.endsWith("'")) ||
          (part.startsWith('"') && part.endsWith('"'))
        ) {
          return (
            <span key={index} className="text-amber-600 dark:text-amber-400">
              {part}
            </span>
          );
        }

        if (["Editron", "editor", "console"].includes(part)) {
          return (
            <span key={index} className="text-rose-600 dark:text-rose-400">
              {part}
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
