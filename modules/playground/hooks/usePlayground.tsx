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
  isSuccess: boolean;
  error: string | null;
  loadPlayground: () => Promise<unknown>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess, error: queryError, refetch } = useQuery<PlaygroundQueryResult | null>({
    queryKey: ['playground', id],
    queryFn: async () => {
      if (!id) return null;

      const result = await getPlaygroundById(id);
      if (!result) throw new Error("Playground not found");

      return result as PlaygroundQueryResult;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: (newData: TemplateFolder) => {
      if (!id) throw new Error("Playground ID is required for saving");
      return SaveUpdatedCode(id, newData);
    },
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
    isSuccess,
    error: queryError ? (queryError as Error).message : null,
    loadPlayground: () => refetch(),
    saveTemplateData,
  };
};