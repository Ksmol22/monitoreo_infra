import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useLogs(systemId?: number, level?: string) {
  return useQuery({
    queryKey: [api.logs.list.path, systemId, level],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (systemId) params.append("systemId", systemId.toString());
      if (level) params.append("level", level);

      const res = await fetch(`${api.logs.list.path}?${params}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertLog) => {
      const res = await fetch(api.logs.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
    },
  });
}
