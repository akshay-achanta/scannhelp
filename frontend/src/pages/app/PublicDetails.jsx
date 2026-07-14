import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Package, User, Phone, MapPin, Award, Shield,
  AlertTriangle, Loader2, ArrowLeft, Heart, CheckCircle2, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import AccessDenied from '../../components/AccessDenied';

export default function PublicDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const t_t = searchParams.get('t_t') || '1';
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // null | 'NOT_FOUND' | 'NETWORK'

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchDetails() {
      try {
        const result = await Promise.race([
          api.getPublicDetails(id, t_t),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 10000)
          ),
        ]);
        if (!cancelled) setData(result.data);
      } catch (err) {
        if (cancelled) return;
        if (err.message === 'NOT_FOUND') setError('NOT_FOUND');
        else setError('NETWORK');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetails();
    return () => { cancelled = true; };
  }, [id, t_t]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching details…</p>
      </div>
    );
  }

  // ── Error — not found ──────────────────────────────────────────────────────
  if (error === 'NOT_FOUND' || !data) {
    return <AccessDenied />;
  }

  // ── Error — network ────────────────────────────────────────────────────────
  if (error === 'NETWORK') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          Could not reach the server. Please check your internet and try again.
        </p>
        <button
          onClick={() => { setError(null); setLoading(true); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-primary/25 transition-all active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const isProduct = t_t === '1';

  // ── Product: Lost / Health: always shown ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className={`${isProduct ? 'bg-green-600' : 'bg-red-600'} text-white py-12 px-4 text-center`}>
        <div className="max-w-3xl mx-auto">
          <Shield className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight">
            {isProduct ? 'Recover Mode Active' : 'Emergency Medical Profile'}
          </h1>
          <p className={`${isProduct ? 'text-green-100' : 'text-red-100'} font-medium text-lg`}>
            {isProduct
              ? 'Thank you for helping return this item to its owner.'
              : 'Critical health information for emergency responders.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 space-y-6">
        {/* Reward / Special Instructions */}
        {isProduct ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <Award className="h-4 w-4" /> Finder's Reward
            </h2>
            <p className="text-4xl font-black text-primary mb-4">
              ₹ {data.reward_amount || '0'}
            </p>
            <div className="bg-orange-50 rounded-2xl p-4 italic text-gray-700 text-sm border border-orange-100">
              "{data.notes || 'Please contact me if found. Thank you!'}"
            </div>
          </div>
        ) : (
          data.notes && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" /> Special Instructions
              </h2>
              <div className="bg-orange-50 rounded-2xl p-4 italic text-gray-700 text-sm border border-orange-100">
                "{data.notes}"
              </div>
            </div>
          )
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Item / Emergency Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              {isProduct ? <Package className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              {isProduct ? 'Item Info' : 'Emergency Info'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{isProduct ? 'Device / Item' : 'Name'}</p>
                <p className="text-lg font-bold text-gray-900">
                  {data.device_name || data.name || '—'}
                </p>
              </div>
              {isProduct ? (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.description || 'No description'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Blood Group</p>
                      <p className="text-sm font-bold text-red-600">{data.blood_group || 'N/A'}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Allergies</p>
                      <p className="text-sm font-bold text-gray-900">{data.allergies || 'None'}</p>
                    </div>
                  </div>
                  {data.conditions && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Health Conditions</p>
                      <p className="text-sm text-gray-700">{data.conditions}</p>
                    </div>
                  )}
                  {data.medications && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Medications</p>
                      <p className="text-sm text-gray-700">{data.medications}</p>
                    </div>
                  )}
                  {data.physically_disabled && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Physically Disabled</p>
                      <p className="text-sm font-bold text-red-600">Yes</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Owner / Emergency Contact */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              {isProduct ? 'Owner Details' : 'Emergency Contact'}
            </h3>
            {data.display_information ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Contact Person</p>
                  <p className="text-sm font-bold text-gray-900">
                    {data.name || data.emergency_contact || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                  <a
                    href={`tel:${data.mobile || data.emergency_phone}`}
                    className="text-xl font-bold text-primary flex items-center gap-2 hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    {data.mobile || data.emergency_phone || '—'}
                  </a>
                  {data.alt_number && (
                    <a
                      href={`tel:${data.alt_number}`}
                      className="text-sm text-gray-500 block mt-2 hover:underline"
                    >
                      Alt: {data.alt_number}
                    </a>
                  )}
                  {!isProduct && data.primary_doctor_number && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-0.5">Primary Doctor</p>
                      <a
                        href={`tel:${data.primary_doctor_number}`}
                        className="text-sm font-bold text-gray-900 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" /> {data.primary_doctor_number}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <User className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-900">Contact Hidden</p>
                <p className="text-xs text-gray-500 mt-1">
                  For privacy, the owner has hidden their contact details.
                </p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Address / Location
            </h3>
            {data.display_information ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.address || 'Contact owner for pickup address.'}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">Address is hidden for privacy.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <p className="text-xs text-gray-400 mb-4 font-medium">Secured by ScannHelp System</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Exit
          </button>
        </div>
      </div>
    </div>
  );
}
