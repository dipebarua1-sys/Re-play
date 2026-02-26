import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Briefcase, 
  Users, 
  Smile, 
  Frown, 
  Minus, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  Settings,
  ChevronDown,
  Globe,
  Moon,
  Sun,
  MessageSquareReply,
  MessageSquareText,
  ArrowLeft,
  SlidersHorizontal,
  X,
  RefreshCw,
  Type as TypeIcon,
  Maximize2,
  Settings2
} from 'lucide-react';
import { generateCorporateReply, ReplyRequest, ReplyResponse } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | ReplyResponse;
  timestamp: Date;
}

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sender, setSender] = useState<ReplyRequest['sender']>('Colleague');
  const [tone, setTone] = useState<ReplyRequest['tone']>('Positive');
  const [inputLanguage, setInputLanguage] = useState<ReplyRequest['inputLanguage']>('Auto-detect');
  const [mode, setMode] = useState<ReplyRequest['mode'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeQuickSetting, setActiveQuickSetting] = useState<'sender' | 'tone' | 'language' | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [chatWidth, setChatWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API key is defined
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
      setApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await generateCorporateReply({ 
        message: currentInput, 
        sender, 
        tone, 
        inputLanguage,
        mode: mode || 'reply'
      });
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (loading) return;
    
    // Find the closest preceding user message
    let userMessageContent = '';
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessageContent = messages[i].content as string;
        break;
      }
    }

    if (!userMessageContent) return;

    setLoading(true);
    try {
      const res = await generateCorporateReply({ 
        message: userMessageContent, 
        sender, 
        tone, 
        inputLanguage,
        mode: mode || 'reply'
      });
      
      const newAssistantMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: res,
        timestamp: new Date(),
      };

      setMessages(prev => {
        const next = [...prev];
        next[index] = newAssistantMsg;
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-white text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 backdrop-blur-md",
        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-100"
      )}>
        <div className="w-8" /> {/* Spacer */}
        <h1 className={cn(
          "text-xl font-semibold tracking-tight",
          isDarkMode ? "text-slate-100" : "text-slate-800"
        )}>
          {!mode ? "Re-Play" : mode === 'reply' ? "Reply Something" : "Say Something"}
        </h1>
        <div className="flex items-center gap-2">
          {mode && (
            <button 
              onClick={() => {
                setMode(null);
                setMessages([]);
                setActiveQuickSetting(null);
              }}
              className={cn(
                "p-2 rounded-full transition-colors mr-2",
                isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
              title="Change Mode"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-yellow-400" : "hover:bg-slate-100 text-slate-500"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setShowGeneralSettings(true)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            )}
            title="General Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-6"
      >
        <div className={cn(
          "mx-auto space-y-8 transition-all duration-300",
          chatWidth === 'narrow' ? "max-w-xl" : chatWidth === 'wide' ? "max-w-5xl" : "max-w-3xl",
          fontSize === 'sm' ? "text-sm" : fontSize === 'lg' ? "text-lg" : "text-base"
        )}>
          {apiKeyMissing && (
            <div className={cn(
              "p-6 rounded-3xl border-2 border-red-500/20 bg-red-500/5 text-center space-y-4",
              isDarkMode ? "bg-red-900/10" : "bg-red-50"
            )}>
              <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-red-500">API Key Missing</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">GEMINI_API_KEY</code> environment variable is not set. 
                  Please add it to your Netlify environment variables and redeploy.
                </p>
              </div>
            </div>
          )}

          {!mode && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-8">
              <div className={cn(
                "p-3 rounded-2xl",
                isDarkMode ? "bg-slate-900" : "bg-slate-50"
              )}>
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h2 className={cn(
                  "text-2xl font-bold tracking-tight",
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                )}>Welcome to Re-Play</h2>
                <p className="text-xs text-slate-500">Choose how you'd like to communicate today.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-2">
                <button 
                  onClick={() => setMode('reply')}
                  className={cn(
                    "flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50" 
                      : "bg-white border-slate-100 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5"
                  )}
                >
                  <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-500">
                    <MessageSquareReply className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-sm sm:text-base", isDarkMode ? "text-slate-100" : "text-slate-800")}>Reply</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">Paste a message to craft a response.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setMode('say')}
                  className={cn(
                    "flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-emerald-500/50" 
                      : "bg-white border-slate-100 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
                  )}
                >
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-sm sm:text-base", isDarkMode ? "text-slate-100" : "text-slate-800")}>Say</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">Write intent and I'll polish it.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
              <div className={cn(
                "p-3 rounded-2xl",
                isDarkMode ? "bg-slate-900" : "bg-slate-50"
              )}>
                {mode === 'reply' ? (
                  <MessageSquareReply className="w-6 h-6 text-indigo-500" />
                ) : (
                  <MessageSquareText className="w-6 h-6 text-emerald-500" />
                )}
              </div>
              <h2 className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-slate-100" : "text-slate-800"
              )}>
                {mode === 'reply' ? "Paste the message you received" : "What would you like to say?"}
              </h2>
              <p className="text-slate-500 max-w-sm">
                {mode === 'reply' 
                  ? "I'll help you craft a professional reply based on the hierarchy and tone you choose."
                  : "I'll correct your grammar and arrange your thoughts into a clear, professional message."}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full group/msg",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]">
                <div className={cn(
                  "rounded-2xl px-4 py-3 leading-relaxed transition-colors duration-500",
                  msg.role === 'user' 
                    ? (mode === 'reply' 
                        ? (isDarkMode ? "bg-purple-900/40 text-purple-100 border border-purple-800/50 rounded-tr-none" : "bg-purple-50 text-purple-900 border border-purple-100 rounded-tr-none")
                        : (isDarkMode ? "bg-emerald-900/40 text-emerald-100 border border-emerald-800/50 rounded-tr-none" : "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tr-none")
                      )
                    : (isDarkMode ? "bg-slate-900 border border-slate-800 shadow-sm rounded-tl-none text-slate-200" : "bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-800")
                )}>
                  {typeof msg.content === 'string' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">English Reply</span>
                          <button 
                            onClick={() => copyToClipboard((msg.content as ReplyResponse).english, msg.id + '-en')}
                            className={cn(
                              "p-1 rounded transition-colors text-slate-400",
                              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                            )}
                          >
                            {copied === msg.id + '-en' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        )}>{msg.content.english}</p>
                      </div>
                      <div className={cn(
                        "h-px w-full",
                        isDarkMode ? "bg-slate-800" : "bg-slate-50"
                      )} />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bangla Translation</span>
                          <button 
                            onClick={() => copyToClipboard((msg.content as ReplyResponse).bangla, msg.id + '-bn')}
                            className={cn(
                              "p-1 rounded transition-colors text-slate-400",
                              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                            )}
                          >
                            {copied === msg.id + '-bn' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        )}>{msg.content.bangla}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Regenerate Button for Assistant Messages */}
                {msg.role === 'assistant' && typeof msg.content !== 'string' && (
                  <div className="flex justify-start px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRegenerate(idx)}
                      disabled={loading}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors",
                        isDarkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={cn(
                "border shadow-sm rounded-2xl rounded-tl-none px-4 py-3",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              )}>
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className={cn(
        "p-4 sm:p-6 border-t transition-all duration-500 relative",
        !mode ? "opacity-0 pointer-events-none translate-y-10" : "opacity-100 translate-y-0",
        isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"
      )}>
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Context-Specific Quick Selectors */}
          <AnimatePresence>
            {mode && activeQuickSetting && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "absolute bottom-full mb-4 left-4 sm:left-6 p-2 rounded-2xl border shadow-xl flex flex-wrap gap-1.5 z-30",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}
              >
                {activeQuickSetting === 'sender' && (['Boss', 'Colleague', 'Junior'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSender(role);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all",
                      sender === role 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {role}
                  </button>
                ))}
                {activeQuickSetting === 'tone' && (['Positive', 'Neutral', 'Negative'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all",
                      tone === t 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {t}
                  </button>
                ))}
                {activeQuickSetting === 'language' && (['Auto-detect', 'English', 'Bangla', 'Banglish'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setInputLanguage(lang);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all",
                      inputLanguage === lang 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {lang}
                  </button>
                ))}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
                <button 
                  onClick={() => setActiveQuickSetting(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal Selectors above input */}
          {mode && (
            <div className="flex flex-wrap gap-2 px-1">
              <button 
                onClick={() => setActiveQuickSetting(activeQuickSetting === 'sender' ? null : 'sender')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all hover:scale-105 active:scale-95",
                  activeQuickSetting === 'sender'
                    ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                    : (isDarkMode 
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                        : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                )}
              >
                <User className="w-2.5 h-2.5" />
                {sender}
                <ChevronDown className={cn("w-2 h-2 transition-transform", activeQuickSetting === 'sender' && "rotate-180")} />
              </button>
              <button 
                onClick={() => setActiveQuickSetting(activeQuickSetting === 'tone' ? null : 'tone')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all hover:scale-105 active:scale-95",
                  activeQuickSetting === 'tone'
                    ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                    : (isDarkMode 
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                        : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                )}
              >
                <Smile className="w-2.5 h-2.5" />
                {tone}
                <ChevronDown className={cn("w-2 h-2 transition-transform", activeQuickSetting === 'tone' && "rotate-180")} />
              </button>
              <button 
                onClick={() => setActiveQuickSetting(activeQuickSetting === 'language' ? null : 'language')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all hover:scale-105 active:scale-95",
                  activeQuickSetting === 'language'
                    ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                    : (isDarkMode 
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                        : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                )}
              >
                <Globe className="w-2.5 h-2.5" />
                {inputLanguage}
                <ChevronDown className={cn("w-2 h-2 transition-transform", activeQuickSetting === 'language' && "rotate-180")} />
              </button>
            </div>
          )}

          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === 'reply' ? "Paste message here..." : "What do you want to say? (e.g. tell boss i'm sick)"}
              className={cn(
                "w-full border rounded-2xl pl-4 pr-12 py-4 text-sm outline-none transition-all shadow-sm resize-none min-h-[56px] max-h-40",
                isDarkMode 
                  ? cn(
                      "bg-slate-900 border-slate-800 text-slate-200",
                      mode === 'reply' ? "focus:ring-purple-500/10 focus:border-purple-500/30" : "focus:ring-emerald-500/10 focus:border-emerald-500/30"
                    )
                  : cn(
                      "bg-white border-slate-200 text-slate-800",
                      mode === 'reply' ? "focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/50" : "focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50"
                    )
              )}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all",
                input.trim() && !loading 
                  ? (mode === 'reply' 
                      ? (isDarkMode ? "bg-purple-600 text-white shadow-md hover:bg-purple-500" : "bg-purple-600 text-white shadow-md hover:bg-purple-700")
                      : (isDarkMode ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-500" : "bg-emerald-600 text-white shadow-md hover:bg-emerald-700")
                    )
                  : (isDarkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-100 text-slate-300 cursor-not-allowed")
              )}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400">
            Re-Play can make mistakes. Check important info.
          </p>
        </div>
      </footer>
      {/* General Settings Modal */}
      <AnimatePresence>
        {showGeneralSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGeneralSettings(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-6",
                isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-100"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>General Settings</h3>
                <button 
                  onClick={() => setShowGeneralSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TypeIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Text Size</span>
                  </div>
                  <div className="flex gap-2">
                    {(['sm', 'base', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                          fontSize === size 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                        )}
                      >
                        {size === 'sm' ? 'Small' : size === 'base' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chat Width</span>
                  </div>
                  <div className="flex gap-2">
                    {(['narrow', 'standard', 'wide'] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => setChatWidth(width)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                          chatWidth === width 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                        )}
                      >
                        {width.charAt(0).toUpperCase() + width.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGeneralSettings(false)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


