import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Briefcase } from "lucide-react";

export function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com/piyushdotcomm", label: "GitHub" },
    { icon: Twitter, href: "https://x.com/Piyushhere_", label: "Twitter" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/piyushdotcom/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/piyush.here_/", label: "Instagram" },
    { icon: Briefcase, href: "https://portfolio-six-pearl-1xxunv669i.vercel.app/", label: "Portfolio" },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-background/50 backdrop-blur-xl py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-center gap-6">
        <div className="flex space-x-6">
          {socialLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group p-2 rounded-full hover:bg-muted transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Editron Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}