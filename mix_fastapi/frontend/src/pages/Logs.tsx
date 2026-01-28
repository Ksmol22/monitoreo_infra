import { useLogs, useCreateLog } from "@/hooks/use-logs";
import { useSystems } from "@/hooks/use-systems";
import { Loader } from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useState } from "react";
import { Check, Filter, X } from "lucide-react";
import { format } from "date-fns";

export default function Logs() {
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  
  const { data: logs, isLoading: logsLoading } = useLogs(
    selectedSystem !== "all" ? parseInt(selectedSystem) : undefined,
    selectedLevel !== "all" ? selectedLevel : undefined
  );
  
  const { data: systems } = useSystems();

  // Mock resolve functionality (would be a mutation)
  const handleResolve = (id: number) => {
    console.log("Resolving log", id);
  };

  if (logsLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500">Centralized logging and error tracking.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by System" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              {systems?.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          {(selectedSystem !== "all" || selectedLevel !== "all") && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setSelectedSystem("all");
                setSelectedLevel("all");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="dashboard-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Level</TableHead>
                <TableHead className="w-[150px]">System</TableHead>
                <TableHead className="w-[120px]">Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No logs found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => {
                  const systemName = systems?.find(s => s.id === log.systemId)?.name || 'Unknown';
                  return (
                    <TableRow key={log.id} className={log.level === 'error' ? 'bg-red-50/30' : ''}>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {log.timestamp ? format(new Date(log.timestamp), 'PP pp') : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                          ${log.level === 'error' ? 'bg-red-100 text-red-800' : 
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {log.level}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{systemName}</TableCell>
                      <TableCell className="text-gray-500">{log.source}</TableCell>
                      <TableCell className="text-gray-700">{log.message}</TableCell>
                      <TableCell className="text-right">
                        {!log.isResolved && log.level !== 'info' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs border-green-200 hover:bg-green-50 text-green-700"
                            onClick={() => handleResolve(log.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
