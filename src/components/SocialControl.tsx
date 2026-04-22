import { useState, useRef, useEffect } from "react";
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
  Maximize2,
  Github,
  Youtube,
  Link2,
  Play,
  Save,
  Bookmark,
  History,
  Activity,
  Type,
  AlignLeft,
  Monitor
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
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", provider: "google" },
  { id: "twitter", name: "Twitter / X", icon: Twitter, color: "text-blue-400", provider: "github" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600", provider: "linkedin" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500", provider: "google" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-500", provider: "google" },
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

const LIVE_ANALYTICS_DATA = [
  { time: "00:00", viewers: 120, retention: 95 },
  { time: "05:00", viewers: 450, retention: 92 },
  { time: "10:00", viewers: 890, retention: 88 },
  { time: "15:00", viewers: 1200, retention: 85 },
  { time: "20:00", viewers: 1560, retention: 82 },
  { time: "25:00", viewers: 1420, retention: 80 },
  { time: "30:00", viewers: 1840, retention: 78 },
  { time: "35:00", viewers: 1650, retention: 75 },
  { time: "40:00", viewers: 1500, retention: 72 },
];

export const SocialControl = () => {
  const [activeTab, setActiveTab] = useState<"control" | "analytics" | "generator">("control");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, any>>({});
  const [isInitiatingLive, setIsInitiatingLive] = useState(false);

  const [presets, setPresets] = useState<{ name: string; configs: Record<string, any>; platforms: string[] }[]>(() => {
    const saved = localStorage.getItem("nexus_presets");
    return saved ? JSON.parse(saved) : [];
  });
  const [platformPresets, setPlatformPresets] = useState<Record<string, {name: string, config: any}[]>>(() => {
    const saved = localStorage.getItem("nexus_platform_presets");
    return saved ? JSON.parse(saved) : {
      youtube: [],
      linkedin: [],
      twitter: [],
      instagram: [],
      facebook: []
    } as any;
  });

  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetSave, setShowPresetSave] = useState(false);

  useEffect(() => {
    localStorage.setItem("nexus_presets", JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem("nexus_platform_presets", JSON.stringify(platformPresets));
  }, [platformPresets]);

  const savePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      name: newPresetName.trim(),
      configs: JSON.parse(JSON.stringify(platformConfigs)),
      platforms: [...selectedPlatforms]
    };
    setPresets(prev => [...prev, newPreset]);
    setNewPresetName("");
    setShowPresetSave(false);
  };

  const loadPreset = (presetConfigs: Record<string, any>, platforms: string[]) => {
    setPlatformConfigs(JSON.parse(JSON.stringify(presetConfigs)));
    setSelectedPlatforms(platforms);
  };

  const deletePreset = (name: string) => {
    setPresets(prev => prev.filter(p => p.name !== name));
  };

  const savePlatformPreset = (platform: string, name: string) => {
    if (!name.trim()) return;
    const config = JSON.parse(JSON.stringify(platformConfigs[platform]));
    setPlatformPresets(prev => ({
      ...prev,
      [platform]: [...(prev[platform] || []), { name: name.trim(), config }]
    }));
  };

  const loadPlatformPreset = (platform: string, config: any) => {
    setPlatformConfigs(prev => ({
      ...prev,
      [platform]: JSON.parse(JSON.stringify(config))
    }));
  };

  const deletePlatformPreset = (platform: string, name: string) => {
    setPlatformPresets(prev => ({
      ...prev,
      [platform]: (prev[platform] || []).filter(p => p.name !== name)
    }));
  };

  const [platformPresetNaming, setPlatformPresetNaming] = useState<string | null>(null);
  const [tempPlatformPresetName, setTempPlatformPresetName] = useState("");

  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryInput, setShowSummaryInput] = useState(false);
  const [longContentText, setLongContentText] = useState("");
  const [generatorMode, setGeneratorMode] = useState<"ideas" | "summarize">("ideas");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<{ idea: string; caption: string; hashtags: string }[]>([]);

  const summarizeContent = async () => {
    const textToSummarize = activeTab === "generator" ? generatorPrompt : longContentText;
    if (!textToSummarize) return;
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Summarize the following long-form content into high-impact social media captions optimized for the NEXUS ONE platform. 
      You MUST provide exactly two variations:
      1. A short, punchy variation for Twitter/X (under 280 characters).
      2. A more professional, authority-building version for LinkedIn.
      
      Content to summarize: "${textToSummarize}"
      
      Tone: Futuristic, Professional, Thought-Leader, Direct.
      
      Format the response as a JSON array of 2 objects with keys: 
      "platform": "Twitter" or "LinkedIn"
      "idea": A short label for this variation
      "caption": The synthesized caption
      "hashtags": 2-3 relevant hashtags (as a string)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are the NEXUS ONE Content Distiller. You perform hyper-efficient neural summarization for maximum social engagement."
        }
      });

      const data = JSON.parse(response.text || "[]");
      if (activeTab === "generator") {
        setGeneratedIdeas(data);
      } else {
        // If in modal, we can pick the best one or just join them
        const combined = data.map((d: any) => `[${d.platform} Variation]\n${d.caption}\n\n${d.hashtags}`).join("\n\n---\n\n");
        setNewPostTitle(combined);
        setShowSummaryInput(false);
        setLongContentText("");
      }
    } catch (error) {
      console.error("Neural Summarization Error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { provider, tokens: newTokens } = event.data;
        setConnectedPlatforms(prev => [...new Set([...prev, provider])]);
        setTokens(prev => ({ ...prev, [provider]: newTokens }));
        setIsConnecting(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);
    try {
      const response = await fetch(`/api/auth/${provider}/url`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'nexus_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert('Neural link blocked by browser. Please allow popups.');
        setIsConnecting(null);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(null);
    }
  };

  const [posts, setPosts] = useState<ScheduledPost[]>([
    { id: "1", time: "Today, 18:00", title: "Product Launch Teaser", platforms: [Instagram, Twitter], status: "Ready" },
    { id: "2", time: "Tomorrow, 10:00", title: "Customer Success Story", platforms: [Linkedin, Facebook], status: "AI Generating" },
    { id: "3", time: "Monday, 09:00", title: "Weekly Tech Roundup", platforms: [Twitter, Linkedin], status: "Scheduled" },
  ]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

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
    linkedin: { 
      visibility: "Public",
      isLive: false,
      description: "",
      streamTitle: "",
      streamDate: "",
      streamTime: ""
    },
    facebook: { audience: "Public" },
    youtube: { 
      visibility: "public", 
      category: "Entertainment", 
      isLive: false, 
      description: "",
      streamTitle: "",
      streamDate: "",
      streamTime: ""
    }
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
        model: "gemini-3-flash-preview",
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

  const handleGenerateIdeas = async () => {
    if (!generatorPrompt) return;
    setIsGeneratingIdeas(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate 3 creative and high-engagement social media post ideas based on this topic: "${generatorPrompt}". 
      For each idea, provide:
      1. A short, catchy title/idea.
      2. A full engaging caption.
      3. A list of 3-5 relevant hashtags.
      Format the response as a JSON array of objects with keys: "idea", "caption", "hashtags" (as a string).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are the NEXUS ONE Content Strategist. You generate innovative, high-engagement content ideas in JSON format."
        }
      });

      const text = response.text || "[]";
      const ideas = JSON.parse(text);
      setGeneratedIdeas(ideas);
    } catch (error) {
      console.error("Idea Generation Error:", error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const useIdea = (idea: { idea: string; caption: string; hashtags: string }) => {
    setNewPostTitle(`${idea.idea}\n\n${idea.caption}\n\n${idea.hashtags}`);
    setIsModalOpen(true);
  };

  const openEditModal = (post: ScheduledPost) => {
    setEditingPostId(post.id);
    setNewPostTitle(post.title);
    setSelectedPlatforms(PLATFORMS.filter(p => post.platforms.includes(p.icon)).map(p => p.id));
    
    // Parse time
    if (post.time !== "Not Scheduled") {
      const [date, time] = post.time.split(", ");
      setScheduleDate(date);
      setScheduleTime(time);
    }

    setAttachedMedia(post.media || []);
    setPlatformConfigs(post.platformConfigs || {
      twitter: { charLimit: 280, thread: false },
      instagram: { ratio: "1:1", autoCrop: true },
      linkedin: { 
        visibility: "Public",
        isLive: false,
        description: "",
        streamTitle: "",
        streamDate: "",
        streamTime: ""
      },
      facebook: { audience: "Public" },
      youtube: { 
        visibility: "public", 
        category: "Entertainment", 
        isLive: false, 
        description: "",
        streamTitle: "",
        streamDate: "",
        streamTime: ""
      }
    });
    setIsModalOpen(true);
  };

  const syncStreamFields = (platform: "youtube" | "linkedin") => {
    setPlatformConfigs(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        streamTitle: prev[platform].streamTitle || newPostTitle,
        description: prev[platform].description || "Neural Broadcast from NEXUS ONE system."
      }
    }));
  };

  const handleSave = (status: "Scheduled" | "Draft") => {
    if (!newPostTitle || selectedPlatforms.length === 0) return;
    if (status === "Scheduled" && (!scheduleDate || !scheduleTime)) return;

    const postData: ScheduledPost = {
      id: editingPostId || Math.random().toString(36).substr(2, 9),
      title: newPostTitle,
      time: status === "Draft" ? "Not Scheduled" : `${scheduleDate}, ${scheduleTime}`,
      platforms: PLATFORMS.filter(p => selectedPlatforms.includes(p.id)).map(p => p.icon),
      status,
      media: attachedMedia,
      platformConfigs: { ...platformConfigs }
    };

    if (editingPostId) {
      setPosts(prev => prev.map(p => p.id === editingPostId ? postData : p));
    } else {
      setPosts([postData, ...posts]);
    }
    
    setIsModalOpen(false);
    setEditingPostId(null);
    // Reset form
    setNewPostTitle("");
    setSelectedPlatforms([]);
    setScheduleDate("");
    setScheduleTime("");
    setAttachedMedia([]);
    setPlatformConfigs({
      twitter: { charLimit: 280, thread: false },
      instagram: { ratio: "1:1", autoCrop: true },
      linkedin: { 
        visibility: "Public",
        isLive: false,
        description: "",
        streamTitle: "",
        streamDate: "",
        streamTime: ""
      },
      facebook: { audience: "Public" },
      youtube: { 
        visibility: "public", 
        category: "Entertainment", 
        isLive: false, 
        description: "",
        streamTitle: "",
        streamDate: "",
        streamTime: ""
      }
    });
  };

  const initiateLiveStream = async () => {
    const isYoutubeLive = platformConfigs.youtube.isLive && selectedPlatforms.includes("youtube");
    const isLinkedinLive = platformConfigs.linkedin.isLive && selectedPlatforms.includes("linkedin");
    
    if ((!isYoutubeLive && !isLinkedinLive) || isInitiatingLive) return;
    
    setIsInitiatingLive(true);
    try {
      if (isYoutubeLive) {
        const streamTitle = platformConfigs.youtube.streamTitle || newPostTitle;
        const finalStartTime = platformConfigs.youtube.streamDate && platformConfigs.youtube.streamTime 
          ? `${platformConfigs.youtube.streamDate}T${platformConfigs.youtube.streamTime}:00Z`
          : (scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}:00Z` : new Date().toISOString());

        const response = await fetch("/api/youtube/live-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: streamTitle,
            description: platformConfigs.youtube.description,
            privacyStatus: platformConfigs.youtube.visibility,
            category: platformConfigs.youtube.category,
            scheduledStartTime: finalStartTime,
            tokens: tokens.google
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`YouTube Success: ${data.message}\nStream key: ${data.streamKey}`);
        } else {
          throw new Error(data.error || "Failed to initiate YouTube live stream");
        }
      }

      if (isLinkedinLive) {
        const streamTitle = platformConfigs.linkedin.streamTitle || newPostTitle;
        const finalStartTime = platformConfigs.linkedin.streamDate && platformConfigs.linkedin.streamTime 
          ? `${platformConfigs.linkedin.streamDate}T${platformConfigs.linkedin.streamTime}:00Z`
          : (scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}:00Z` : new Date().toISOString());

        const response = await fetch("/api/linkedin/live-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: streamTitle,
            description: platformConfigs.linkedin.description,
            visibility: platformConfigs.linkedin.visibility,
            scheduledStartTime: finalStartTime,
            tokens: tokens.linkedin
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`LinkedIn Success: ${data.message}`);
        } else {
          throw new Error(data.error || "Failed to initiate LinkedIn live stream");
        }
      }

      handleSave("Scheduled");
    } catch (error: any) {
      console.error("Live Stream Initiation Error:", error);
      alert(`Error initializing neural stream: ${error.message}`);
    } finally {
      setIsInitiatingLive(false);
    }
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
            <button 
              onClick={() => setActiveTab("generator")}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "generator" ? "bg-nexus-accent text-black" : "text-nexus-text-dim hover:text-white"
              )}
            >
              IDEA GENERATOR
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
                <button 
                  key={i} 
                  onClick={() => !connectedPlatforms.includes(platform.provider) && handleConnect(platform.provider)}
                  disabled={isConnecting === platform.provider}
                  className={cn(
                    "glass p-4 rounded-2xl flex items-center gap-4 text-left transition-all group",
                    connectedPlatforms.includes(platform.provider) ? "border-nexus-accent/30" : "hover:border-nexus-accent/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg bg-white/5 transition-colors", 
                    platform.color,
                    connectedPlatforms.includes(platform.provider) && "bg-nexus-accent/10"
                  )}>
                    {isConnecting === platform.provider ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <platform.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{platform.name}</p>
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        connectedPlatforms.includes(platform.provider) ? "bg-green-500" : "bg-nexus-text-dim"
                      )} />
                      <p className="text-[10px] text-nexus-text-dim uppercase tracking-widest">
                        {connectedPlatforms.includes(platform.provider) ? "Connected" : "Link Account"}
                      </p>
                    </div>
                  </div>
                  {!connectedPlatforms.includes(platform.provider) && (
                    <Link2 className="w-4 h-4 text-nexus-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
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
                          className="flex flex-col group"
                        >
                          <div 
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:border-nexus-accent/30 transition-all cursor-pointer"
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
                                ) : post.platformConfigs?.youtube?.isLive || post.platformConfigs?.linkedin?.isLive ? (
                                  <div className="w-full h-full flex items-center justify-center bg-red-500/20">
                                    <Play className="w-5 h-5 text-red-500 fill-red-500" />
                                  </div>
                                ) : (
                                  <Zap className="w-6 h-6 text-nexus-accent" />
                                )}
                                {(post.platformConfigs?.youtube?.isLive || post.platformConfigs?.linkedin?.isLive) && (
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
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
                                (post.platformConfigs?.youtube?.isLive || post.platformConfigs?.linkedin?.isLive) ? "bg-red-500/10 text-red-500" :
                                post.status === "Ready" ? "bg-green-500/10 text-green-500" : 
                                post.status === "Draft" ? "bg-white/10 text-nexus-text-dim" :
                                "bg-nexus-accent/10 text-nexus-accent"
                              )}>
                                {(post.platformConfigs?.youtube?.isLive || post.platformConfigs?.linkedin?.isLive) ? "Live Stream" : post.status}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-nexus-text-dim transition-transform", expandedPost === post.id && "rotate-180")} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedPost === post.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 mx-4 mb-2 -mt-2 bg-white/5 border-x border-b border-white/5 rounded-b-2xl space-y-4">
                                  {post.platformConfigs?.youtube?.isLive && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-red-500 mb-1">
                                        <Youtube className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Neural Broadcast Config (YouTube)</span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Neural Stream Title</p>
                                          <p className="text-xs font-medium text-white">{post.platformConfigs.youtube.streamTitle || post.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Visibility Status</p>
                                          <p className="text-xs font-medium text-white uppercase">{post.platformConfigs.youtube.visibility}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Broadcast Description</p>
                                          <p className="text-xs font-medium text-white leading-relaxed">{post.platformConfigs.youtube.description || "No description provided."}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Scheduled Start Time</p>
                                          <p className="text-xs font-medium text-nexus-accent">
                                            {(post.platformConfigs.youtube.streamDate && post.platformConfigs.youtube.streamTime) 
                                              ? `${post.platformConfigs.youtube.streamDate} @ ${post.platformConfigs.youtube.streamTime}`
                                              : post.time}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {post.platformConfigs?.linkedin?.isLive && (
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                      <div className="flex items-center gap-2 text-blue-500 mb-1">
                                        <Linkedin className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">LinkedIn Broadcast Config</span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Stream Title</p>
                                          <p className="text-xs font-medium text-white">{post.platformConfigs.linkedin.streamTitle || post.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Visibility Setting</p>
                                          <p className="text-xs font-medium text-white uppercase">{post.platformConfigs.linkedin.visibility}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Stream Description</p>
                                          <p className="text-xs font-medium text-white leading-relaxed">{post.platformConfigs.linkedin.description || "No description provided."}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                          <p className="text-[9px] text-nexus-text-dim uppercase tracking-tighter">Scheduled Start Time</p>
                                          <p className="text-xs font-medium text-nexus-accent">
                                            {(post.platformConfigs.linkedin.streamDate && post.platformConfigs.linkedin.streamTime) 
                                              ? `${post.platformConfigs.linkedin.streamDate} @ ${post.platformConfigs.linkedin.streamTime}`
                                              : post.time}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(post);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold hover:bg-white/10 transition-colors uppercase"
                                    >
                                      Edit Configuration
                                    </button>
                                    <button 
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-3 py-1.5 rounded-lg bg-nexus-accent/10 text-nexus-accent text-[10px] font-bold hover:bg-nexus-accent hover:text-black transition-colors uppercase"
                                    >
                                      Instant Broadcast
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
        ) : activeTab === "generator" ? (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[40px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-nexus-accent/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-2xl font-display font-bold mb-2 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-nexus-accent animate-pulse" />
                  Neural Content Architect
                </h3>
                <p className="text-nexus-text-dim mb-8">Ignite your digital footprint with AI-engineered post strategies and captions.</p>
                
                <div className="space-y-6">
                  <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
                    <button 
                      onClick={() => setGeneratorMode("ideas")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        generatorMode === "ideas" ? "bg-nexus-accent text-black shadow-lg shadow-nexus-accent/20" : "text-nexus-text-dim hover:text-white"
                      )}
                    >
                      Idea Generation
                    </button>
                    <button 
                      onClick={() => setGeneratorMode("summarize")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        generatorMode === "summarize" ? "bg-nexus-accent text-black shadow-lg shadow-nexus-accent/20" : "text-nexus-text-dim hover:text-white"
                      )}
                    >
                      Content Summarizer
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      value={generatorPrompt}
                      onChange={(e) => setGeneratorPrompt(e.target.value)}
                      placeholder={generatorMode === "ideas" ? "What is the objective? (e.g., Launching a futuristic AI trading bot...)" : "Paste long-form content to summarize (articles, blogs, etc.)..."}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:border-nexus-accent/50 transition-all min-h-[160px] resize-none"
                    />
                    <button
                      onClick={generatorMode === "ideas" ? handleGenerateIdeas : summarizeContent}
                      disabled={isGeneratingIdeas || isSummarizing || !generatorPrompt}
                      className="absolute bottom-4 right-4 bg-nexus-accent text-black p-4 rounded-2xl hover:bg-white transition-all disabled:opacity-50 disabled:grayscale group shadow-xl shadow-nexus-accent/10"
                    >
                      {isGeneratingIdeas || isSummarizing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest hidden group-hover:inline transition-all">
                            {generatorMode === "ideas" ? "Generate Blueprints" : "Neural Summarize"}
                          </span>
                          <Zap className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {generatedIdeas.map((idea, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-6 rounded-[32px] flex flex-col group hover:border-nexus-accent/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-nexus-accent/10">
                        <Sparkles className="w-4 h-4 text-nexus-accent" />
                      </div>
                      <span className="text-[10px] font-bold text-nexus-text-dim uppercase tracking-tighter">Option {i + 1}</span>
                    </div>
                    
                    <h4 className="text-lg font-bold mb-3">{idea.idea}</h4>
                    <p className="text-xs text-nexus-text-dim leading-relaxed mb-4 flex-grow line-clamp-4">
                      {idea.caption}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-6">
                      {idea.hashtags.split(" ").map((tag, j) => (
                        <span key={j} className="text-[10px] text-nexus-accent font-mono">{tag}</span>
                      ))}
                    </div>

                    <button 
                      onClick={() => useIdea(idea)}
                      className="w-full p-4 rounded-2xl bg-white/5 text-white font-bold text-xs hover:bg-nexus-accent hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      DEPLOY DRAFT
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {generatedIdeas.length === 0 && !isGeneratingIdeas && (
              <div className="py-20 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-nexus-text-dim text-sm max-w-xs italic">Awaiting neural input. Describe your goal to generate content blueprints.</p>
              </div>
            )}
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

            {/* Live Stream Intelligence Section */}
            {(selectedPlatform === "all" || selectedPlatform === "youtube" || selectedPlatform === "linkedin") && (
              <div className="space-y-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Neural Live Intelligence</h3>
                    <p className="text-xs text-nexus-text-dim uppercase tracking-widest">Real-Time Ingestion Performance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Concurrent Viewers", value: "1.8K", trend: "+12.4%", icon: Users, color: "text-red-400" },
                    { label: "Peak Viewers", value: "2.4K", trend: "Peak Reached", icon: TrendingUp, color: "text-nexus-accent" },
                    { label: "Total Views", value: "45.2K", trend: "+5.2%", icon: Eye, color: "text-blue-400" },
                    { label: "Audience Retention", value: "72%", trend: "Stable", icon: Activity, color: "text-purple-400" },
                  ].map((metric, i) => (
                    <div key={i} className="glass p-5 rounded-2xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-3">
                        <div className={cn("p-2 rounded-xl bg-white/5", metric.color)}>
                          <metric.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-nexus-accent bg-nexus-accent/10 px-2 py-1 rounded-lg">
                          {metric.trend}
                        </span>
                      </div>
                      <p className="text-[10px] text-nexus-text-dim uppercase tracking-widest mb-1">{metric.label}</p>
                      <h4 className="text-2xl font-display font-bold">{metric.value}</h4>
                    </div>
                  ))}
                </div>

                <div className="glass p-8 rounded-3xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-500" />
                      Live Pulse: Viewership vs Retention
                    </h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={LIVE_ANALYTICS_DATA}>
                        <defs>
                          <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="time" 
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
                          contentStyle={{ backgroundColor: "#0a0a0c", border: "1px solid #ffffff10", borderRadius: "12px" }}
                          itemStyle={{ fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="viewers" stroke="#ef4444" fillOpacity={1} fill="url(#colorViewers)" strokeWidth={3} />
                        <Area type="monotone" dataKey="retention" stroke="#a855f7" fillOpacity={1} fill="url(#colorRetention)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
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
                  {editingPostId ? <Settings2 className="w-5 h-5 text-nexus-accent" /> : <Plus className="w-5 h-5 text-nexus-accent" />}
                  {editingPostId ? "Modify Neural Post" : "Schedule Neural Post"}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPostId(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest block">Post Content / Title</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowSummaryInput(!showSummaryInput)}
                        className="flex items-center gap-2 text-[10px] font-bold text-nexus-text-dim hover:text-white transition-colors"
                      >
                        <Activity className="w-3 h-3" />
                        SUMMARIZE LONG CONTENT
                      </button>
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
                  </div>

                  <AnimatePresence>
                    {showSummaryInput && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 space-y-3 overflow-hidden"
                      >
                        <textarea 
                          value={longContentText}
                          onChange={(e) => setLongContentText(e.target.value)}
                          placeholder="Paste the long article or post content here to be distilled by Nexus AI..."
                          className="w-full h-32 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl p-4 text-xs outline-none focus:border-nexus-accent/50 transition-colors resize-none"
                        />
                        <div className="flex justify-between items-center bg-nexus-accent/5 p-3 rounded-xl border border-nexus-accent/10">
                          <p className="text-[10px] text-nexus-text-dim font-mono italic">
                            Nexus AI will generate platform-balanced summaries for Twitter and LinkedIn.
                          </p>
                          <button 
                            onClick={summarizeContent}
                            disabled={isSummarizing || !longContentText}
                            className="px-4 py-1.5 bg-nexus-accent text-black text-[10px] font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            START DISTILLATION
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's the message for the digital universe?"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-nexus-accent/50 transition-colors resize-none"
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
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest block">Neural Platform Configs</label>
                      <button 
                        onClick={() => setShowPresetSave(!showPresetSave)}
                        className="text-[10px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Bookmark className="w-3 h-3" />
                        PRESETS
                      </button>
                    </div>

                    {showPresetSave && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="Preset Name (e.g., Live Standard)"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-nexus-accent/50"
                          />
                          <button 
                            onClick={savePreset}
                            disabled={!newPresetName.trim()}
                            className="px-3 py-1.5 bg-nexus-accent text-black rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            SAVE
                          </button>
                        </div>

                        {presets.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <span className="text-[10px] text-nexus-text-dim uppercase block mb-2">Saved Neural Presets</span>
                            <div className="flex flex-wrap gap-2">
                              {presets.map(preset => (
                                <div key={preset.name} className="group relative">
                                  <button 
                                    onClick={() => loadPreset(preset.configs, preset.platforms || [])}
                                    className="pl-3 pr-4 py-1.5 rounded-xl bg-white/10 hover:bg-nexus-accent hover:text-black transition-all text-[10px] font-bold flex items-center gap-2 border border-white/5 hover:border-nexus-accent"
                                  >
                                    <div className="flex -space-x-1">
                                      {(preset.platforms || []).map(pid => {
                                        const P = PLATFORMS.find(p => p.id === pid);
                                        return P ? <P.icon key={pid} className="w-2.5 h-2.5" /> : null;
                                      })}
                                    </div>
                                    {preset.name}
                                  </button>
                                  <button 
                                    onClick={() => deletePreset(preset.name)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      {selectedPlatforms.includes("twitter") && (
                        <div className="p-4 rounded-2xl bg-blue-400/5 border border-blue-400/10 space-y-3 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-400">
                              <Twitter className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Twitter / X Settings</span>
                            </div>
                            <div className="flex gap-2">
                              {(platformPresets.twitter || []).length > 0 && (
                                <div className="flex gap-1 items-center mr-2 pr-2 border-r border-white/10">
                                  {(platformPresets.twitter || []).map(p => (
                                    <button
                                      key={p.name}
                                      onClick={() => loadPlatformPreset("twitter", p.config)}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all text-nexus-text-dim hover:text-white"
                                      title={`Load ${p.name}`}
                                    >
                                      {p.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  if (platformPresetNaming === "twitter") {
                                    savePlatformPreset("twitter", tempPlatformPresetName);
                                    setPlatformPresetNaming(null);
                                    setTempPlatformPresetName("");
                                  } else {
                                    setPlatformPresetNaming("twitter");
                                  }
                                }}
                                className="text-[10px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                              >
                                {platformPresetNaming === "twitter" ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {platformPresetNaming === "twitter" && (
                            <div className="absolute inset-x-0 top-0 bg-blue-400/90 backdrop-blur-md p-4 z-10 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                              <input 
                                type="text"
                                autoFocus
                                value={tempPlatformPresetName}
                                onChange={(e) => setTempPlatformPresetName(e.target.value)}
                                placeholder="Preset Name"
                                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                              />
                              <button onClick={() => setPlatformPresetNaming(null)} className="text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
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
                        <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-3 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-pink-500">
                              <Instagram className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Instagram Settings</span>
                            </div>
                            <div className="flex gap-2">
                              {(platformPresets.instagram || []).length > 0 && (
                                <div className="flex gap-1 items-center mr-2 pr-2 border-r border-white/10">
                                  {(platformPresets.instagram || []).map(p => (
                                    <button
                                      key={p.name}
                                      onClick={() => loadPlatformPreset("instagram", p.config)}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all text-nexus-text-dim hover:text-white"
                                      title={`Load ${p.name}`}
                                    >
                                      {p.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  if (platformPresetNaming === "instagram") {
                                    savePlatformPreset("instagram", tempPlatformPresetName);
                                    setPlatformPresetNaming(null);
                                    setTempPlatformPresetName("");
                                  } else {
                                    setPlatformPresetNaming("instagram");
                                  }
                                }}
                                className="text-[10px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                              >
                                {platformPresetNaming === "instagram" ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {platformPresetNaming === "instagram" && (
                            <div className="absolute inset-x-0 top-0 bg-pink-500/90 backdrop-blur-md p-4 z-10 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                              <input 
                                type="text"
                                autoFocus
                                value={tempPlatformPresetName}
                                onChange={(e) => setTempPlatformPresetName(e.target.value)}
                                placeholder="Preset Name"
                                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                              />
                              <button onClick={() => setPlatformPresetNaming(null)} className="text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
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

                      {selectedPlatforms.includes("youtube") && (
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-500">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                platformConfigs.youtube.isLive ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-red-500/20"
                              )} />
                              <Youtube className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">YouTube Settings</span>
                            </div>
                            <button 
                              onClick={() => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, isLive: !prev.youtube.isLive } }))}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2",
                                platformConfigs.youtube.isLive ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-red-500/30"
                              )}
                            >
                              <Play className="w-3 h-3" />
                              LIVE STREAM
                            </button>
                          </div>
                          
                          {platformConfigs.youtube.isLive && (
                            <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-white/5 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 flex gap-2">
                                {(platformPresets.youtube || []).length > 0 && (
                                  <div className="flex gap-1 items-center mr-2 pr-2 border-r border-white/10">
                                    {(platformPresets.youtube || []).map(p => (
                                      <div key={p.name} className="relative group/chip">
                                        <button
                                          onClick={() => loadPlatformPreset("youtube", p.config)}
                                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-nexus-text-dim hover:text-white"
                                          title={`Load ${p.name}`}
                                        >
                                          {p.name}
                                        </button>
                                        <button 
                                          onClick={() => deletePlatformPreset("youtube", p.name)}
                                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 text-white rounded-full opacity-0 group-hover/chip:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                          <X className="w-2 h-2" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button 
                                  onClick={() => {
                                    if (platformPresetNaming === "youtube") {
                                      savePlatformPreset("youtube", tempPlatformPresetName);
                                      setPlatformPresetNaming(null);
                                      setTempPlatformPresetName("");
                                    } else {
                                      setPlatformPresetNaming("youtube");
                                    }
                                  }}
                                  className="text-[9px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                                >
                                  {platformPresetNaming === "youtube" ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                                  {platformPresetNaming === "youtube" ? "CONFIRM" : "SAVE PRESET"}
                                </button>
                                <button 
                                  onClick={() => syncStreamFields("youtube")}
                                  className="text-[9px] font-bold text-red-400 hover:text-white transition-colors flex items-center gap-1"
                                  title="Sync from Post Title"
                                >
                                  <Zap className="w-3 h-3" />
                                  SYNC
                                </button>
                              </div>

                              {platformPresetNaming === "youtube" && (
                                <div className="absolute inset-x-0 top-0 bg-red-600/90 backdrop-blur-md p-4 z-10 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                                  <input 
                                    type="text"
                                    autoFocus
                                    value={tempPlatformPresetName}
                                    onChange={(e) => setTempPlatformPresetName(e.target.value)}
                                    placeholder="Preset Name (e.g., Gaming Live)"
                                    className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                                  />
                                  <button onClick={() => setPlatformPresetNaming(null)} className="text-white">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                                <Settings2 className="w-3 h-3 text-red-400" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Advanced Stream Settings</span>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                    <Type className="w-2.5 h-2.5" />
                                    Stream Title
                                  </label>
                                  <input 
                                    type="text"
                                    value={platformConfigs.youtube.streamTitle}
                                    onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, streamTitle: e.target.value } }))}
                                    placeholder="Enter the broadcast title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-red-500/30 transition-all"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                    <AlignLeft className="w-2.5 h-2.5" />
                                    Stream Description
                                  </label>
                                  <textarea 
                                    value={platformConfigs.youtube.description}
                                    onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, description: e.target.value } }))}
                                    placeholder="Enter the stream description..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none h-20 resize-none focus:border-red-500/30 transition-all"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                      <Calendar className="w-2.5 h-2.5" />
                                      Start Date
                                    </label>
                                    <input 
                                      type="date"
                                      value={platformConfigs.youtube.streamDate}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, streamDate: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-red-500/30 [color-scheme:dark]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                      <Clock className="w-2.5 h-2.5" />
                                      Start Time
                                    </label>
                                    <input 
                                      type="time"
                                      value={platformConfigs.youtube.streamTime}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, streamTime: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-red-500/30 [color-scheme:dark]"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-nexus-text-dim uppercase flex items-center gap-1.5 font-mono">
                                      <Eye className="w-2.5 h-2.5" />
                                      Visibility
                                    </label>
                                    <select 
                                      value={platformConfigs.youtube.visibility}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, visibility: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-[10px] outline-none hover:border-red-500/30 transition-all cursor-pointer"
                                    >
                                      <option value="public">🌍 Public</option>
                                      <option value="unlisted">🔗 Unlisted</option>
                                      <option value="private">🔒 Private</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-nexus-text-dim uppercase flex items-center gap-1.5 font-mono">
                                      <Monitor className="w-2.5 h-2.5" />
                                      Category
                                    </label>
                                    <select 
                                      value={platformConfigs.youtube.category}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, youtube: { ...prev.youtube, category: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-[10px] outline-none hover:border-red-500/30 transition-all cursor-pointer"
                                    >
                                      <option value="Entertainment">🎬 Entertainment</option>
                                      <option value="Education">🎓 Education</option>
                                      <option value="Tech">💻 Tech</option>
                                      <option value="Gaming">🎮 Gaming</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPlatforms.includes("linkedin") && (
                        <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                platformConfigs.linkedin.isLive ? "bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]" : "bg-blue-600/20"
                              )} />
                              <Linkedin className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">LinkedIn Settings</span>
                            </div>
                            <button 
                              onClick={() => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, isLive: !prev.linkedin.isLive } }))}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2",
                                platformConfigs.linkedin.isLive ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-blue-600/30"
                              )}
                            >
                              <Play className="w-3 h-3" />
                              LIVE STREAM
                            </button>
                          </div>
                          
                          {platformConfigs.linkedin.isLive && (
                            <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-white/5 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 flex gap-2">
                                {(platformPresets.linkedin || []).length > 0 && (
                                  <div className="flex gap-1 items-center mr-2 pr-2 border-r border-white/10">
                                    {(platformPresets.linkedin || []).map(p => (
                                      <div key={p.name} className="relative group/chip">
                                        <button
                                          onClick={() => loadPlatformPreset("linkedin", p.config)}
                                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-nexus-text-dim hover:text-white"
                                          title={`Load ${p.name}`}
                                        >
                                          {p.name}
                                        </button>
                                        <button 
                                          onClick={() => deletePlatformPreset("linkedin", p.name)}
                                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 text-white rounded-full opacity-0 group-hover/chip:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                          <X className="w-2 h-2" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button 
                                  onClick={() => {
                                    if (platformPresetNaming === "linkedin") {
                                      savePlatformPreset("linkedin", tempPlatformPresetName);
                                      setPlatformPresetNaming(null);
                                      setTempPlatformPresetName("");
                                    } else {
                                      setPlatformPresetNaming("linkedin");
                                    }
                                  }}
                                  className="text-[9px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                                >
                                  {platformPresetNaming === "linkedin" ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                                  {platformPresetNaming === "linkedin" ? "CONFIRM" : "SAVE PRESET"}
                                </button>
                                <button 
                                  onClick={() => syncStreamFields("linkedin")}
                                  className="text-[9px] font-bold text-blue-400 hover:text-white transition-colors flex items-center gap-1"
                                  title="Sync from Post Title"
                                >
                                  <Zap className="w-3 h-3" />
                                  SYNC
                                </button>
                              </div>

                              {platformPresetNaming === "linkedin" && (
                                <div className="absolute inset-x-0 top-0 bg-blue-600/90 backdrop-blur-md p-4 z-10 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                                  <input 
                                    type="text"
                                    autoFocus
                                    value={tempPlatformPresetName}
                                    onChange={(e) => setTempPlatformPresetName(e.target.value)}
                                    placeholder="Preset Name (e.g., Live Conf)"
                                    className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                                  />
                                  <button onClick={() => setPlatformPresetNaming(null)} className="text-white">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
                                <Settings2 className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Advanced Event Settings</span>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                    <Type className="w-2.5 h-2.5" />
                                    Event Title
                                  </label>
                                  <input 
                                    type="text"
                                    value={platformConfigs.linkedin.streamTitle}
                                    onChange={(e) => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, streamTitle: e.target.value } }))}
                                    placeholder="Enter official event title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600/30 transition-all"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                    <AlignLeft className="w-2.5 h-2.5" />
                                    Event Description
                                  </label>
                                  <textarea 
                                    value={platformConfigs.linkedin.description}
                                    onChange={(e) => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, description: e.target.value } }))}
                                    placeholder="Professional event details..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none h-20 resize-none focus:border-blue-600/30 transition-all"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                      <Calendar className="w-2.5 h-2.5" />
                                      Start Date
                                    </label>
                                    <input 
                                      type="date"
                                      value={platformConfigs.linkedin.streamDate}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, streamDate: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600/30 [color-scheme:dark]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                      <Clock className="w-2.5 h-2.5" />
                                      Start Time
                                    </label>
                                    <input 
                                      type="time"
                                      value={platformConfigs.linkedin.streamTime}
                                      onChange={(e) => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, streamTime: e.target.value } }))}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600/30 [color-scheme:dark]"
                                    />
                                  </div>
                                </div>

                                <div className="pt-1">
                                  <label className="text-[9px] text-nexus-text-dim uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                                    <Eye className="w-2.5 h-2.5" />
                                    Visibility Setting
                                  </label>
                                  <select 
                                    value={platformConfigs.linkedin.visibility}
                                    onChange={(e) => setPlatformConfigs(prev => ({ ...prev, linkedin: { ...prev.linkedin, visibility: e.target.value } }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-[10px] outline-none hover:border-blue-600/30 transition-all cursor-pointer"
                                  >
                                    <option value="Public">🌍 Public</option>
                                    <option value="Connections Only">👥 Connections Only</option>
                                    <option value="Private">🔒 Private</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPlatforms.includes("facebook") && (
                        <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 space-y-3 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Settings2 className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Facebook Settings</span>
                            </div>
                            <div className="flex gap-2">
                              {(platformPresets.facebook || []).length > 0 && (
                                <div className="flex gap-1 items-center mr-2 pr-2 border-r border-white/10">
                                  {(platformPresets.facebook || []).map(p => (
                                    <button
                                      key={p.name}
                                      onClick={() => loadPlatformPreset("facebook", p.config)}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hover:border-blue-600/50 hover:bg-blue-600/10 transition-all text-nexus-text-dim hover:text-white"
                                      title={`Load ${p.name}`}
                                    >
                                      {p.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  if (platformPresetNaming === "facebook") {
                                    savePlatformPreset("facebook", tempPlatformPresetName);
                                    setPlatformPresetNaming(null);
                                    setTempPlatformPresetName("");
                                  } else {
                                    setPlatformPresetNaming("facebook");
                                  }
                                }}
                                className="text-[10px] font-bold text-nexus-accent hover:text-white transition-colors flex items-center gap-1"
                              >
                                {platformPresetNaming === "facebook" ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {platformPresetNaming === "facebook" && (
                            <div className="absolute inset-x-0 top-0 bg-blue-600/90 backdrop-blur-md p-4 z-10 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                              <input 
                                type="text"
                                autoFocus
                                value={tempPlatformPresetName}
                                onChange={(e) => setTempPlatformPresetName(e.target.value)}
                                placeholder="Preset Name"
                                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                              />
                              <button onClick={() => setPlatformPresetNaming(null)} className="text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-nexus-text-dim uppercase">Audience Scope</span>
                            <select 
                              value={platformConfigs.facebook.audience}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPlatformConfigs(prev => ({
                                  ...prev,
                                  facebook: { ...prev.facebook, audience: val }
                                }));
                              }}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none"
                            >
                              <option value="Public">Public</option>
                              <option value="Friends">Friends</option>
                              <option value="Private">Only Me</option>
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
                {(selectedPlatforms.includes("youtube") && platformConfigs.youtube.isLive) || (selectedPlatforms.includes("linkedin") && platformConfigs.linkedin.isLive) ? (
                  <button 
                    onClick={initiateLiveStream}
                    disabled={isInitiatingLive || !newPostTitle || (selectedPlatforms.includes("youtube") && platformConfigs.youtube.isLive && !connectedPlatforms.includes("google")) || (selectedPlatforms.includes("linkedin") && platformConfigs.linkedin.isLive && !connectedPlatforms.includes("linkedin"))}
                    className="px-8 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isInitiatingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    INITIATE NEURAL STREAM
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
