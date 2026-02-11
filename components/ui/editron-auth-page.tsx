'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    ChevronLeftIcon,
    GithubIcon,
    Chrome,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface EditronAuthPageProps {
    onGoogleSignIn: () => Promise<void>;
    onGithubSignIn: () => Promise<void>;
}

export function EditronAuthPage({ onGoogleSignIn, onGithubSignIn }: EditronAuthPageProps) {
    return (
        <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
            {/* Left Side - Branding & Testimonial */}
            <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
                <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
                <div className="z-10 flex items-center gap-3">
                    <Image src="/logo.svg" alt="Editron Logo" width={32} height={32} className="w-8 h-8" />
                    <p className="text-xl font-bold">Editron</p>
                </div>
                <div className="z-10 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-xl">
                            &ldquo;Editron has revolutionized my development workflow.
                            Code anywhere, anytime, with zero setup.&rdquo;
                        </p>
                        <footer className="font-mono text-sm font-semibold">
                            ~ Developer
                        </footer>
                    </blockquote>
                </div>
                <div className="absolute inset-0">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="relative flex min-h-screen flex-col justify-center p-4">
                {/* Background Gradients with Red Accent */}
                <div
                    aria-hidden
                    className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
                >
                    <div className="absolute top-0 right-0 h-[800px] w-[600px] -translate-y-[350px] rounded-full bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent blur-3xl" />
                    <div className="absolute top-1/2 left-0 h-[600px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/5 via-red-500/10 to-transparent blur-3xl" />
                    <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
                </div>

                {/* Back to Home Button */}
                <Button variant="ghost" className="absolute top-7 left-5" asChild>
                    <Link href="/">
                        <ChevronLeftIcon className='size-4 me-2' />
                        Home
                    </Link>
                </Button>

                {/* Auth Form Container */}
                <div className="mx-auto space-y-6 sm:w-sm">
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 blur-xl rounded-full"></div>
                            <Image src="/logo.svg" alt="Editron Logo" width={32} height={32} className="w-8 h-8 relative z-10" />
                        </div>
                        <p className="text-xl font-bold">Editron</p>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col space-y-3">
                        <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight">
                            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">Editron</span>
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Sign in to start coding with intelligence
                        </p>

                        {/* Status Badge */}
                        <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 backdrop-blur-md w-fit">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                            <span className="font-medium">Secure Authentication</span>
                        </div>
                    </div>

                    {/* Social Sign In Buttons */}
                    <div className="space-y-3 relative">
                        {/* Subtle glow behind buttons */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-amber-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <form action={onGoogleSignIn}>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 hover:bg-red-50 dark:hover:bg-red-50 border border-gray-200 dark:border-gray-200 hover:border-red-500/50 transition-all duration-300 group relative z-10 shadow-sm"
                            >
                                <Chrome className='size-5 me-2 group-hover:text-red-500 transition-colors' />
                                <span className="font-semibold">Continue with Google</span>
                            </Button>
                        </form>
                        <form action={onGithubSignIn}>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 hover:bg-red-50 dark:hover:bg-red-50 border border-gray-200 dark:border-gray-200 hover:border-red-500/50 transition-all duration-300 group relative z-10 shadow-sm"
                            >
                                <GithubIcon className='size-5 me-2 group-hover:text-red-500 transition-colors' />
                                <span className="font-semibold">Continue with GitHub</span>
                            </Button>
                        </form>
                    </div>

                    {/* Terms & Privacy */}
                    <p className="text-muted-foreground mt-8 text-sm text-center">
                        By continuing, you agree to our{' '}
                        <a
                            href="#"
                            className="hover:text-red-500 underline underline-offset-4 transition-colors"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="#"
                            className="hover:text-red-500 underline underline-offset-4 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
            } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
            } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 1 + i * 0.05, // Increased stroke width
    }));

    return (
        <div className="pointer-events-none absolute inset-0">
            <svg
                className="h-full w-full"
                viewBox="0 0 696 316"
                fill="none"
            >
                <defs>
                    {/* Vibrant Red gradient for the paths */}
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
                    </linearGradient>
                </defs>
                <title>Background Animation</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="url(#redGradient)"
                        strokeWidth={path.width}
                        strokeOpacity={0.4 + path.id * 0.02}
                        initial={{ pathLength: 0.3, opacity: 1 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.7, 1, 0.7],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
