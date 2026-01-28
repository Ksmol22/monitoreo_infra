import { useSystems } from "@/hooks/use-systems";
import { useMetrics } from "@/hooks/use-metrics";
import { Loader } from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Database, Users, HardDrive, Activity } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// Mock data for detail charts (would normally come from useMetrics history)
const connectionData = [
  { time: '10:00', value: 45 }, { time: '10:05', value: 52 },
  { time: '10:10', value: 48 }, { time: '10:15', value: 61 },
  { time: '10:20', value: 55 }, { time: '10:25', value: 67 },
];

const spaceData = [
  { name: 'Data', value: 75, color: '#3b82f6' },
  { name: 'Index', value: 15, color: '#10b981' },
  { name: 'Free', value: 10, color: '#e5e7eb' },
];

function DatabaseCard({ system }: { system: any }) {
  const { t } = useTranslation();
  // In a real app, we'd fetch specific metrics for this system ID
  // const { data: metrics } = useMetrics(system.id);
  
  // Simulated metric values
  const activeConn = Math.floor(Math.random() * 100);
  const blockedUsers = Math.floor(Math.random() * 5);
  const logSize = Math.floor(Math.random() * 500);

  return (
    <Card className="dashboard-card overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{system.name}</CardTitle>
              <CardDescription className="font-mono text-xs mt-1">{system.ipAddress}</CardDescription>
            </div>
          </div>
          <StatusBadge status={system.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t("databases.active_connections")}</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xl font-bold text-gray-900">{activeConn}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t("databases.blocked_users")}</span>
            <div className="flex items-center gap-2">
              <AlertCircleIcon className={`w-4 h-4 ${blockedUsers > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`text-xl font-bold ${blockedUsers > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {blockedUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase">{t("databases.active_connections")} (1H)</h4>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={connectionData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  <Tooltip cursor={false} contentStyle={{ fontSize: '12px' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase">{t("databases.tablespace_usage")}</h4>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
              <div style={{ width: '75%' }} className="bg-blue-500 h-full" title="Data: 75%"></div>
              <div style={{ width: '15%' }} className="bg-green-500 h-full" title="Index: 15%"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div> Data</span>
              <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Index</span>
              <span>10% Free</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
             <span className="text-gray-500">{t("databases.log_size")}</span>
             <span className="font-mono font-medium">{logSize} MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  )
}

export default function DatabaseList() {
  const { t } = useTranslation();
  const { data: systems, isLoading } = useSystems();
  
  if (isLoading) return <Loader />;
  
  const databases = systems?.filter(s => s.type === 'database') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("databases.title")}</h1>
        <p className="text-gray-500">Monitor database performance, connections, and storage.</p>
      </div>

      {databases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No databases found</h3>
          <p className="text-gray-500">Add a database system to start monitoring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {databases.map(db => (
            <DatabaseCard key={db.id} system={db} />
          ))}
        </div>
      )}
    </div>
  );
}
