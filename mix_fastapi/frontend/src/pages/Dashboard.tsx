import { useSystems } from "@/hooks/use-systems";
import { MetricCard } from "@/components/MetricCard";
import { Loader } from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { Activity, Database, Server, Monitor, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AddSystemDialog } from "@/components/AddSystemDialog";

// Mock data for the aggregate chart since we don't have historical aggregates yet
const healthData = [
  { time: '00:00', score: 98 },
  { time: '04:00', score: 96 },
  { time: '08:00', score: 92 },
  { time: '12:00', score: 95 },
  { time: '16:00', score: 89 },
  { time: '20:00', score: 94 },
  { time: '24:00', score: 97 },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: systems, isLoading } = useSystems();

  if (isLoading) return <Loader />;

  const total = systems?.length || 0;
  const online = systems?.filter(s => s.status === 'online').length || 0;
  const warnings = systems?.filter(s => s.status === 'warning').length || 0;
  const offline = systems?.filter(s => s.status === 'offline').length || 0;

  const dbCount = systems?.filter(s => s.type === 'database').length || 0;
  const winCount = systems?.filter(s => s.type === 'windows').length || 0;
  const linCount = systems?.filter(s => s.type === 'linux').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("dashboard.title")}</h1>
          <p className="text-gray-500 mt-1">{t("dashboard.overview")}</p>
        </div>
        <AddSystemDialog />
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t("dashboard.health_score")} 
          value={`${Math.round((online / total) * 100) || 0}%`} 
          icon={Activity}
          trend="up"
          trendValue="2.5%"
          subtitle="Aggregate uptime score"
        />
        <MetricCard 
          title={t("dashboard.active_systems")} 
          value={online} 
          icon={CheckCircle}
          className="border-l-green-500 hover:border-l-green-600"
          subtitle={`${total} total nodes monitored`}
        />
        <MetricCard 
          title={t("common.warning")} 
          value={warnings} 
          icon={AlertCircle}
          className="border-l-yellow-500 hover:border-l-yellow-600"
          subtitle="Requires attention"
        />
        <MetricCard 
          title={t("dashboard.critical_alerts")} 
          value={offline} 
          icon={Clock}
          className="border-l-red-500 hover:border-l-red-600"
          subtitle="Services down"
        />
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Health Chart */}
        <Card className="lg:col-span-2 dashboard-card">
          <CardHeader>
            <CardTitle>Infrastructure Health Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC0000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EC0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#EC0000" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution */}
        <div className="space-y-6">
          <Card className="dashboard-card h-full">
            <CardHeader>
              <CardTitle>System Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-700">Databases</span>
                  </div>
                  <span className="font-bold text-gray-900">{dbCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Monitor className="w-5 h-5 text-indigo-600 mr-3" />
                    <span className="font-medium text-gray-700">Windows</span>
                  </div>
                  <span className="font-bold text-gray-900">{winCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Server className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="font-medium text-gray-700">Linux</span>
                  </div>
                  <span className="font-bold text-gray-900">{linCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Infrastructure Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">System Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">IP Address</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {systems?.slice(0, 5).map((sys) => (
                  <tr key={sys.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{sys.name}</td>
                    <td className="px-4 py-3 capitalize">{sys.type}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{sys.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-500">{sys.version}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sys.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!systems || systems.length === 0) && (
              <div className="p-8 text-center text-gray-500">No systems registered.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
