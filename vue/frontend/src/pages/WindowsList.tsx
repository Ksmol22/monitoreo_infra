import { useSystems } from "@/hooks/use-systems";
import { Loader } from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Monitor, Cpu, Network, Server } from "lucide-react";
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

// Mock VMware Performance Data
const performanceData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  cpu: Math.floor(Math.random() * 40) + 10,
  ram: Math.floor(Math.random() * 30) + 40,
}));

function WindowsCard({ system }: { system: any }) {
  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{system.name}</CardTitle>
            <CardDescription className="text-xs">{system.ipAddress}</CardDescription>
          </div>
        </div>
        <StatusBadge status={system.status} />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">CPU LOAD</span>
            </div>
            <span className="text-lg font-bold">24%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">RAM USAGE</span>
            </div>
            <span className="text-lg font-bold">6.2 GB</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2">PERFORMANCE HISTORY</h4>
            <div className="h-32 border border-gray-100 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip labelStyle={{display: 'none'}} />
                  <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2">IIS SERVICES</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  W3SVC
                </span>
                <span className="text-green-600 text-xs font-medium">Running</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  IISADMIN
                </span>
                <span className="text-green-600 text-xs font-medium">Running</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Network className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-1">OPEN PORTS</span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">80</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">443</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">3389</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WindowsList() {
  const { data: systems, isLoading } = useSystems();
  
  if (isLoading) return <Loader />;
  
  const windowsSystems = systems?.filter(s => s.type === 'windows') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Windows Servers</h1>
        <p className="text-gray-500">IIS status, performance metrics and port monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {windowsSystems.map(sys => (
          <WindowsCard key={sys.id} system={sys} />
        ))}
      </div>
    </div>
  );
}
