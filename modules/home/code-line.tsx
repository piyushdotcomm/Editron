
"use client";
import React from 'react';

const highlightCode = (code: string) => {
    return code
        .replace(/import|from|export|default|return|const|new/g, '<span class="text-red-500 dark:text-red-400 font-semibold">$&</span>')
        .replace(/'[^']*'/g, '<span class="text-amber-600 dark:text-amber-400">$&</span>')
        .replace(/"[^"]*"/g, '<span class="text-amber-600 dark:text-amber-400">$&</span>')
        .replace(/Editron|console|editor/g, '<span class="text-rose-600 dark:text-rose-400">$&</span>');
};

const highlight = (text: string) => {
    const highlighted = text;
    if (highlighted.includes('//')) {
        const parts = highlighted.split('//');
        return <><span dangerouslySetInnerHTML={{ __html: highlightCode(parts[0]) }} /><span className="text-slate-500 italic">{'//' + parts[1]}</span></>;
    }
    return <span dangerouslySetInnerHTML={{ __html: highlightCode(highlighted) }} />;
};

export const CodeLine = ({ line }: { line: string }) => {
    const [highlighted, setHighlighted] = React.useState<React.ReactNode>(line);

    React.useEffect(() => {
        setHighlighted(highlight(line));
    }, [line]);

    return highlighted;
};
