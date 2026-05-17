import { getTemplateSummariesWithMeta } from "@/lib/constants/template-summaries";
import { HomePageClient } from "@/components/marketing/home-page-client";

export default function Home() {
  const popularTemplates = getTemplateSummariesWithMeta()
    .filter((template) => template.popularity === 5)
    .slice(0, 4);

  // Schema Markup for AI SEO (Organization & SoftwareApplication)
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Editron",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Browser",
        description:
          "A browser-based code editor with AI assistance, WebContainers, and 40+ framework templates.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: "Editron",
        url: "https://editron.vercel.app", // Replace with your domain once active
        logo: "https://editron.vercel.app/logo.svg",
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20 overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <HomePageClient popularTemplates={popularTemplates} />
    </div>
  );
}
