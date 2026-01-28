import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertMetric } from "@shared/schema";

export function useMetrics(systemId?: number) {
  return useQuery({
    queryKey: [api.metrics.list.path, systemId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (systemId) params.append("systemId", systemId.toString());
      
      const res = await fetch(`${api.metrics.list.path}?${params}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return api.metrics.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Frequent polling for metrics
  });
}

// Helper to simulate pushing metrics for demo purposes
export function useCreateMetric() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertMetric) => {
      const res = await fetch(api.metrics.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to push metric");
      return api.metrics.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.metrics.list.path, variables.systemId] 
      });
    },
  });
}
