import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneCall, 
  PhoneOutgoing, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  MoreVertical,
  User,
  Calendar,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Zap,
  X,
  Target
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

interface CallbackRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: "Pending" | "In-Progress" | "Completed" | "Missed";
  requestedTime: string;
  priority: "High" | "Medium" | "Low";
  source: string;
  notes: string;
  createdAt: string;
}

const INITIAL_CALLBACKS: CallbackRequest[] = [
  {
    id: "CB-001",
    customerName: "Alex Rivera",
    phoneNumber: "+1 (555) 012-3456",
    status: "Pending",
    requestedTime: "14:30",
    priority: "High",
    source: "Landing Page",
    notes: "Interested in Enterprise licensing.",
    createdAt: "2026-04-22T08:00:00Z"
  },
  {
    id: "CB-002",
    customerName: "Sarah Chen",
    phoneNumber: "+1 (555) 987-6543",
    status: "In-Progress",
    requestedTime: "15:00",
    priority: "Medium",
    source: "Pricing Page",
    notes: "Question about API limits.",
    createdAt: "2026-04-22T09:15:00Z"
  },
  {
    id: "CB-003",
    customerName: "Marcus Thorne",
    phoneNumber: "+44 20 7946 0123",
    status: "Completed",
    requestedTime: "10:00",
    priority: "Low",
    source: "Support Bot",
    notes: "Resolution confirmed. System architect follow-up.",
    createdAt: "2026-04-22T07:30:00Z"
  },
  {
    id: "CB-004",
    customerName: "Elena Rodriguez",
    phoneNumber: "+34 912 345 678",
    status: "Missed",
    requestedTime: "09:00",
    priority: "High",
    source: "Mobile App",
    notes: "Requires urgent technical consultation regarding cross-border payments.",
    createdAt: "2026-04-21T18:00:00Z"
  }
];

const COLORS = ["#00f2ff", "#7000ff", "#ff00e5", "#ffffff"];

export const SalesIntelligence = () => {
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>(INITIAL_CALLBACKS);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCallback, setIsAddingCallback] = useState(false);
  const [newCallback, setNewCallback] = useState<Partial<CallbackRequest>>({
    priority: "Medium",
    status: "Pending",
    source: "Manual Entry"
  });

  const filteredCallbacks = useMemo(() => {
    return callbacks.filter(cb => {
      const matchesSearch = cb.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           cb.phoneNumber.includes(searchQuery);
      const matchesStatus = filter === "All" || cb.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [callbacks, searchQuery, filter]);

  const chartData = useMemo(() => {
    const counts = callbacks.reduce((acc, cb) => {
      acc[cb.status] = (acc[cb.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [callbacks]);

  const updateStatus = (id: string, status: CallbackRequest["status"]) => {
    setCallbacks(prev => prev.map(cb => cb.id === id ? { ...cb, status } : cb));
  };

  const addCallback = () => {
    if (!newCallback.customerName || !newCallback.phoneNumber) return;
    const callback: CallbackRequest = {
      id: `CB-00${callbacks.length + 1}`,
      customerName: newCallback.customerName!,
      phoneNumber: newCallback.phoneNumber!,
      status: "Pending",
      requestedTime: newCallback.requestedTime || "ASAP",
      priority: newCallback.priority || "Medium",
      source: "NEURAL HUB",
      notes: newCallback.notes || "",
      createdAt: new Date().toISOString()
    };
    setCallbacks([callback, ...callbacks]);
    setIsAddingCallback(false);
    setNewCallback({ priority: "Medium", status: "Pending", source: "Manual Entry" });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight neon-text">SALES INTELLIGENCE</h1>
          <p className="text-nexus-text-dim mt-2">Neural Lead Management & Call-Back Matrix</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-text-dim" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-nexus-accent/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAddingCallback(true)}
            className="px-4 py-2 bg-nexus-accent text-black font-bold rounded-xl flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-nexus-accent/20"
          >
            <Plus className="w-4 h-4" />
            NEW REQUEST
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Total Requests", value: callbacks.length, icon: PhoneCall, color: "text-blue-400" },
            { label: "High Priority", value: callbacks.filter(c => c.priority === "High").length, icon: AlertCircle, color: "text-red-400" },
            { label: "Avg Response", value: "8.4m", icon: Clock, color: "text-nexus-accent" },
            { label: "Conversion", value: "24%", icon: TrendingUp, color: "text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <p className="text-nexus-text-dim text-xs font-mono uppercase tracking-widest">{stat.label}</p>
              <h3 className={cn("text-2xl font-bold mt-2", stat.color)}>{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[200px]">
          <h4 className="text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest mb-4">Neural Status Distribution</h4>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
        {["All", "Pending", "In-Progress", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              filter === s ? "bg-nexus-accent text-black shadow-lg shadow-nexus-accent/20" : "text-nexus-text-dim hover:text-white"
            )}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest">Lead Entity</th>
              <th className="px-6 py-4 text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest">Optimal Time</th>
              <th className="px-6 py-4 text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-mono text-nexus-text-dim uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredCallbacks.map((cb) => (
                <motion.tr 
                  key={cb.id} 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center text-nexus-accent">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{cb.customerName}</p>
                        <p className="text-xs text-nexus-text-dim font-mono">{cb.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      cb.status === "Pending" && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                      cb.status === "In-Progress" && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                      cb.status === "Completed" && "bg-green-500/10 text-green-500 border border-green-500/20",
                      cb.status === "Missed" && "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {cb.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-nexus-text-dim">
                      <Clock className="w-3 h-3 text-nexus-accent" />
                      <span className="text-xs font-mono">{cb.requestedTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                      cb.priority === "High" ? "border-red-500/30 text-red-400" : 
                      cb.priority === "Medium" ? "border-blue-500/30 text-blue-400" : "border-white/10 text-nexus-text-dim"
                    )}>
                      {cb.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateStatus(cb.id, "In-Progress")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Commence Call"
                      >
                        <PhoneOutgoing className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(cb.id, "Completed")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-green-400 transition-colors"
                        title="Mark Resolved"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-nexus-text-dim transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredCallbacks.length === 0 && (
          <div className="p-12 text-center text-nexus-text-dim">
            <Search className="w-12 h-12 mx-auto opacity-20 mb-4" />
            <p>No neural patterns detected matching your parameters.</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isAddingCallback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCallback(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    <PhonePlus className="w-5 h-5 text-nexus-accent" />
                    Neural Call-Back Entry
                  </h3>
                  <button onClick={() => setIsAddingCallback(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-nexus-text-dim uppercase">Lead Name</label>
                    <input 
                      type="text"
                      value={newCallback.customerName || ""}
                      onChange={(e) => setNewCallback({ ...newCallback, customerName: e.target.value })}
                      placeholder="e.g. Elon Dusk"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nexus-accent/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-nexus-text-dim uppercase">Phone Vector</label>
                    <input 
                      type="text"
                      value={newCallback.phoneNumber || ""}
                      onChange={(e) => setNewCallback({ ...newCallback, phoneNumber: e.target.value })}
                      placeholder="+1 (000) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nexus-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-nexus-text-dim uppercase">Scheduled Time</label>
                    <input 
                      type="time"
                      value={newCallback.requestedTime || ""}
                      onChange={(e) => setNewCallback({ ...newCallback, requestedTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nexus-accent/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-nexus-text-dim uppercase">Priority Tier</label>
                    <select 
                      value={newCallback.priority}
                      onChange={(e) => setNewCallback({ ...newCallback, priority: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nexus-accent/50 transition-colors cursor-pointer"
                    >
                      <option value="High">HIGH ALERT</option>
                      <option value="Medium">STANDARD</option>
                      <option value="Low">RELAXED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-nexus-text-dim uppercase">Internal Briefing</label>
                  <textarea 
                    value={newCallback.notes || ""}
                    onChange={(e) => setNewCallback({ ...newCallback, notes: e.target.value })}
                    placeholder="Enter context for the call..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none h-24 resize-none focus:border-nexus-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setIsAddingCallback(false)}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  ABORT
                </button>
                <button 
                  onClick={addCallback}
                  className="flex-1 px-6 py-3 bg-nexus-accent text-black font-bold rounded-xl text-sm hover:bg-white transition-all shadow-lg shadow-nexus-accent/20"
                >
                  INITIALIZE PROTOCOL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PhonePlus = (props: any) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    <line x1="19" y1="5" x2="19" y2="11" />
    <line x1="16" y1="8" x2="22" y2="8" />
  </svg>
);
