"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

const COMMIT_COLORS = [
    "oklch(0.627 0.265 25.505)",
    "oklch(0.558 0.288 27.325)",
    "oklch(0.505 0.213 27.518)",
    "oklch(0.645 0.246 16.439)",
    "oklch(0.704 0.191 22.216)"
];

function buildCellData(highlightedSet: Set<number>, total: number) {
    return Array.from({ length: total }, (_, index) => {
        const isHighlighted = highlightedSet.has(index);
        const shouldFlash = !isHighlighted && Math.random() < 0.1;
        return {
            isHighlighted,
            shouldFlash,
            color: COMMIT_COLORS[Math.floor(Math.random() * COMMIT_COLORS.length)],
            delay: `${(Math.random() * 1.5).toFixed(1)}s`,
        };
    });
}

const cleanString = (str: string): string => {
    const upperStr = str.toUpperCase();

    const withoutAccents = upperStr
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const allowedChars = Object.keys(letterPatterns);
    return withoutAccents
        .split("")
        .filter((char) => allowedChars.includes(char))
        .join("");
};

const generateHighlightedCells = (text: string) => {
    const cleanedText = cleanString(text);

    const width = Math.max(cleanedText.length * 6, 6) + 1;

    let currentPosition = 1;
    const highlightedCells: number[] = [];

    cleanedText
        .toUpperCase()
        .split("")
        .forEach((char) => {
            if (letterPatterns[char]) {
                const pattern = letterPatterns[char].map((pos) => {
                    const row = Math.floor(pos / 50);
                    const col = pos % 50;
                    return (row + 1) * width + col + currentPosition;
                });
                highlightedCells.push(...pattern);
            }
            currentPosition += 6;
        });

    return {
        cells: highlightedCells,
        width,
        height: 9,
    };
};

export const CommitsGrid = ({ text }: { text: string }) => {
    const [mounted, setMounted] = React.useState(false);

    const {
        cells,
        width: gridWidth,
        height: gridHeight,
    } = React.useMemo(() => generateHighlightedCells(text), [text]);

    const highlightedSet = React.useMemo(() => new Set(cells), [cells]);
    const total = gridWidth * gridHeight;

    const cellData = React.useMemo(
        () => buildCellData(highlightedSet, total),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [total]
    );

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section
            className="w-[90vw] max-w-5xl mx-auto bg-card border grid gap-1 sm:gap-1.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/10"
            style={{
                gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
            }}
        >
            {cellData.map(({ isHighlighted, shouldFlash, color, delay }, index) => {
                const showHighlight = mounted && isHighlighted;
                const showFlash = mounted && shouldFlash;

                return (
                    <div
                        key={index}
                        className={cn(
                            `w-full aspect-square rounded-[2px] sm:rounded-[4px] border border-border/40`,
                            showHighlight ? "animate-highlight" : "",
                            showFlash ? "animate-flash" : "",
                            !showHighlight && !showFlash ? "bg-card" : ""
                        )}
                        style={
                            mounted ? ({
                                animationDelay: delay,
                                "--highlight": color,
                            } as CSSProperties) : {}
                        }
                    />
                );
            })}
        </section>
    );
};

const letterPatterns: { [key: string]: number[] } = {
    A: [1,2,3,50,100,150,200,250,300,54,104,154,204,254,304,151,152,153],
    B: [0,1,2,3,4,50,100,150,151,200,250,300,301,302,303,304,54,104,152,153,204,254,303],
    C: [0,1,2,3,4,50,100,150,200,250,300,301,302,303,304],
    D: [0,1,2,3,50,100,150,200,250,300,301,302,54,104,154,204,254,303],
    E: [0,1,2,3,4,50,100,150,200,250,300,301,302,303,304,151,152],
    F: [0,1,2,3,4,50,100,150,200,250,300,151,152,153],
    G: [0,1,2,3,4,50,100,150,200,250,300,301,302,303,153,204,154,304,254],
    H: [0,50,100,150,200,250,300,151,152,153,4,54,104,154,204,254,304],
    I: [0,1,2,3,4,52,102,152,202,252,300,301,302,303,304],
    J: [0,1,2,3,4,52,102,152,202,250,252,302,300,301],
    K: [0,4,50,100,150,200,250,300,151,152,103,54,203,254,304],
    L: [0,50,100,150,200,250,300,301,302,303,304],
    M: [0,50,100,150,200,250,300,51,102,53,4,54,104,154,204,254,304],
    N: [0,50,100,150,200,250,300,51,102,153,204,4,54,104,154,204,254,304],
    Ñ: [0,50,100,150,200,250,300,51,102,153,204,4,54,104,154,204,254,304],
    O: [1,2,3,50,100,150,200,250,301,302,303,54,104,154,204,254],
    P: [0,50,100,150,200,250,300,1,2,3,54,104,151,152,153],
    Q: [1,2,3,50,100,150,200,250,301,302,54,104,154,204,202,253,304],
    R: [0,50,100,150,200,250,300,1,2,3,54,104,151,152,153,204,254,304],
    S: [1,2,3,4,50,100,151,152,153,204,254,300,301,302,303],
    T: [0,1,2,3,4,52,102,152,202,252,302],
    U: [0,50,100,150,200,250,301,302,303,4,54,104,154,204,254],
    V: [0,50,100,150,200,251,302,4,54,104,154,204,253],
    W: [0,50,100,150,200,250,301,152,202,252,4,54,104,154,204,254,303],
    X: [0,50,203,254,304,4,54,152,101,103,201,250,300],
    Y: [0,50,101,152,202,252,302,4,54,103],
    Z: [0,1,2,3,4,54,103,152,201,250,300,301,302,303,304],
    "0": [1,2,3,50,100,150,200,250,301,302,303,54,104,154,204,254],
    "1": [1,52,102,152,202,252,302,0,2,300,301,302,303,304],
    "2": [0,1,2,3,54,104,152,153,201,250,300,301,302,303,304],
    "3": [0,1,2,3,54,104,152,153,204,254,300,301,302,303],
    "4": [0,50,100,150,4,54,104,151,152,153,154,204,254,304],
    "5": [0,1,2,3,4,50,100,151,152,153,204,254,300,301,302,303],
    "6": [1,2,3,50,100,150,151,152,153,200,250,301,302,204,254,303],
    "7": [0,1,2,3,4,54,103,152,201,250,300],
    "8": [1,2,3,50,100,151,152,153,200,250,301,302,303,54,104,204,254],
    "9": [1,2,3,50,100,151,152,153,154,204,254,304,54,104],
    " ": [],
};