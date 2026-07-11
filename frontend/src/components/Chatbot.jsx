import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// ─── Q&A Knowledge Base ──────────────────────────────────────────────────────
const QA_PAIRS = [
  {
    keywords: ['what', 'scannhelp', 'about', 'platform', 'service'],
    question: 'What is ScannHelp?',
    answer:
      'ScannHelp is a smart QR-code–based product & health-record management platform. Scan any registered QR code to instantly access product details, warranty info, or health records — no app required.',
  },
  {
    keywords: ['register', 'product', 'add', 'create'],
    question: 'How do I register a product?',
    answer:
      'Go to Dashboard → Register Product. Fill in the product name, category, purchase date, warranty info, and upload images. A unique QR code will be generated that you can stick on your product.',
  },
  {
    keywords: ['health', 'record', 'medical', 'report'],
    question: 'Can I store health records?',
    answer:
      'Yes! ScannHelp supports health record registration. Navigate to Dashboard → Register Health Record to upload medical reports, prescriptions, and emergency info linked to a scannable QR code.',
  },
  {
    keywords: ['scan', 'qr', 'code', 'read'],
    question: 'How do I scan a QR code?',
    answer:
      "Point any smartphone camera at the QR code or use the /app/scan route. The system will redirect you to that item's public details page — no login needed for public records.",
  },
  {
    keywords: ['subscription', 'plan', 'pricing', 'cost', 'free', 'paid'],
    question: 'What subscription plans are available?',
    answer:
      'ScannHelp offers a free tier (up to 5 QR registrations) and premium plans with unlimited registrations, priority support, and advanced analytics. Visit the Subscriptions page for full details.',
  },
  {
    keywords: ['login', 'signup', 'account', 'sign up', 'sign in'],
    question: 'How do I create an account?',
    answer:
      "Click Sign Up on the top navigation bar. Enter your name, email, and password. You'll receive a confirmation email — verify it and you're good to go!",
  },
  {
    keywords: ['password', 'forgot', 'reset', 'change'],
    question: 'I forgot my password. What do I do?',
    answer:
      "Click Forgot Password on the login page and enter your registered email. You'll receive a password reset link within a few minutes.",
  },
  {
    keywords: ['share', 'public', 'view', 'link', 'access'],
    question: 'Can others view my registered items?',
    answer:
      'Each QR code has a public-facing page that shows only the info you choose to make public. Sensitive fields stay private and secure.',
  },
  {
    keywords: ['shop', 'buy', 'purchase', 'store'],
    question: 'Is there a shop on ScannHelp?',
    answer:
      'Yes! The ScannHelp Shop lets you purchase QR labels, stickers, and accessories directly from your dashboard.',
  },
  {
    keywords: ['contact', 'support', 'help', 'issue', 'problem'],
    question: 'How can I get support?',
    answer:
      'You can reach us through the Contact page or email support@scannhelp.com. Our team typically responds within 24 hours on business days.',
  },
];

const SUGGESTED_QUESTIONS = [
  'What is ScannHelp?',
  'How do I register a product?',
  'Can I store health records?',
  'What subscription plans are available?',
];

// ─── Helper: fuzzy match ──────────────────────────────────────────────────────
function findAnswer(userText) {
  const lower = userText.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const pair of QA_PAIRS) {
    const score = pair.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = pair;
    }
  }

  if (bestScore >= 1) return best.answer;
  return "I'm not sure about that yet. For detailed help, please visit our Contact page or email support@scannhelp.com — we'd love to assist you!";
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.sender === 'bot';
  return (
    <div
      className={`flex gap-2 items-end ${isBot ? 'justify-start' : 'justify-end'}`}
      style={{ animation: 'chatFadeUp 0.3s ease forwards' }}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
            : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-br-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end justify-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function Chatbot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('scannbot_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check expiration (1 hour = 3600000 ms)
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed.messages;
        }
      } catch (e) {
        console.error("Failed to parse stored chat", e);
      }
    }
    return [
      {
        id: 1,
        sender: 'bot',
        text: "Hi there! I'm ScannBot, your virtual assistant. How can I help you today?",
      },
    ];
  });

  // Save to local storage whenever messages change
  useEffect(() => {
    localStorage.setItem(
      'scannbot_chat',
      JSON.stringify({
        timestamp: Date.now(),
        messages: messages,
      })
    );
  }, [messages]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hide tooltip after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: findAnswer(trimmed),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 900 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes tooltipPop {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.65); opacity: 0;  }
        }
        .chat-window-anim {
          animation: chatSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .tooltip-pop-anim {
          animation: tooltipPop 0.4s ease forwards;
        }
        .pulse-ring-anim {
          animation: pulseRing 2s ease-out infinite;
        }
      `}</style>

      {/* ── Floating Action Button area ── */}
      <div className="fixed bottom-12 right-12 z-[9998] flex flex-col items-end gap-3">

        {/* Tooltip bubble */}
        {showTooltip && !open && (
          <div className="tooltip-pop-anim flex items-center gap-2 bg-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xl border border-gray-100 text-sm text-gray-700 font-medium whitespace-nowrap">
            <Sparkles size={14} className="text-orange-500" />
            Got any questions? I&apos;m happy to help!
          </div>
        )}

        {/* FAB button */}
        <button
          id="chatbot-toggle-btn"
          onClick={() => {
            setOpen((o) => !o);
            setShowTooltip(false);
          }}
          aria-label="Toggle chatbot"
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 flex flex-col items-center justify-center gap-0.5"
          style={{ boxShadow: '0 8px 30px rgba(255,127,0,0.45)' }}
        >
          {/* Pulse ring - only on landing page */}
          {!open && location.pathname === '/' && (
            <span
              className="pulse-ring-anim absolute inset-0 rounded-full bg-orange-400 opacity-70"
            />
          )}
          {open ? (
            <ChevronDown size={32} />
          ) : (
            <>
              <Bot size={28} />
              <span className="text-[11px] font-bold tracking-widest leading-none">ASK ME</span>
            </>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="chat-window-anim fixed bottom-36 right-12 z-[9997] w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{
            height: '520px',
            maxWidth: 'calc(100vw - 3rem)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-tight">ScannBot</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-300" style={{ boxShadow: '0 0 6px #86efac' }} />
                <p className="text-orange-100 text-xs">Online · Always here to help</p>
              </div>
            </div>
            <button
              id="chatbot-close-btn"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close chatbot"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/60">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions – always shown */}
          <div className="px-4 py-2 border-t border-gray-100 bg-white">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1" style={{ flexWrap: 'nowrap' }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="whitespace-nowrap text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-3 py-1.5 rounded-full border border-orange-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800"
              style={{ caretColor: '#f97316' }}
            />
            <button
              id="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
              }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
