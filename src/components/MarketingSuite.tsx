import { motion } from "motion/react";
import { TrendingUp, Users, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const data = [
  { name: "Cycle 1", reach: 4000, conversion: 2400 },
  { name: "Cycle 2", reach: 3000, conversion: 1398 },
  { name: "Cycle 3", reach: 2000, conversion: 9800 },
  { name: "Cycle 4", reach: 2780, conversion: 3908 },
  { name: "Cycle 5", reach: 1890, conversion: 4800 },
  { name: "Cycle 6", reach: 2390, conversion: 3800 },
  { name: "Cycle 7", reach: 3490, conversion: 4300 },
];

const segmentData = [
  { name: "Gen Z", value: 45, color: "#00f2ff" },
  { name: "Millennials", value: 30, color: "#7000ff" },
  { name: "Gen X", value: 15, color: "#ff00e5" },
  { name: "Others", value: 10, color: "#ffffff" },
];

export const MarketingSuite = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-display font-bold">AI Marketing Suite</h2>
          <p className="text-nexus-text-dim mt-1">Predictive analytics and campaign optimization engine.</p>
        </div>
        <button className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-nexus-accent hover:text-black transition-all">
          <Zap className="w-4 h-4" />
          GENERATE CAMPAIGN
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Market Sentiment", value: "Positive", icon: Target, trend: "+8.2%", up: true },
          { label: "Customer LTV", value: "$1,240", icon: Users, trend: "+12.5%", up: true },
          { label: "Ad Efficiency", value: "94%", icon: BarChart3, trend: "-2.1%", up: false },
          { label: "Predicted Growth", value: "240%", icon: TrendingUp, trend: "+45%", up: true },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <stat.icon className="w-5 h-5 text-nexus-accent" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold",
                stat.up ? "text-green-400" : "text-red-400"
              )}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-nexus-text-dim text-xs uppercase tracking-widest font-mono">{stat.label}</p>
            <h3 className="text-2xl font-display font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nexus-accent" />
            Performance Forecasting
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f0f14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                itemStyle={{ fontSize: "12px" }}
              />
              <Area 
                type="monotone" 
                dataKey="reach" 
                stroke="#00f2ff" 
                fillOpacity={1} 
                fill="url(#colorReach)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-nexus-accent" />
            Audience Segmentation
          </h3>
          <div className="h-48 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={10} width={80} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {segmentData.map((segment, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="text-sm text-nexus-text-dim">{segment.name}</span>
                </div>
                <span className="text-sm font-mono">{segment.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h3 className="text-lg font-display font-semibold mb-4">AI Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Budget Allocation", desc: "Shift 15% of budget from Facebook to TikTok for 2.4x higher ROI.", action: "Apply Now" },
            { title: "Creative Refresh", desc: "Ad set 'Alpha-02' is showing fatigue. Generate new visual variants.", action: "Generate" },
          ].map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group">
              <div>
                <h4 className="text-sm font-bold text-nexus-accent">{rec.title}</h4>
                <p className="text-xs text-nexus-text-dim mt-1">{rec.desc}</p>
              </div>
              <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-nexus-accent/30 hover:bg-nexus-accent hover:text-black transition-all">
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { cn } from "@/src/lib/utils";
