import { motion } from "motion/react";
import { 
  Cloud, 
  CheckCircle2, 
  Clock, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Shield, 
  Zap,
  Server,
  Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Deployment {
  id: string;
  name: string;
  type: "Website" | "Social" | "Document" | "Campaign";
  status: "Live" | "Syncing" | "Pending";
  url: string;
  timestamp: string;
  performance: string;
}

const MOCK_DEPLOYMENTS: Deployment[] = [
  { 
    id: "1", 
    name: "Quantum Portfolio", 
    type: "Website", 
    status: "Live", 
    url: "https://quantum-port.nexus.one", 
    timestamp: "2 hours ago",
    performance: "99.9% Uptime"
  },
  { 
    id: "2", 
    name: "Neural Launch Campaign", 
    type: "Campaign", 
    status: "Syncing", 
    url: "https://ads.nexus.one/neural-launch", 
    timestamp: "15 mins ago",
    performance: "Syncing Nodes..."
  },
  { 
    id: "3", 
    name: "Service Agreement v2", 
    type: "Document", 
    status: "Live", 
    url: "https://docs.nexus.one/sa-v2", 
    timestamp: "Yesterday",
    performance: "Signed by 12"
  },
  { 
    id: "4", 
    name: "Omni-Platform Blast", 
    type: "Social", 
    status: "Pending", 
    url: "https://social.nexus.one/blast-04", 
    timestamp: "Scheduled: 14:00",
    performance: "Ready for Broadcast"
  }
];

export const DeploymentHub = () => {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-nexus-accent/20 flex items-center justify-center border border-nexus-accent/30 neon-glow">
              <Cloud className="w-6 h-6 text-nexus-accent" />
            </div>
            <h2 className="text-3xl font-display font-bold">Neural Deployment Hub</h2>
          </div>
          <p className="text-nexus-text-dim">Real-time monitoring of all live assets across the digital universe.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
            <Server className="w-4 h-4 text-nexus-accent" />
            <div className="text-left">
              <p className="text-[10px] text-nexus-text-dim uppercase font-mono">Global Nodes</p>
              <p className="text-xs font-bold">128 ACTIVE</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-nexus-accent text-black font-bold rounded-xl flex items-center gap-2 hover:bg-white transition-all">
            <RefreshCw className="w-4 h-4" />
            SYNC ALL
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Live Assets", value: "42", icon: Globe },
          { label: "Deployment Success", value: "99.8%", icon: Shield },
          { label: "Avg. Sync Speed", value: "120ms", icon: Zap },
          { label: "System Health", value: "OPTIMAL", icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border-white/5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-nexus-accent" />
              <span className="text-[10px] font-mono text-nexus-text-dim">REAL-TIME</span>
            </div>
            <p className="text-xs text-nexus-text-dim uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-display font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-nexus-accent" />
            Active Deployments
          </h3>
          <div className="flex gap-2">
            {["All", "Websites", "Social", "Docs"].map((filter) => (
              <button key={filter} className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors">
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Last Sync</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_DEPLOYMENTS.map((dep) => (
                <tr key={dep.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-nexus-text-dim" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{dep.name}</p>
                        <p className="text-[10px] text-nexus-text-dim font-mono">{dep.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-nexus-text-dim uppercase tracking-widest">
                      {dep.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        dep.status === "Live" ? "bg-green-500" : dep.status === "Syncing" ? "bg-nexus-accent" : "bg-yellow-500"
                      )} />
                      <span className={cn(
                        "text-xs font-bold",
                        dep.status === "Live" ? "text-green-500" : dep.status === "Syncing" ? "text-nexus-accent" : "text-yellow-500"
                      )}>
                        {dep.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-nexus-text-dim">{dep.performance}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-nexus-text-dim">{dep.timestamp}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-nexus-accent/10 text-nexus-text-dim hover:text-nexus-accent transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-nexus-accent/10 text-nexus-text-dim hover:text-nexus-accent transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-3xl border-white/5">
          <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-nexus-accent" />
            Neural Deployment Log
          </h3>
          <div className="space-y-4 font-mono text-[10px]">
            {[
              { time: "10:42:12", msg: "Quantum Portfolio: Node synchronization complete.", status: "SUCCESS" },
              { time: "10:40:05", msg: "Neural Launch Campaign: Propagating to edge nodes...", status: "PENDING" },
              { time: "10:35:58", msg: "Service Agreement v2: SSL certificate verified.", status: "SUCCESS" },
              { time: "10:30:22", msg: "Omni-Platform Blast: Queueing 1.2M neural packets.", status: "INFO" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-nexus-accent">
                <span className="text-nexus-text-dim shrink-0">{log.time}</span>
                <span className="flex-1">{log.msg}</span>
                <span className={cn(
                  "font-bold",
                  log.status === "SUCCESS" ? "text-green-500" : log.status === "PENDING" ? "text-nexus-accent" : "text-blue-400"
                )}>[{log.status}]</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-nexus-accent/5 animate-pulse" />
          <Cloud className="w-16 h-16 text-nexus-accent/20 mb-4" />
          <h3 className="text-xl font-display font-bold mb-2">Global Edge Network</h3>
          <p className="text-nexus-text-dim text-sm max-w-xs mb-6">
            Your assets are distributed across 128 neural edge nodes for zero-latency access worldwide.
          </p>
          <div className="flex gap-4">
            <div className="text-left">
              <p className="text-[10px] text-nexus-text-dim uppercase font-mono">Latency</p>
              <p className="text-lg font-bold">12ms</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-left">
              <p className="text-[10px] text-nexus-text-dim uppercase font-mono">Throughput</p>
              <p className="text-lg font-bold">8.4 GB/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
