import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assistantApi } from '../../services/api';
import {
  Bot, X, Send, Sparkles, ChevronRight,
  Minimize2, Maximize2
} from 'lucide-react';

interface FloatingAssistantProps {
  onNavigate?: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  actions?: { label: string; route: string }[];
  timestamp: string;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! 👋 I am your CareerAI Coach.\n\nI can analyze your resume strengths, explain job matches, suggest high-impact bullet rewrites, or prepare you for upcoming mock interviews. How can I help you today?`,
      suggestions: [
        "What skills should I learn for an AI Engineer role?",
        "Improve my resume summary",
        "Give me 5 mock interview questions",
        "What projects will get me hired?"
      ],
      actions: [
        { label: "View Skill Gap Analyzer", route: "skills" },
        { label: "Browse Matched Jobs", route: "jobs" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.chat(textToSend);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: res.reply,
        suggestions: res.suggestions,
        actions: res.recommended_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "I experienced a brief connection hiccup. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-900 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask CareerAI</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div
          className={`glass-card border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isExpanded ? 'w-[90vw] md:w-[680px] h-[80vh]' : 'w-[90vw] sm:w-[420px] h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  CareerAI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">Context-Aware AI Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>

                {/* Suggestions and Action Chips */}
                {m.sender === 'assistant' && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[90%]">
                    {/* Action Links */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.actions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (onNavigate) onNavigate(act.route.replace('/', ''));
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-all"
                          >
                            <span>{act.label}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick followup chips */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-left"
                          >
                            ✨ {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none max-w-[70%]">
                <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-xs text-slate-400 animate-pulse">CareerAI is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your resume, jobs, or interview tips..."
                className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
