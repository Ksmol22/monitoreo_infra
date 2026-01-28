import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useToast } from "primevue/usetoast";
import { api, buildUrl } from "@shared/routes";
import type { InsertSystem } from "@shared/schema";

export function useSystems() {
  return useQuery({
    queryKey: [api.systems.list.path],
    queryFn: async () => {
      const res = await fetch(api.systems.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch systems");
      return api.systems.list.responses[200].parse(await res.json());
    },
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
  const toast = useToast();

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
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "System created successfully",
        life: 3000,
      });
    },
    onError: (error: Error) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    },
  });
}
