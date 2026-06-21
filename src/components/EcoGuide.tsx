import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProfile, Activity } from "../types";
import { ApiClient } from "../api/client";
import { Send, Sparkles, Compass, AlertCircle, HelpCircle, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { getTopEmissionCategory, getWeeklyEmission, getEcoScore, getCarbonSaved } from "../lib/metricsService";

interface EcoGuideProps {
  profile: UserProfile;
  activities: Activity[];
}

const PRESET_PROMPTS = [
  "How can I cut energy consumption living in a shared space?",
  "Suggest 3 immediate zero-waste changes I can make today.",
  "Which transport mode yields the absolute best savings in my area?",
  "Analyze my current dietary carbon load and suggest changes.",
];

export default function EcoGuide({ profile, activities }: EcoGuideProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const topCategory = getTopEmissionCategory(activities).category;
    return [{
      id: "intro",
      sender: "bot",
      text: `Hello ${profile.name}!\n\nI analyzed your profile and sustainability goals.\n\n${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} currently appears to be your most likely emission source based on your selected lifestyle.\n\nLogging activities will help me generate personalized reduction plans, estimate carbon savings, and identify your highest-impact opportunities.\n\nWhat would you like to improve today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Calculate currentStats for conversational context
  const totalEmissions = activities.reduce((acc, curr) => acc + curr.emissionKg, 0);
  const currentStats = {
    weeklyTotal: Number(totalEmissions.toFixed(1)),
    logsCount: activities.length,
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setErrorStr(null);
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await ApiClient.post<{ text: string }>("/gemini/chat", {
        messages: [...messages, userMsg],
        profile,
        currentStats,
      });

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStr("EcoGuide is temporarily tuning parameters. Try again in a brief second!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[600px] flex flex-col justify-between">
      {/* Header Info */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 shrink-0">
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="guide-heading">EcoGuide AI Assistant</h1>
          <p className="text-xs text-gray-400">Personalized climate advice trained on regional sustainability data</p>
        </div>
      </div>

      {/* Main chat terminal */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner min-h-0 flex flex-col">
        <div className="flex-1 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2.5 max-w-[85%] ${
                  isBot ? "" : "ml-auto"
                }`}
              >
                {isBot && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    G
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed h-auto ${
                    isBot 
                      ? "bg-gray-100 text-gray-800 rounded-tl-none font-medium" 
                      : "bg-emerald-600 text-white rounded-tr-none font-semibold"
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${isBot ? "text-gray-400" : "text-emerald-200"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start items-center space-x-2 text-gray-400 text-xs">
              <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                G
              </div>
              <span className="animate-pulse font-medium">EcoGuide is analyzing details...</span>
            </div>
          )}
          {errorStr && (
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg text-amber-700 text-xs border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{errorStr}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Preset Chip buttons & text input bar */}
      <div className="space-y-4 shrink-0">
        {/* Context Panel */}
        <div className="bg-emerald-50 rounded-xl p-3 mb-2 flex items-center justify-between border border-emerald-100/50">
          <div className="flex gap-4 md:gap-6 text-xs w-full justify-between sm:justify-start">
            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold mb-0.5">Eco Score</span>
              <span className="font-bold text-emerald-800">{getEcoScore(activities, profile)}</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold mb-0.5">Weekly</span>
              <span className="font-bold text-emerald-800">{getWeeklyEmission(activities).toFixed(1)} kg</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold mb-0.5">Top Category</span>
              <span className="font-bold text-emerald-800 capitalize">{getTopEmissionCategory(activities).category}</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold mb-0.5">Saved</span>
              <span className="font-bold text-emerald-800">{getCarbonSaved(activities, profile).monthlySavedKg} kg</span>
            </div>
          </div>
        </div>

        {messages.length === 1 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Suggested Questions</span>
            <div className="flex flex-wrap gap-2">
              {[
                `Analyze my ${getTopEmissionCategory(activities).category} emissions`,
                "How can I reduce this week's footprint?",
                "What's my biggest improvement opportunity?",
                "Show my quickest carbon win",
                ...PRESET_PROMPTS
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-800 text-xs text-left transition font-medium cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your climate query..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-center transition disabled:bg-emerald-400"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
