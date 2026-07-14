import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// ─── Session ID (persisted per browser) ──────────────────────────────────────
function getOrCreateSessionId() {
  let sid = localStorage.getItem('scannbot_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('scannbot_session_id', sid);
  }
  return sid;
}

const SESSION_ID = getOrCreateSessionId();
const API_URL = 'https://prag-chatbot-production.up.railway.app/api/v1/chat';

// ─── Greeting / Default Messages ─────────────────────────────────────────────
const GREETING_PATTERNS = [
  {
    patterns: ['hi', 'hey', 'hii', 'hiii'],
    responses: [
      "Hey there! 👋 Welcome to ScannHelp! I'm ScannBot, your virtual assistant. What can I help you with today?",
      "Hi! 😊 Great to see you! How can I assist you with ScannHelp today?",
      "Hey! 👋 I'm ScannBot. Feel free to ask me anything about ScannHelp!",
    ],
  },
  {
    patterns: ['hello'],
    responses: [
      "Hello! 👋 I'm ScannBot, ScannHelp's virtual assistant. How can I help you today?",
      "Hello there! 😊 Welcome to ScannHelp. What would you like to know?",
    ],
  },
  {
    patterns: ['good morning', 'gm'],
    responses: [
      "Good morning! ☀️ Hope you're having a great start to your day! How can I assist you with ScannHelp?",
      "Good morning! 🌅 I'm ScannBot, ready to help. What's on your mind today?",
    ],
  },
  {
    patterns: ['good afternoon'],
    responses: [
      "Good afternoon! ☀️ How can I help you with ScannHelp today?",
    ],
  },
  {
    patterns: ['good evening', 'good night', 'gn'],
    responses: [
      "Good evening! 🌙 How can I assist you with ScannHelp tonight?",
      "Good night! 🌟 I'm still here to help. What do you need?",
    ],
  },
  {
    patterns: ['how are you', 'how r you', 'how are u', 'wassup', "what's up", 'whats up'],
    responses: [
      "I'm doing great, thanks for asking! 😊 Ready to help you with anything ScannHelp related!",
      "All systems up and running! 🚀 What can I do for you today?",
    ],
  },
  {
    patterns: ['thanks', 'thank you', 'ty', 'thx', 'thank u'],
    responses: [
      "You're welcome! 😊 Is there anything else I can help you with?",
      "Happy to help! 🙌 Feel free to ask if you have more questions.",
    ],
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'cya', 'later'],
    responses: [
      "Goodbye! 👋 Feel free to come back anytime. Have a great day!",
      "See you later! 😊 Don't hesitate to reach out if you need help.",
    ],
  },
  {
    patterns: ['ok', 'okay', 'alright', 'got it', 'sure'],
    responses: [
      "Great! Let me know if you have any other questions. 😊",
      "Perfect! Feel free to ask anything else.",
    ],
  },
];

// ─── Q&A Knowledge Base ───────────────────────────────────────────────────────
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

// ─── Helper: check greeting ───────────────────────────────────────────────────
function findGreetingAnswer(userText) {
  const lower = userText.toLowerCase().trim();
  for (const entry of GREETING_PATTERNS) {
    for (const pat of entry.patterns) {
      if (
        lower === pat ||
        lower.startsWith(pat + ' ') ||
        lower.endsWith(' ' + pat) ||
        lower.includes(' ' + pat + ' ')
      ) {
        const { responses } = entry;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  return null;
}

// ─── Helper: fuzzy match local QA (requires ≥2 keyword hits) ─────────────────
function findLocalAnswer(userText) {
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

  if (bestScore >= 2) return best.answer;
  return null;
}

// ─── API call to RAG chatbot ──────────────────────────────────────────────────
async function fetchFromAPI(question) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ session_id: SESSION_ID, question }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.answer;
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
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot size={12} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isBot
            ? msg.isError
              ? 'bg-red-50 text-red-700 rounded-bl-sm border border-red-100'
              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
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
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot size={12} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function Chatbot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [apiConnected, setApiConnected] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  // Detect if we're on a small screen (mobile)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('scannbot_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed.messages;
        }
      } catch (e) {
        console.error('Failed to parse stored chat', e);
      }
    }
    return [
      {
        id: 1,
        sender: 'bot',
        text: "Hi there! 👋 I'm ScannBot, your AI-powered virtual assistant. Ask me anything about ScannHelp!",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      'scannbot_chat',
      JSON.stringify({ timestamp: Date.now(), messages })
    );
  }, [messages]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, open]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setUsingApi(false);

    // 1️⃣ Greeting check — instant local reply
    const greetingAnswer = findGreetingAnswer(trimmed);
    if (greetingAnswer) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: greetingAnswer },
        ]);
      }, 500 + Math.random() * 300);
      return;
    }

    // 2️⃣ Local QA match — high-confidence keyword match
    const localAnswer = findLocalAnswer(trimmed);
    if (localAnswer) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: localAnswer },
        ]);
      }, 700 + Math.random() * 400);
      return;
    }

    // 3️⃣ Fall back to RAG API
    setUsingApi(true);
    try {
      const apiAnswer = await fetchFromAPI(trimmed);
      setApiConnected(true);
      setIsTyping(false);
      setUsingApi(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: apiAnswer, isApi: true },
      ]);
    } catch (err) {
      console.error('ScannBot API error:', err);
      setApiConnected(false);
      setIsTyping(false);
      setUsingApi(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble reaching my knowledge base right now. For help, email support@scannhelp.com.",
          isError: true,
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      sender: 'bot',
      text: "Hi there! 👋 I'm ScannBot, your AI-powered virtual assistant. Ask me anything about ScannHelp!"
    }]);
  };

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes tooltipPop {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);    opacity: 0.7; }
          100% { transform: scale(1.65); opacity: 0;   }
        }
        .chat-window-anim   { animation: chatSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .chat-mobile-anim   { animation: chatSlideUp 0.3s ease forwards; }
        .tooltip-pop-anim   { animation: tooltipPop 0.4s ease forwards; }
        .pulse-ring-anim    { animation: pulseRing 2s ease-out infinite; }
      `}</style>

      {/* ── FAB area ── */}
      {/* Desktop: bottom-12 right-12 / Mobile: bottom-5 right-4, smaller button */}
      <div className="fixed bottom-5 right-4 sm:bottom-12 sm:right-12 z-[9998] flex flex-col items-end gap-2 sm:gap-3">
        {showTooltip && !open && !isMobile && (
          <div className="tooltip-pop-anim flex items-center gap-2 bg-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xl border border-gray-100 text-sm text-gray-700 font-medium whitespace-nowrap">
            <Sparkles size={14} className="text-orange-500" />
            Got any questions? I&apos;m happy to help!
          </div>
        )}

        <button
          id="chatbot-toggle-btn"
          onClick={() => { setOpen((o) => !o); setShowTooltip(false); }}
          aria-label="Toggle chatbot"
          className={`relative rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 flex flex-col items-center justify-center gap-0.5
            ${isMobile ? 'w-14 h-14' : 'w-20 h-20'}
          `}
          style={{ boxShadow: '0 8px 30px rgba(255,127,0,0.45)' }}
        >
          {!open && location.pathname === '/' && (
            <span className="pulse-ring-anim absolute inset-0 rounded-full bg-orange-400 opacity-70" />
          )}
          {open ? (
            <ChevronDown size={isMobile ? 22 : 32} />
          ) : (
            <>
              <Bot size={isMobile ? 20 : 28} />
              {!isMobile && (
                <span className="text-[11px] font-bold tracking-widest leading-none">ASK ME</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <>
          {/* Mobile: full-screen overlay */}
          {isMobile ? (
            <div
              className="chat-mobile-anim fixed inset-0 z-[9997] bg-white flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm leading-tight">ScannBot</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300" style={{ boxShadow: '0 0 6px #86efac' }} />
                    <p className="text-orange-100 text-xs">Online · AI-Powered</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    id="chatbot-clear-btn"
                    onClick={clearChat}
                    title="Reset Chat"
                    className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] text-white font-medium transition-colors"
                    aria-label="Clear chat"
                  >
                    Clear
                  </button>
                  <button
                    id="chatbot-close-btn"
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="Close chatbot"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/60">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isTyping}
                      className="whitespace-nowrap text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-3 py-1.5 rounded-full border border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div className="px-3 py-2 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  id="chatbot-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  disabled={isTyping}
                  className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder-gray-400 text-gray-800 disabled:opacity-60"
                  style={{ caretColor: '#f97316', fontSize: '16px' /* Prevents iOS zoom */ }}
                />
                <button
                  id="chatbot-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Desktop: floating window */
            <div
              className="chat-window-anim fixed bottom-36 right-12 z-[9997] w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
              style={{ height: '520px', maxWidth: 'calc(100vw - 3rem)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
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
                    <p className="text-orange-100 text-xs">Online · AI-Powered</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="chatbot-clear-btn"
                    onClick={clearChat}
                    title="Reset Chat"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-xs text-white"
                    aria-label="Clear chat"
                  >
                    Clear
                  </button>
                  <button
                    id="chatbot-close-btn"
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="Close chatbot"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/60">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator isApi={usingApi} />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              <div className="px-4 py-2 border-t border-gray-100 bg-white">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Suggested questions
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isTyping}
                      className="whitespace-nowrap text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-3 py-1.5 rounded-full border border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isTyping}
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-400 text-gray-800 disabled:opacity-60"
                  style={{ caretColor: '#f97316' }}
                />
                <button
                  id="chatbot-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
