
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TemplateKey } from "@/lib/template";
import {
  ChevronRight,
  Search,
  Check,
  Plus,
  Clock,
  Code,
  Server,
  Globe,
  Terminal,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { TemplateSummary } from "@/lib/templates/types";

const ICON_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3C/svg%3E";

// TemplateSelectionModal.tsx
type TemplateSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    template: TemplateKey;
    description?: string;
  }) => void;
};

const TemplateSelectionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: TemplateSelectionModalProps) => {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectName, setProjectName] = useState("");

  const [availableTemplates, setAvailableTemplates] = useState<TemplateSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/templates/meta')
      .then((r) => r.json())
      .then((data) => {
        if (mounted && Array.isArray(data)) setAvailableTemplates(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTemplates = availableTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const selectedTemplateSummary =
    availableTemplates.find((template) => template.id === selectedTemplate) ?? null;


  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      setStep("configure");
    }
  };

  const handleCreateProject = () => {
    if (selectedTemplate) {
      onSubmit({
        title: projectName || `New ${selectedTemplateSummary?.name || "Template"} Project`,
        template: selectedTemplate as TemplateKey,
        description: selectedTemplateSummary?.description,
      });

      onClose();
      // Reset state for next time
      setStep("select");
      setSelectedTemplate(null);
      setProjectName("");
    }
  };

  const handleBack = () => {
    setStep("select");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Reset state when closing
          setStep("select");
          setSelectedTemplate(null);
          setProjectName("");
        }
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#e93f3f] flex items-center gap-2">
                <Plus size={24} className="text-[#e93f3f]" />
                Select a Template
              </DialogTitle>
              <DialogDescription>
                Choose a template to create your new playground
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}  
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <RadioGroup
                value={selectedTemplate || ""}
                onValueChange={handleSelectTemplate}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`relative flex p-6 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02]
                        ${selectedTemplate === template.id
                            ? "border-[#E93F3F] shadow-[0_0_0_1px_#E93F3F,0_8px_20px_rgba(233,63,63,0.15)]"
                            : "hover:border-[#E93F3F] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                          }
                    `}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 left-2 bg-[#E93F3F] text-white rounded-full p-1">
                            <Check size={14} />
                          </div>
                        )}

                          <div className="flex gap-4">
                            <div
                              className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full"
                              style={getIconTileStyle(template.color)}
                            >
                              <IconWithFallback src={template.icon} alt={`${template.name} icon`} size={40} />
                            </div>

                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">
                                  {template.name}
                                </h3>
                                <div className="flex gap-1">
                                  {(template.category === "frontend") && <Code size={14} className="text-blue-500" />}
                                  {(template.category === "backend") && <Server size={14} className="text-green-500" />}
                                  {(template.category === "fullstack") && <Globe size={14} className="text-purple-500" />}
                                  {(template.category === "tooling") && <Terminal size={14} className="text-orange-500" />}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {template.description}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {template.tags?.slice(0,3).map((tag) => (
                                  <span key={tag} className="text-xs px-2 py-1 bg-muted/20 rounded-full text-muted-foreground">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                        <RadioGroupItem
                          value={template.id}
                          id={template.id}
                          className="sr-only"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center">
                      <Search size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">
                        No templates found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock size={14} className="mr-1" />
                <span>
                  Estimated setup time:{" "}
                  {selectedTemplate ? "2-5 minutes" : "Select a template"}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#E93F3F] hover:bg-[#d03636] text-white"
                  disabled={!selectedTemplate}
                  onClick={handleContinue}
                >
                  Continue <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#e93f3f]">
                Configure Your Project
              </DialogTitle>
              <DialogDescription>
                {selectedTemplateSummary?.name || "Selected template"} project configuration
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="p-4 shadow-[0_0_0_1px_#E93F3F,0_8px_20px_rgba(233,63,63,0.15)] rounded-lg border">
                <h3 className="font-medium mb-2">Selected Template</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplateSummary?.description || "Template details will appear here after selection."}
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                className="bg-[#E93F3F] hover:bg-[#d03636] text-white"
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;

function IconWithFallback({ src, alt, size = 28 }: { src?: string; alt?: string; size?: number }) {
  const [current, setCurrent] = useState(src || ICON_PLACEHOLDER);

  const tryFallback = () => {
    setCurrent(ICON_PLACEHOLDER);
  };

  return (
    <Image
      src={current}
      alt={alt ?? ""}
      width={size}
      height={size}
      className="object-contain"
      unoptimized
      onError={tryFallback}
    />
  );
}

function getIconTileStyle(color?: string): CSSProperties {
  if (!color) {
    return { backgroundColor: "rgba(233, 63, 63, 0.08)" };
  }

  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);

    return { backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.12)` };
  }

  return { backgroundColor: color };
}
