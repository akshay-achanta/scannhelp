import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import {
  ArrowLeft, ShoppingCart, Smartphone, Printer, Layers, Star,
  CheckCircle2, Loader2, Shield, Zap, Droplets, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const tagTypes = [
  {
    id: 'digital',
    name: 'Digital QR',
    subtitle: 'Instant — no delivery needed',
    price: 29,
    originalPrice: null,
    badge: null,
    color: 'blue',
    icon: Smartphone,
    delivery: 'Instant download',
    deliveryIcon: Zap,
    description:
      'Get a downloadable, high-resolution QR code you can print yourself, set as a wallpaper, or share online.',
    features: [
      'High-res PNG + SVG file',
      'Instantly available',
      'Print at home / local shop',
      'Lifetime valid link',
      'Free replacement if link breaks',
    ],
  },
  {
    id: 'printed',
    name: 'Printed QR Tag',
    subtitle: 'Physical sticker tag',
    price: 79,
    originalPrice: 99,
    badge: 'Popular',
    color: 'orange',
    icon: Printer,
    delivery: '3–5 business days',
    deliveryIcon: Shield,
    description:
      'A premium adhesive sticker tag printed on durable vinyl. Stick it on your bag, laptop, or any item.',
    features: [
      'Durable vinyl sticker',
      'Strong adhesive backing',
      'Weatherproof (light splash)',
      'Compact 4×4 cm size',
      'Free re-delivery if lost in transit',
    ],
  },
  {
    id: 'laminated',
    name: 'Laminated QR Tag',
    subtitle: 'Waterproof & scratch-proof',
    price: 129,
    originalPrice: 169,
    badge: 'Best Value',
    color: 'green',
    icon: Layers,
    delivery: '3–5 business days',
    deliveryIcon: Droplets,
    description:
      'Heavy-duty laminated card tag. Fully waterproof, scratch-proof and flexible. Built to last for years.',
    features: [
      'Full waterproof lamination',
      'Scratch & UV resistant',
      'Flexible card (won\'t crack)',
      'Lanyard hole + key-ring ready',
      'Multiple sizes available',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Metal Tag',
    subtitle: 'Elegant & ultra-durable',
    price: 299,
    originalPrice: 399,
    badge: 'Premium',
    color: 'purple',
    icon: Star,
    delivery: '5–7 business days',
    deliveryIcon: Award,
    description:
      'Laser-engraved stainless steel tag. The most durable and stylish way to protect your valuables.',
    features: [
      'Stainless steel body',
      'Laser-engraved QR (never fades)',
      'Works wet, hot, or cold',
      'Includes split ring & carabiner',
      'Premium gift packaging',
    ],
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700',
    check: 'text-blue-500',
    delivery: 'text-blue-600 bg-blue-50',
    glow: 'shadow-blue-100',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500 text-white',
    icon: 'bg-orange-100 text-orange-600',
    btn: 'bg-orange-500 hover:bg-orange-600',
    check: 'text-orange-500',
    delivery: 'text-orange-700 bg-orange-50',
    glow: 'shadow-orange-100',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-600 text-white',
    icon: 'bg-green-100 text-green-600',
    btn: 'bg-green-600 hover:bg-green-700',
    check: 'text-green-500',
    delivery: 'text-green-700 bg-green-50',
    glow: 'shadow-green-100',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-600 text-white',
    icon: 'bg-purple-100 text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700',
    check: 'text-purple-500',
    delivery: 'text-purple-700 bg-purple-50',
    glow: 'shadow-purple-100',
  },
};

export default function Shop() {
  useRequireAuth();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState(null);
  const [selected, setSelected] = useState('printed');

  const handleBuy = (tag) => {
    setAddingId(tag.id);
    setTimeout(() => {
      setAddingId(null);
      
      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('scannhelp_orders') || '[]');
      orders.push({
        id: Math.random().toString(36).substring(2, 9),
        tagId: tag.id,
        tagName: tag.name,
        price: tag.price,
        date: new Date().toISOString(),
        status: 'Processing'
      });
      localStorage.setItem('scannhelp_orders', JSON.stringify(orders));
      
      toast.success(`${tag.name} order placed! (Payment gateway coming soon)`, { icon: '🛒' });
      navigate('/app/dashboard/shop'); // Go back to dashboard shop tab to see the order
    }, 1200);
  };

  const selectedTag = tagTypes.find(t => t.id === selected);
  const c = colorMap[selectedTag.color];

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
              <h1 className="text-xl font-bold text-gray-900">QR Tag Shop</h1>
              <p className="text-xs text-gray-500">Choose the tag type that fits your needs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#534AB7] to-[#7c6ee0] rounded-3xl p-8 mb-10 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-200">ScannHelp Store</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 leading-tight">Pick Your Tag Type</h2>
            <p className="text-indigo-100 text-sm max-w-md">
              From instant digital codes to indestructible metal tags — we have the right protection for every item.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['Free Delivery above ₹199', 'Lifetime Valid Links', 'Instant Setup'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-300" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {tagTypes.map(tag => {
            const Icon = tag.icon;
            const tc = colorMap[tag.color];
            const isActive = selected === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelected(tag.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                  isActive
                    ? `${tc.bg} ${tc.border} text-gray-900 shadow-sm`
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? tc.check : 'text-gray-400'}`} />
                {tag.name}
                {tag.badge && isActive && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tc.badge}`}>{tag.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail Card */}
        <div className={`bg-white rounded-3xl border-2 ${c.border} shadow-xl ${c.glow} overflow-hidden`}>
          <div className={`${c.bg} px-8 pt-8 pb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-5">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${c.icon} shrink-0`}>
                  {(() => { const Icon = selectedTag.icon; return <Icon className="h-8 w-8" />; })()}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-extrabold text-gray-900">{selectedTag.name}</h3>
                    {selectedTag.badge && (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${c.badge}`}>
                        {selectedTag.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{selectedTag.subtitle}</p>
                  <p className="text-sm text-gray-600 max-w-md leading-relaxed">{selectedTag.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-4xl font-black text-gray-900">₹{selectedTag.price}</span>
                  {selectedTag.originalPrice && (
                    <span className="text-base text-gray-400 line-through">₹{selectedTag.originalPrice}</span>
                  )}
                </div>
                {selectedTag.originalPrice && (
                  <p className="text-xs text-green-600 font-bold mt-1">
                    You save ₹{selectedTag.originalPrice - selectedTag.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 grid sm:grid-cols-2 gap-8">
            {/* Features */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">What's Included</h4>
              <ul className="space-y-3">
                {selectedTag.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${c.check}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery + CTA */}
            <div className="flex flex-col justify-between gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery</h4>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${c.delivery} border border-current/10`}>
                  {(() => { const Icon = selectedTag.deliveryIcon; return <Icon className="h-5 w-5 shrink-0" />; })()}
                  <div>
                    <p className="font-bold text-sm">{selectedTag.delivery}</p>
                    <p className="text-xs opacity-70">
                      {selectedTag.id === 'digital'
                        ? 'QR files sent to your registered email'
                        : 'Shipped to your address via courier'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBuy(selectedTag)}
                disabled={addingId === selectedTag.id}
                className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${c.btn} disabled:opacity-70`}
              >
                {addingId === selectedTag.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {addingId === selectedTag.id ? 'Processing...' : `Order ${selectedTag.name} — ₹${selectedTag.price}`}
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Row */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">Quick Comparison</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tagTypes.map(tag => {
              const Icon = tag.icon;
              const tc = colorMap[tag.color];
              const isActive = selected === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelected(tag.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                    isActive ? `${tc.bg} ${tc.border}` : 'bg-white border-gray-100'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${tc.icon} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{tag.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tag.subtitle}</p>
                  <p className={`text-lg font-black mt-2 ${isActive ? tc.check : 'text-gray-900'}`}>₹{tag.price}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
