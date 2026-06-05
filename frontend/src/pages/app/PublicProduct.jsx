import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, User, Phone, MapPin, Award, Shield, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import AccessDenied from '../../components/AccessDenied';

export default function PublicProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const result = await api.getPublicDetails(id, '1');
        setData(result.data);
      } catch (err) {
        console.error('Failed to fetch details:', err);
        if (err.message === 'NOT_FOUND') {
          setError('NOT_FOUND');
        } else {
          setError('FAILED');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching details...</p>
      </div>
    );
  }

  if (error === 'NOT_FOUND' || !data) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Header */}
      <div className="bg-green-600 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Shield className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight">Recover Mode Active</h1>
          <p className="text-green-100 font-medium text-lg">Thank you for helping return this item to its owner.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 space-y-6">
        {/* Reward Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center">
            <Award className="h-4 w-4 mr-2" /> Finder's Reward
          </h2>
          <p className="text-4xl font-black text-primary mb-4">₹ {data.reward_amount || data.reward || '0'}</p>
          <div className="bg-orange-50 rounded-2xl p-4 italic text-gray-700 text-sm border border-orange-100">
            "{data.notes || data.lost_message || 'Please contact me if found. Thank you!'}"
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" /> Item Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Device/Item</p>
                <p className="text-lg font-bold text-gray-900">{data.device_name || data.product_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{data.description || 'No description'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" /> Owner Details
            </h3>
            {data.display_information ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Contact Person</p>
                  <p className="text-sm font-bold text-gray-900">{data.name || data.owner_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Mobile Number</p>
                  <a href={`tel:${data.mobile || data.contact_number}`} className="text-lg font-bold text-primary flex items-center hover:underline">
                    <Phone className="h-5 w-5 mr-2" /> {data.mobile || data.contact_number}
                  </a>
                  {(data.alt_number || data.alternate_contact) && (
                    <a href={`tel:${data.alt_number || data.alternate_contact}`} className="text-sm text-gray-500 block mt-2 hover:underline">
                      Alt: {data.alt_number || data.alternate_contact}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <User className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-900">Contact Hidden</p>
                <p className="text-xs text-gray-500 mt-1">For privacy, the owner has hidden their contact details.</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" /> Address / Location
            </h3>
            {data.display_information ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.address || 'Contact owner for pickup address.'}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Address is hidden for privacy.
              </p>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="text-center pt-8">
          <p className="text-sm text-gray-400 mb-4 font-medium">Secured by ScannHelp System</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
