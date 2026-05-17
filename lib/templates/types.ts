export type TemplateCategory = "frontend" | "backend" | "fullstack" | "tooling";

export interface TemplateOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    popularity: number;
    tags: string[];
    features: string[];
    category: TemplateCategory;
}

export interface TemplateMetadata {
    id?: string;
    title?: string;
    description?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    popularity?: number;
    category?: TemplateCategory;
}

export interface TemplateSummary {
    id: string;
    name: string;
    description: string;
    icon: string;
    color?: string;
    popularity?: number;
    tags?: string[];
    category?: TemplateCategory;
}
