import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Crown, Zap, Shield, Check, Lock, Loader2,
  Download, QrCode, Sparkles, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'trial',
    name: 'Trial',
    subtitle: 'Try before you commit',
    price: 0,
    period: '14 days',
    badge: 'Free',
    color: 'gray',
    icon: Clock,
    current: true,
    qrLimit: 1,
    features: [
      { text: '1 QR tag registration', available: true },
      { text: '1 QR code generator', available: true },
      { text: 'Basic lost mode', available: true },
      { text: 'Public scan page', available: true },
      { text: 'Priority support', available: false },
      { text: 'Multiple health profiles', available: false },
      { text: 'Analytics & insights', available: false },
      { text: 'Bulk tag management', available: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'For personal protection',
    price: 49,
    period: 'per month',
    badge: null,
    color: 'blue',
    icon: Shield,
    current: false,
    qrLimit: 5,
    features: [
      { text: '5 QR tag registrations', available: true },
      { text: '5 QR code generators', available: true },
      { text: 'Advanced lost mode wizard', available: true },
      { text: 'Public scan page', available: true },
      { text: 'Email support', available: true },
      { text: '2 Health profiles', available: true },
      { text: 'Analytics & insights', available: false },
      { text: 'Bulk tag management', available: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For individuals & families',
    price: 99,
    period: 'per month',
    badge: 'Popular',
    color: 'indigo',
    icon: Zap,
    current: false,
    qrLimit: 15,
    features: [
      { text: '15 QR tag registrations', available: true },
      { text: '15 QR code generators', available: true },
      { text: 'Advanced lost mode wizard', available: true },
      { text: 'Public scan page', available: true },
      { text: 'Priority support', available: true },
      { text: '5 Health profiles', available: true },
      { text: 'Analytics & insights', available: true },
      { text: 'Bulk tag management', available: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    subtitle: 'For teams & businesses',
    price: 299,
    period: 'per month',
    badge: 'Best Value',
    color: 'purple',
    icon: Crown,
    current: false,
    qrLimit: 999,
    features: [
      { text: 'Unlimited QR registrations', available: true },
      { text: 'Unlimited QR generators', available: true },
      { text: 'Advanced lost mode wizard', available: true },
      { text: 'Public scan page', available: true },
      { text: 'Dedicated support', available: true },
      { text: 'Unlimited Health profiles', available: true },
      { text: 'Analytics & insights', available: true },
      { text: 'Bulk tag management', available: true },
    ],
  },
];

const colorMap = {
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: 'bg-gray-100 text-gray-500',
    btn: 'bg-gray-800 hover:bg-gray-900 text-white',
    qrBtn: 'bg-gray-700 hover:bg-gray-800 text-white',
    check: 'text-gray-500',
    headerText: 'text-gray-900',
    ring: '',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200',
    qrBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
    check: 'text-blue-500',
    headerText: 'text-blue-900',
    ring: '',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-400 ring-2 ring-indigo-400',
    badge: 'bg-indigo-600 text-white',
    icon: 'bg-indigo-100 text-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200',
    qrBtn: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    check: 'text-indigo-500',
    headerText: 'text-indigo-900',
    ring: 'ring-2 ring-indigo-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-600 text-white',
    icon: 'bg-purple-100 text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200',
    qrBtn: 'bg-purple-500 hover:bg-purple-600 text-white',
    check: 'text-purple-500',
    headerText: 'text-purple-900',
    ring: '',
  },
};

// QR Generator Modal
function QRGeneratorModal({ plan, onClose }) {
  const [tagId, setTagId] = useState('');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!tagId.trim()) {
      toast.error('Please enter a Tag ID');
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 800);
  };

  const handleDownload = () => {
    const canvas = document.getElementById('sub-qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `scannhelp-qr-${tagId}.png`;
    link.href = url;
    link.click();
    toast.success('QR Code downloaded!');
  };

  const qrUrl = `https://scannhelp.com/app/scan?t_t=1&t_id=${tagId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            Generate QR Code
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tag ID</label>
            <input
              type="text"
              value={tagId}
              onChange={e => { setTagId(e.target.value); setGenerated(false); }}
              placeholder="e.g. abc123xyz"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
            />
            <p className="text-[10px] text-gray-400 mt-1 font-mono">
              URL: scannhelp.com/app/scan?t_id={tagId || '...'}
            </p>
          </div>

          {generated && tagId && (
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <QRCodeCanvas
                  id="sub-qr-canvas"
                  value={qrUrl}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-gray-500 text-center font-mono break-all">{qrUrl}</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !tagId.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            {generating ? 'Generating...' : generated ? 'Re-generate' : 'Generate QR Code'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Plan: <strong>{plan.name}</strong> · {plan.qrLimit === 999 ? 'Unlimited' : plan.qrLimit} QR{plan.qrLimit !== 1 ? 's' : ''} allowed
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Subscriptions() {
  useRequireAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const [qrModalPlan, setQrModalPlan] = useState(null);

  const handleSubscribe = (plan) => {
    if (plan.current) return;
    setLoadingId(plan.id);
    setTimeout(() => {
      setLoadingId(null);
      toast.success(`${plan.name} plan selected! Payment gateway coming soon.`, { icon: '💳' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-5 gap-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-xs text-gray-500">Manage your plan and generate QR codes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-indigo-100">
            <Crown className="h-3.5 w-3.5" /> Choose Your Plan
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Start Free. Grow Anytime.</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Start with the Trial plan, generate your first QR, and upgrade when you need more protection.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'yearly' ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-semibold ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
              Yearly <span className="text-xs text-green-600 font-bold ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Current Plan Banner */}
        <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-green-800 font-medium">
            You are currently on the <strong>Trial Plan</strong>. Upgrade anytime to unlock more QR codes and features.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {plans.map(plan => {
            const c = colorMap[plan.color];
            const Icon = plan.icon;
            const isLoading = loadingId === plan.id;
            const displayPrice = billing === 'yearly' && plan.price > 0
              ? Math.round(plan.price * 0.8)
              : plan.price;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl border-2 ${c.border} shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
              >
                {plan.badge && (
                  <div className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${c.badge}`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`${c.bg} p-5 pb-4`}>
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${c.icon} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`text-lg font-extrabold ${c.headerText}`}>{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.subtitle}</p>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-black text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-gray-900">₹{displayPrice}</span>
                        <span className="text-xs text-gray-400">{plan.period}</span>
                      </>
                    )}
                  </div>
                  {billing === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Save ₹{(plan.price - displayPrice) * 12}/yr
                    </p>
                  )}
                </div>

                <div className="p-5 pt-4 flex flex-col flex-1">
                  {/* QR Limit Badge */}
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <QrCode className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-700">
                      {plan.qrLimit === 999 ? 'Unlimited' : plan.qrLimit} QR Code{plan.qrLimit !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map(f => (
                      <li key={f.text} className={`flex items-start gap-2 text-xs ${f.available ? 'text-gray-700' : 'text-gray-300'}`}>
                        {f.available ? (
                          <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${c.check}`} />
                        ) : (
                          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-300" />
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {/* Generate QR Button */}
                  <button
                    onClick={() => setQrModalPlan(plan)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2 ${c.qrBtn}`}
                  >
                    <QrCode className="h-4 w-4" />
                    Generate QR
                  </button>

                  {/* Subscribe / Current */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={plan.current || isLoading}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : c.btn
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plan.current ? (
                      <><Check className="h-4 w-4" /> Current Plan</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Upgrade</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Perks Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Secure & Private', desc: 'Data encrypted, never sold.' },
            { icon: Clock, title: 'Cancel Anytime', desc: 'No lock-in. Downgrade freely.' },
            { icon: Sparkles, title: 'Instant Activation', desc: 'Upgrades take effect immediately.' },
            { icon: QrCode, title: 'Always Generate', desc: 'Every plan includes QR generation.' },
          ].map(perk => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl mb-3">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{perk.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Have questions?{' '}
            <a href="mailto:support@scannhelp.com" className="text-indigo-600 font-semibold hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* QR Generator Modal */}
      {qrModalPlan && (
        <QRGeneratorModal plan={qrModalPlan} onClose={() => setQrModalPlan(null)} />
      )}
    </div>
  );
}
