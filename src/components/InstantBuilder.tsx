import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Globe, Wand2, Layout, Type, Image as ImageIcon, Loader2, CheckCircle2, ArrowRight, Cpu } from "lucide-react";
import { GoogleGenAI, Type as GenAIType } from "@google/genai";
import { cn } from "@/src/lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type CreatorType = "BOOK" | "WEBSITE" | "LANDING_PAGE";

interface GeneratedContent {
  title: string;
  sections: { heading: string; content: string }[];
  branding: { primaryColor: string; font: string };
}

export const InstantBuilder = () => {
  const [type, setType] = useState<CreatorType>("WEBSITE");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a detailed structure for a ${type} based on this prompt: "${prompt}". 
        Include a catchy title, 3-5 main sections with content summaries, and branding suggestions (primary color hex and font style).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GenAIType.OBJECT,
            properties: {
              title: { type: GenAIType.STRING },
              sections: {
                type: GenAIType.ARRAY,
                items: {
                  type: GenAIType.OBJECT,
                  properties: {
                    heading: { type: GenAIType.STRING },
                    content: { type: GenAIType.STRING }
                  },
                  required: ["heading", "content"]
                }
              },
              branding: {
                type: GenAIType.OBJECT,
                properties: {
                  primaryColor: { type: GenAIType.STRING },
                  font: { type: GenAIType.STRING }
                },
                required: ["primaryColor", "font"]
              }
            },
            required: ["title", "sections", "branding"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
    } catch (error) {
      console.error("Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h2 className="text-3xl font-display font-bold">Instant Builder</h2>
        <p className="text-nexus-text-dim mt-1">Generate full digital assets with a single neural command.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            <div>
              <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Asset Type</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "WEBSITE", label: "Full Website", icon: Globe },
                  { id: "BOOK", label: "E-Book / Guide", icon: BookOpen },
                  { id: "LANDING_PAGE", label: "Landing Page", icon: Layout },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setType(item.id as CreatorType)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                      type === item.id 
                        ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent" 
                        : "bg-white/5 border-white/5 text-nexus-text-dim hover:border-white/20"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-nexus-text-dim uppercase tracking-widest mb-3 block">Neural Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic coffee brand for space travelers..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-nexus-accent/50 transition-colors resize-none"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-nexus-accent text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SYNTHESIZING...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  GENERATE ASSET
                </>
              )}
            </button>
          </div>

          <div className="glass p-6 rounded-3xl">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-nexus-accent" />
              Included Features
            </h4>
            <ul className="space-y-3">
              {[
                "AI-Generated Copywriting",
                "Responsive Layout Design",
                "SEO Optimization",
                "Branding & Color Palette",
                "Instant Deployment Ready"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-nexus-text-dim">
                  <div className="w-1 h-1 rounded-full bg-nexus-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full glass rounded-3xl border-dashed border-2 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Layout className="w-10 h-10 text-nexus-text-dim" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">Preview Neural Output</h3>
                <p className="text-nexus-text-dim max-w-sm">
                  Enter a prompt and select an asset type to begin the generation process.
                </p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full glass rounded-3xl flex flex-col items-center justify-center p-12"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-nexus-accent/20 border-t-nexus-accent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-nexus-accent animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold mb-2">Neural Synthesis in Progress</h3>
                <div className="space-y-2 w-full max-w-xs">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-nexus-accent"
                      animate={{ width: ["0%", "30%", "60%", "90%", "100%"] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-nexus-text-dim text-center uppercase tracking-widest">
                    Analyzing structure & branding...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl overflow-hidden flex flex-col h-full"
              >
                <div className="p-8 border-b border-nexus-border bg-gradient-to-r from-nexus-accent/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/30 text-[10px] font-bold text-nexus-accent uppercase tracking-widest">
                      {type} GENERATED
                    </span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result?.branding.primaryColor }} />
                      <span className="text-[10px] font-mono text-nexus-text-dim">{result?.branding.font}</span>
                    </div>
                  </div>
                  <h3 className="text-4xl font-display font-extrabold tracking-tight">{result?.title}</h3>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-8">
                  {result?.sections.map((section, i) => (
                    <div key={i} className="space-y-3">
                      <h4 className="text-lg font-display font-bold text-nexus-accent flex items-center gap-2">
                        <span className="text-xs font-mono opacity-50">0{i+1}</span>
                        {section.heading}
                      </h4>
                      <p className="text-sm text-nexus-text-dim leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-white/5 border-t border-nexus-border flex justify-between items-center">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-xs font-bold text-nexus-text-dim hover:text-white transition-colors">
                      <Type className="w-4 h-4" />
                      EDIT TEXT
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-nexus-text-dim hover:text-white transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      ADD IMAGES
                    </button>
                  </div>
                  <button className="px-6 py-2 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-nexus-accent transition-all">
                    DEPLOY ASSET
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
