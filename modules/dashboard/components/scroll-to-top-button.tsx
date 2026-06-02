"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ScrollToTopButton() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || !buttonRef.current) return;

      const scrollTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? Math.min(100, (scrollTop / documentHeight) * 100) : 0;
      const visible = scrollTop > 0;

      wrapperRef.current.style.opacity = visible ? "1" : "0";
      wrapperRef.current.style.pointerEvents = visible ? "auto" : "none";
      wrapperRef.current.style.transform = visible ? "translateY(0)" : "translateY(15px)";
      wrapperRef.current.style.background = `conic-gradient(rgba(246, 27, 45,1) ${progress}%, rgba(255,255,255,0.14) ${progress}% 100%)`;

      buttonRef.current.style.boxShadow = visible
        ? "0 16px 40px rgba(239, 68, 68, 0.25)"
        : "0 10px 24px rgba(0, 0, 0, 0.1)";
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-6 right-6 z-50 rounded-full p-0.5 transition-all duration-300"
      style={{
        opacity: 0,
        pointerEvents: "none",
        transform: "translateY(15px)",
        background: "conic-gradient(rgba(248,113,113,0.95) 0%, rgba(255,255,255,0.08) 0% 100%)",
      }}
    >
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-white/10 text-white shadow-[0_16px_40px_rgba(239,68,68,0.18)] transition-all duration-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-red-400/30"
        aria-label="Scroll to top"
        title="Scroll to top"
        style={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <ChevronUp size={22} />
      </button>
    </div>
  );
}
