
"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TemplateFolder } from '../lib/path-to-json';
import { getPlaygroundById, SaveUpdatedCode } from '../actions';

interface PlaygroundData {
  id: string;
  title?: string;
  [key: string]: unknown;
}

interface PlaygroundQueryResult {
  playgroundData: PlaygroundData;
  templateData: TemplateFolder | null;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => void;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError, refetch } = useQuery<PlaygroundQueryResult | null>({
    queryKey: ['playground', id],
    queryFn: async () => {
      if (!id) return null;

      const data = await getPlaygroundById(id);
      if (!data) throw new Error("Playground not found");

      const playgroundData = data as unknown as PlaygroundData;
      let templateData: TemplateFolder | null = null;

      const rawContent = data?.templateFiles?.[0]?.content;
      if (rawContent) {
        // Content can be a JSON string or an already-parsed object (Prisma Json type)
        templateData = typeof rawContent === "string"
          ? JSON.parse(rawContent)
          : rawContent;
        toast.success("Playground loaded successfully");
      } else {
        // Load template from API if not in saved content
        const res = await fetch(`/api/template/${id}`);
        if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

        const templateRes = await res.json();
        if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
          templateData = {
            folderName: "Root",
            items: templateRes.templateJson,
          };
        } else {
          templateData = templateRes.templateJson || {
            folderName: "Root",
            items: [],
          };
        }
        toast.success("Template loaded successfully");
      }

      return { playgroundData, templateData };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: (newData: TemplateFolder) => SaveUpdatedCode(id, newData),
    onSuccess: (_, newData) => {
      // Update the cache with the new template data
      queryClient.setQueryData<PlaygroundQueryResult | null>(['playground', id], (old) => {
        if (!old) return old;
        return {
          ...old,
          templateData: newData
        };
      });
      toast.success("Changes saved successfully");
    },
    onError: (error) => {
      console.error("Error saving template data:", error);
      toast.error("Failed to save changes");
    }
  });

  const saveTemplateData = useCallback(async (data: TemplateFolder) => {
    await saveMutation.mutateAsync(data);
  }, [saveMutation]);

  return {
    playgroundData: data?.playgroundData ?? null,
    templateData: data?.templateData ?? null,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    loadPlayground: () => { refetch(); },
    saveTemplateData,
  };
};