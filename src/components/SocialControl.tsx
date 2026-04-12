import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Share2, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Plus, 
  Calendar, 
  BarChart2, 
  Zap, 
  MessageSquare,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Film,
  Trash2,
  UploadCloud,
  TrendingUp,
  Users,
  Eye,
  ChevronDown,
  Filter,
  Sparkles,
  Loader2,
  Settings2,
  Maximize2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { GoogleGenAI } from "@google/genai";
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

interface ScheduledPost {
  id: string;
  time: string;
  title: string;
  platforms: any[];
  status: "Ready" | "AI Generating" | "Scheduled" | "Draft";
  media?: { url: string; type: "image" | "video" }[];
  platformConfigs?: Record<string, any>;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "twitter", name: "Twitter / X", icon: Twitter, color: "text-blue-400" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
];

const ANALYTICS_DATA = [
  { date: "Apr 01", reach: 4500, engagement: 1200, growth: 120 },
  { date: "Apr 02", reach: 5200, engagement: 1500, growth: 150 },
  { date: "Apr 03", reach: 4800, engagement: 1100, growth: 90 },
  { date: "Apr 04", reach: 6100, engagement: 1800, growth: 210 },
  { date: "Apr 05", reach: 5900, engagement: 1700, growth: 180 },
  { date: "Apr 06", reach: 7200, engagement: 2200, growth: 280 },
  { date: "Apr 07", reach: 8500, engagement: 2800, growth: 350 },
];

export const SocialControl = () => {
  const [activeTab, setActiveTab] = useState<"control" | "analytics">("control");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([
    { id: "1", time: "Today, 18:00", title: "Product Launch Teaser", platforms: [Instagram, Twitter], status: "Ready" },
    { id: "2", time: "Tomorrow, 10:00", title: "Customer Success Story", platforms: [Linkedin, Facebook], status: "AI Generating" },
    { id: "3", time: "Monday, 09:00", title: "Weekly Tech Roundup", platforms: [Twitter, Linkedin], status: "Scheduled" },
  ]);

  // Analytics Filters
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  // Form State
  const [newPostTitle, setNewPostTitle] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, any>>({
    twitter: { charLimit: 280, thread: false },
    instagram: { ratio: "1:1", autoCrop: true },
    linkedin: { visibility: "Anyone" },
    facebook: { audience: "Public" }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAICaption = async () => {
    if (!newPostTitle && attachedMedia.length === 0) return;
    
    setIsGeneratingCaption(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Generate a short, engaging social media caption for a post with the following title/context: "${newPostTitle}". 
      ${attachedMedia.length > 0 ? `The post includes ${attachedMedia.length} media assets.` : ""}
      The tone should be futuristic, professional, and slightly hype-driven. Include 2-3 relevant hashtags.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are the NEXUS ONE Social Media AI. You generate high-engagement captions that are futuristic and professional."
        }
      });

      const text = response.text || "";
      setNewPostTitle(text.trim());
    } catch (error) {
      console.error("AI Caption Error:", error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSave = (status: "Scheduled" | "Draft") => {
    if (!newPostTitle || selectedPlatforms.length === 0) return;
    if (status === "Scheduled" && (!scheduleDate || !scheduleTime)) return;

    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPostTitle,
      time: status === "Draft" ? "Not Scheduled" : `${scheduleDate}, ${scheduleTime}`,
      platforms: PLATFORMS.filter(p => selectedPlatforms.includes(p.id)).map(p => p.icon),
      status,
      media: attachedMedia,
      platformConfigs: { ...platformConfigs }
    };

    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    // Reset form
    setNewPostTitle("");
    setSelectedPlatforms([]);
    setScheduleDate("");
    setScheduleTime("");
    setAttachedMedia([]);
    setPlatformConfigs({
      twitter: { charLimit: 280, thread: false },
      instagram: { ratio: "1:1", autoCrop: true },
      linkedin: { visibility: "Anyone" },
      facebook: { audience: "Public" }
    });
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("video") ? "video" : "image";
      setAttachedMedia(prev => [...prev, { url, type }]);
    });
  };

  const removeMedia = (index: number) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto relative">
      <header className="flex justify-between items-end">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-display font-bold">Omni-Platform Control</h2>
            <p className="text-nexus-text-dim mt-1">Unified social media management and auto-engagement.</p>
          </div>
          
          <div className="flex p-1 bg-white/5 rounded-xl w-fit border border-white/5">
            <button 
              onClick={() => setActiveTab("control")}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "control" ? "bg-nexus-accent text-black" : "text-nexus-text-dim hover:text-white"
              )}
            >
              CONTROL CENTER
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "analytics" ? "bg-nexus-accent text-black" : "text-nexus-text-dim hover:text-white"
              )}
            >
              ANALYTICS
            </button>
          </div>
        </div>
        
        {activeTab === "control" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-nexus-accent text-black font-bold rounded-xl flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-nexus-accent/20"
          >
            <Plus className="w-4 h-4" />
            NEW POST
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "control" ? (
          <motion.div 
            key="control"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PLATFORMS.map((platform, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg bg-white/5", platform.color)}>
                    <platform.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{platform.name}</p>
                    <p className="text-[10px] text-nexus-text-dim uppercase tracking-widest">Connected</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-nexus-accent" />
                    Content Queue
                  </h3>
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {posts.map((post) => (
                        <motion.div 
                          key={post.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-nexus-accent/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-nexus-accent/10 flex items-center justify-center relative overflow-hidden">
                              {post.media && post.media.length > 0 ? (
                                post.media[0].type === "image" ? (
                                  <img src={post.media[0].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-nexus-accent/20">
                                    <Film className="w-5 h-5 text-nexus-accent" />
                                  </div>
                                )
                              ) : (
                                <Zap className="w-6 h-6 text-nexus-accent" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">{post.title}</h4>
                              <p className="text-xs text-nexus-text-dim mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {post.platforms.map((Icon, j) => (
                                <div key={j} className="w-6 h-6 rounded-full bg-nexus-bg border border-nexus-border flex items-center justify-center">
                                  <Icon className="w-3 h-3 text-nexus-text-dim" />
                                </div>
                              ))}
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest",
                              post.status === "Ready" ? "bg-green-500/10 text-green-500" : 
                              post.status === "Draft" ? "bg-white/10 text-nexus-text-dim" :
                              "bg-nexus-accent/10 text-nexus-accent"
                            )}>
                              {post.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-nexus-accent" />
                    Engagement Pulse
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "Total Interactions", value: "42.5K", trend: "+12%" },
                      { label: "Avg. Response Time", value: "1.2m", trend: "-15%" },
                      { label: "Sentiment Score", value: "98/100", trend: "+2%" },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-xs text-nexus-text-dim uppercase tracking-widest">{stat.label}</p>
                          <span className="text-xs font-bold text-green-400">{stat.trend}</span>
                        </div>
                        <p className="text-2xl font-display font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-nexus-accent" />
                    AI Auto-Engagement
                  </h3>
                  <p className="text-xs text-nexus-text-dim mb-4 leading-relaxed">
                    The AI is currently monitoring 12 active threads and responding to common inquiries using your brand voice.
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-nexus-accent/5 border border-nexus-accent/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                    <span className="text-[10px] font-bold text-nexus-accent">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Analytics Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between glass p-4 rounded-2xl">
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedPlatform("all")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    selectedPlatform === "all" ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent" : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-white/20"
                  )}
                >
                  ALL PLATFORMS
                </button>
                {PLATFORMS.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                      selectedPlatform === p.id ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent" : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-white/20"
                    )}
                  >
                    <p.icon className="w-3 h-3" />
                    {p.name.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                {["7d", "30d", "90d"].map(range => (
                  <button 
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      dateRange === range ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent" : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-white/20"
                    )}
                  >
                    LAST {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Reach", value: "1.2M", trend: "+18.4%", icon: Eye, color: "text-blue-400" },
                { label: "Engagement Rate", value: "4.8%", trend: "+2.1%", icon: Zap, color: "text-nexus-accent" },
                { label: "Follower Growth", value: "+12.4K", trend: "+5.2%", icon: Users, color: "text-purple-400" },
              ].map((metric, i) => (
                <div key={i} className="glass p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <metric.icon className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl bg-white/5", metric.color)}>
                      <metric.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-xs text-nexus-text-dim uppercase tracking-widest mb-1">{metric.label}</p>
                  <h4 className="text-3xl font-display font-bold">{metric.value}</h4>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-nexus-accent" />
                    Growth Trajectory
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-nexus-text-dim">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-nexus-accent" />
                      Reach
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Engagement
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#ffffff30" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff30" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0a0a0c", border: "1px solid #ffffff10", borderRadius: "12px" }}
                        itemStyle={{ fontSize: "12px" }}
                      />
                      <Area type="monotone" dataKey="reach" stroke="#00f2ff" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} />
                      <Area type="monotone" dataKey="engagement" stroke="#a855f7" fillOpacity={1} fill="url(#colorEngage)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl">
                <h3 className="text-lg font-display font-semibold mb-8 flex items-center gap-2">
                  <Users className="w-5 h-5 text-nexus-accent" />
                  Follower Acquisition
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#ffffff30" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff30" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: "#ffffff05" }}
                        contentStyle={{ backgroundColor: "#0a0a0c", border: "1px solid #ffffff10", borderRadius: "12px" }}
                        itemStyle={{ fontSize: "12px" }}
                      />
                      <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                        {ANALYTICS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === ANALYTICS_DATA.length - 1 ? "#00f2ff" : "#ffffff10"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-nexus-border flex justify-between items-center bg-gradient-to-r from-nexus-accent/5 to-transparent shrink-0">
                <h3 className="text-xl font-display font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-nexus-accent" />
                  Schedule Neural Post
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest block">Post Content / Title</label>
                    <button 
                      onClick={generateAICaption}
                      disabled={isGeneratingCaption || (!newPostTitle && attachedMedia.length === 0)}
                      className="flex items-center gap-2 text-[10px] font-bold text-nexus-accent hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isGeneratingCaption ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      AI GENERATE CAPTION
                    </button>
                  </div>
                  <textarea 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's the message for the digital universe?"
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-nexus-accent/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Media Assets</label>
                  <div className="grid grid-cols-4 gap-3">
                    {attachedMedia.map((media, i) => (
                      <div key={i} className="aspect-square rounded-xl glass relative group overflow-hidden border-nexus-accent/20">
                        {media.type === "image" ? (
                          <img src={media.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-nexus-accent/10">
                            <Film className="w-6 h-6 text-nexus-accent" />
                          </div>
                        )}
                        <button 
                          onClick={() => removeMedia(i)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {attachedMedia.length < 4 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-nexus-accent/50 hover:bg-nexus-accent/5 transition-all flex flex-col items-center justify-center gap-2 text-nexus-text-dim hover:text-nexus-accent"
                      >
                        <UploadCloud className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Select Platforms</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                          selectedPlatforms.includes(platform.id)
                            ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent"
                            : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-white/20"
                        )}
                      >
                        <platform.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{platform.name}</span>
                        {selectedPlatforms.includes(platform.id) && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Date</label>
                    <input 
                      type="date" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-nexus-accent/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Time</label>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-nexus-accent/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {selectedPlatforms.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest block">Neural Platform Configs</label>
                    <div className="space-y-3">
                      {selectedPlatforms.includes("twitter") && (
                        <div className="p-4 rounded-2xl bg-blue-400/5 border border-blue-400/10 space-y-3">
                          <div className="flex items-center gap-2 text-blue-400">
                            <Twitter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Twitter / X Settings</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-nexus-text-dim uppercase">Character Limit</span>
                            <select 
                              value={platformConfigs.twitter.charLimit}
                              onChange={(e) => setPlatformConfigs(prev => ({ ...prev, twitter: { ...prev.twitter, charLimit: parseInt(e.target.value) } }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none"
                            >
                              <option value="280">280 (Standard)</option>
                              <option value="4000">4000 (Premium)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {selectedPlatforms.includes("instagram") && (
                        <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-3">
                          <div className="flex items-center gap-2 text-pink-500">
                            <Instagram className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Instagram Settings</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-nexus-text-dim uppercase">Image Ratio</span>
                            <div className="flex gap-2">
                              {["1:1", "4:5", "16:9"].map(ratio => (
                                <button
                                  key={ratio}
                                  onClick={() => setPlatformConfigs(prev => ({ ...prev, instagram: { ...prev.instagram, ratio } }))}
                                  className={cn(
                                    "px-2 py-1 rounded text-[10px] border transition-all",
                                    platformConfigs.instagram.ratio === ratio 
                                      ? "bg-pink-500/20 border-pink-500 text-pink-500" 
                                      : "bg-white/5 border-white/5 text-nexus-text-dim"
                                  )}
                                >
                                  {ratio}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedPlatforms.includes("linkedin") || selectedPlatforms.includes("facebook")) && (
                        <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 space-y-3">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Settings2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Network Visibility</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-nexus-text-dim uppercase">Audience Scope</span>
                            <select 
                              value={selectedPlatforms.includes("linkedin") ? platformConfigs.linkedin.visibility : platformConfigs.facebook.audience}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPlatformConfigs(prev => ({
                                  ...prev,
                                  linkedin: { ...prev.linkedin, visibility: val },
                                  facebook: { ...prev.facebook, audience: val }
                                }));
                              }}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none"
                            >
                              <option value="Public">Public / Anyone</option>
                              <option value="Connections">Connections / Friends</option>
                              <option value="Private">Private (Draft)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-nexus-accent/5 border border-nexus-accent/20">
                  <AlertCircle className="w-5 h-5 text-nexus-accent shrink-0" />
                  <p className="text-[10px] text-nexus-text-dim leading-relaxed">
                    NEXUS ONE will automatically optimize the post timing based on audience activity if "Neural Optimization" is enabled in settings.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-nexus-border flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-nexus-text-dim hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => handleSave("Draft")}
                  disabled={!newPostTitle || selectedPlatforms.length === 0}
                  className="px-6 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  SAVE DRAFT
                </button>
                <button 
                  onClick={() => handleSave("Scheduled")}
                  disabled={!newPostTitle || selectedPlatforms.length === 0 || !scheduleDate || !scheduleTime}
                  className="px-8 py-2 bg-nexus-accent text-black font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  SCHEDULE POST
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
