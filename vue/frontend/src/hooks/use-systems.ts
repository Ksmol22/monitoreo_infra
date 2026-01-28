import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { System, InsertSystem } from "@shared/schema";

export function useSystems() {
  return useQuery({
    queryKey: [api.systems.list.path],
    queryFn: async () => {
      const res = await fetch(api.systems.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch systems");
      return api.systems.list.responses[200].parse(await res.json());
    },
    // Poll every 30 seconds for "real-time" status updates
    refetchInterval: 30000,
  });
}

export function useSystem(id: number) {
  return useQuery({
    queryKey: [api.systems.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.systems.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch system");
      return api.systems.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSystem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSystem) => {
      const res = await fetch(api.systems.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create system");
      }
      return api.systems.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.systems.list.path] });
      toast({
        title: "System Added",
        description: "The new infrastructure node has been registered.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSystem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertSystem>) => {
      const url = buildUrl(api.systems.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update system");
      return api.systems.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.systems.list.path] });
      toast({
        title: "System Updated",
        description: "Configuration changes saved successfully.",
      });
    },
  });
}
