"use client";
import React from 'react';

const escapeHtml = (text: string) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const highlightCode = (code: string) => {
    // Use placeholders for span tags to preserve them during escaping
    const placeholderPrefix = "__SPAN_";
    const placeholderSuffix = "__";
    let placeholderIndex = 0;
    const placeholders: string[] = [];

    const replaceWithPlaceholder = (match: string) => {
        const placeholder = `${placeholderPrefix}${placeholderIndex++}${placeholderSuffix}`;
        placeholders.push(match);
        return placeholder;
    };

    // Apply syntax highlighting on raw code first
    let highlighted = code
        .replace(/import|from|export|default|return|const|new/g, (match) => replaceWithPlaceholder(`<span class="text-red-500 dark:text-red-400 font-semibold">${match}</span>`))
        .replace(/'[^']*'/g, (match) => replaceWithPlaceholder(`<span class="text-amber-600 dark:text-amber-400">${match}</span>`))
        .replace(/"[^"]*"/g, (match) => replaceWithPlaceholder(`<span class="text-amber-600 dark:text-amber-400">${match}</span>`))
        .replace(/Editron|console|editor/g, (match) => replaceWithPlaceholder(`<span class="text-rose-600 dark:text-rose-400">${match}</span>`));

    // Escape HTML entities in the non-span content
    highlighted = escapeHtml(highlighted);

    // Restore the span tags from placeholders
    placeholders.forEach((span, index) => {
        highlighted = highlighted.replace(`${placeholderPrefix}${index}${placeholderSuffix}`, span);
    });

    return highlighted;
};

const highlight = (text: string) => {
    if (text.includes('//')) {
        const commentStart = text.indexOf('//');
        const codePart = text.slice(0, commentStart);
        const commentPart = text.slice(commentStart);
        return (
            <>
                <span dangerouslySetInnerHTML={{ __html: highlightCode(codePart) }} />
                <span className="text-slate-500 italic">{commentPart}</span>
            </>
        );
    }
    return <span dangerouslySetInnerHTML={{ __html: highlightCode(text) }} />;
};

export const CodeLine = ({ line }: { line: string }) => {
    const highlighted = React.useMemo(() => highlight(line), [line]);
    return highlighted;
};
