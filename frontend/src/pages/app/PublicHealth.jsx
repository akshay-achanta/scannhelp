import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Shield, AlertTriangle, Loader2, ArrowLeft, Heart, Lock, Stethoscope } from 'lucide-react';
import { api } from '../../services/api';
import AccessDenied from '../../components/AccessDenied';

export default function PublicHealth() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const result = await api.getPublicDetails(id, '2');
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

  const isPublic = data.display_information;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-red-600 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Shield className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight">Emergency Medical Profile</h1>
          <p className="text-red-100 font-medium text-lg">Critical health information for emergency responders.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 space-y-6">

        {/* Medical Info — ALWAYS visible regardless of privacy setting */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
            <Stethoscope className="h-4 w-4 mr-2" /> Medical Info
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Name</p>
              <p className="text-xl font-bold text-gray-900">{data.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Blood Group</p>
                <p className="text-lg font-bold text-red-600">{data.blood_group || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Allergies</p>
                <p className="text-sm font-bold text-gray-900">{data.allergies || 'None'}</p>
              </div>
            </div>

            {data.conditions && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Health Issues</p>
                <p className="text-sm text-gray-900">{data.conditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full details — only shown when Public View is enabled */}
        {isPublic ? (
          <>
            {/* Special Instructions */}
            {data.notes && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" /> Special Instructions
                </h2>
                <div className="bg-orange-50 rounded-2xl p-4 italic text-gray-700 text-sm border border-orange-100">
                  {`"${data.notes}"`}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Additional Medical Details */}
              {(data.medications || data.physically_disabled) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                    <Heart className="h-4 w-4 mr-2" /> Additional Details
                  </h3>
                  <div className="space-y-4">
                    {data.medications && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Medications</p>
                        <p className="text-sm text-gray-900">{data.medications}</p>
                      </div>
                    )}
                    {data.physically_disabled && (
                      <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-900">Physically Disabled</p>
                          <p className="text-xs text-red-700">Patient has physical limitations. Please assist with care.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <Phone className="h-4 w-4 mr-2" /> Emergency Contact
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Contact Person</p>
                    <p className="text-sm font-bold text-gray-900">{data.emergency_contact || data.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Mobile Number</p>
                    <a href={`tel:${data.mobile || data.emergency_phone || data.contact_number}`} className="text-lg font-bold text-primary flex items-center hover:underline">
                      <Phone className="h-5 w-5 mr-2" /> {data.mobile || data.emergency_phone || data.contact_number}
                    </a>
                    {(data.alt_number || data.alternate_contact) && (
                      <a href={`tel:${data.alt_number || data.alternate_contact}`} className="text-sm text-gray-500 block mt-2 hover:underline">
                        Alt: {data.alt_number || data.alternate_contact}
                      </a>
                    )}
                    {data.primary_doctor_number && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-0.5">Primary Doctor</p>
                        <a href={`tel:${data.primary_doctor_number}`} className="text-sm font-bold text-gray-900 block hover:underline">
                          <Phone className="h-3 w-3 inline mr-1" /> {data.primary_doctor_number}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> Address / Location
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {data.address || 'Contact owner for pickup address.'}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Privacy is ON — contact and extra medical details hidden */
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-base font-bold text-gray-700">Contact & Address Details are Private</p>
            <p className="text-sm text-gray-400 mt-1">The owner has restricted access to their emergency contact and location information.</p>
          </div>
        )}

        {/* Footer */}
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
