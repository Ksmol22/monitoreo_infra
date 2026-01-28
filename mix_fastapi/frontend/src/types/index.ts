export interface System {
  id: number
  name: string
  type: 'linux' | 'windows' | 'database'
  ip_address: string
  status: 'online' | 'offline' | 'warning'
  version?: string
  last_seen: string
  created_at: string
}

export interface Metric {
  id: number
  system: number
  system_name: string
  system_type: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  timestamp: string
}

export interface Log {
  id: number
  system: number
  system_name: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  source?: string
  timestamp: string
}

export interface DashboardStats {
  total_systems: number
  online_systems: number
  warning_systems: number
  offline_systems: number
  systems_by_type: Record<string, number>
  recent_logs: Log[]
  avg_cpu_usage: number
  avg_memory_usage: number
  avg_disk_usage: number
}
