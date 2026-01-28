import { useSystems } from "@/hooks/use-systems";
import { Loader } from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Server, Terminal, HardDrive, Clock } from "lucide-react";

function LinuxCard({ system }: { system: any }) {
  // Random mock data
  const loadAvg = (Math.random() * 2).toFixed(2);
  const diskUsed = Math.floor(Math.random() * 80) + 10;
  
  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{system.name}</CardTitle>
            <CardDescription className="text-xs">{system.ipAddress}</CardDescription>
          </div>
        </div>
        <StatusBadge status={system.status} />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Load Average</span>
            </div>
            <span className="font-mono font-bold text-gray-900">{loadAvg}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <HardDrive className="w-4 h-4" />
                <span>Disk Usage (/dev/sda1)</span>
              </div>
              <span className="text-xs font-bold">{diskUsed}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${diskUsed > 80 ? 'bg-red-500' : 'bg-orange-500'}`} 
                style={{ width: `${diskUsed}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Uptime: <span className="font-medium text-gray-900">14 days, 3 hours</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LinuxList() {
  const { data: systems, isLoading } = useSystems();
  
  if (isLoading) return <Loader />;
  
  const linuxSystems = systems?.filter(s => s.type === 'linux') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Linux Servers</h1>
        <p className="text-gray-500">System load, disk usage and health metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {linuxSystems.map(sys => (
          <LinuxCard key={sys.id} system={sys} />
        ))}
      </div>
    </div>
  );
}
