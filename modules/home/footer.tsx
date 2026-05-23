import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Briefcase,
} from "lucide-react";

export function Footer() {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/piyushdotcomm",
      label: "GitHub",
    },
    {
      icon: Twitter,
      href: "https://x.com/Piyushhere_",
      label: "Twitter",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/piyushdotcom/",
      label: "LinkedIn",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/piyush.here_/",
      label: "Instagram",
    },
    {
      icon: Briefcase,
      href: "https://portfolio-six-pearl-1xxunv669i.vercel.app/",
      label: "Portfolio",
    },
  ];

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Playground", href: "/playground" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "GitHub", href: "https://github.com/piyushdotcomm/Editron" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-background pt-10 pb-44">

      {/* background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-500/[0.04] via-transparent to-transparent dark:from-red-500/[0.08]" />

      {/* main content */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center">

        {/* brand */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Editron
          </h2>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Modern browser-based development environment with AI-powered
            workflows, live previews, and collaborative editing.
          </p>
        </div>

        {/* social icons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-2xl bg-red-500/0 blur-xl transition-all duration-300 group-hover:bg-red-500/20" />

              <div className="relative rounded-2xl border border-border/50 bg-background/70 p-3 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:bg-red-500/[0.06]">
                <item.icon className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-red-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* nav links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={
                item.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="group relative text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-red-500"
            >
              {item.label}

              <span className="absolute -bottom-1 left-1/2 h-[2px] w-3/4 origin-center -translate-x-1/2 scale-x-0 rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

      </div>

      {/* giant background text */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-2 sm:-bottom-4 md:-bottom-10 lg:-bottom-10 flex justify-center overflow-hidden text-center">
        <span
          className="select-none whitespace-nowrap text-[4rem] sm:text-[5rem] md:text-[8rem] lg:text-[11rem] font-black leading-none tracking-[-0.08em] bg-gradient-to-b from-foreground/2 via-foreground/10 to-transparent bg-clip-text text-transparent">
          EDITRON
        </span>
      </div>

      {/* bottom shadow */}
      <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-background via-background/80 to-transparent blur-2xl" />

    </footer>
  );
}