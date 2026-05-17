import { Sparkles } from "lucide-react";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { getTemplateSummariesWithMeta } from "@/lib/constants/template-summaries";
import { TemplateGrid } from "@/components/marketing/template-grid";

export default function TemplatesPage() {
    const availableTemplates = getTemplateSummariesWithMeta();

    return (
        <div className="min-h-screen bg-background">
            <AnimatedShaderBackground />

            {/* Header */}
            <div className="relative pt-32 pb-16 px-4 text-center space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-md mb-4">
                    <Sparkles size={14} className="mr-2" />
                    <span className="font-medium">35+ Production-Ready Templates</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                    Start with a <span className="text-primary">Superpower</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose from our curated collection of templates covering everything from simple static sites to full-stack AI applications.
                </p>
            </div>

            <TemplateGrid templates={availableTemplates} />
        </div>
    );
}
