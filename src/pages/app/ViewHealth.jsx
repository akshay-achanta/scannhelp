import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Edit, Download, HeartPulse, User, Phone, MapPin, Activity, ShieldCheck, Stethoscope, AlertCircle } from 'lucide-react';
import { useRequireAuth } from '../../hooks/useAuth';

export default function ViewHealth() {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const found = records.find(r => r.id === id && r.type === 'health');
    if (found) {
      setRecord(found);
    }
  }, [id]);

  const downloadQR = () => {
    const canvas = document.getElementById('health-qr');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `scannhelp-health-${id}.png`;
    link.href = url;
    link.click();
  };

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Health Record not found</h2>
        <button onClick={() => navigate('/app/dashboard')} className="mt-4 text-primary font-bold">Go back to Dashboard</button>
      </div>
    );
  }

  const scanUrl = `https://scannhelp.com/app/scan?t_t=2&t_id=${id}`;
  const isHidden = !record.display_information;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/app/dashboard')} className="p-2 hover:bg-gray-100 rounded-full mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Health Profile</h1>
          </div>
          <button 
            onClick={() => navigate(`/app/register/health?id=${id}`)}
            className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors"
          >
            <Edit className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* QR Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-6">
            <QRCodeCanvas 
              id="health-qr"
              value={scanUrl}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{record.name}</h2>
          <p className="text-sm text-gray-500 mb-6 font-mono">Profile ID: {id}</p>
          
          <button 
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all mx-auto"
          >
            <Download className="h-5 w-5" /> Download QR
          </button>
        </div>

        {/* Security Alert if hidden */}
        {isHidden && (
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-800">Privacy Enabled</p>
              <p className="text-xs text-orange-700">Sensitive medical details are currently hidden from public scans.</p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" /> Medical Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Blood Group</p>
                <p className="text-lg font-bold text-red-600">{isHidden ? '••••' : record.blood_group}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Health Issues</p>
                <p className="text-sm text-gray-900">{record.existing_health_issues || 'None reported'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Allergies</p>
                <p className="text-sm text-gray-900">{record.allergies || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Phone className="h-4 w-4 mr-2" /> Emergency Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Primary Phone</p>
                <p className="text-sm font-bold text-gray-900">{record.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Primary Doctor</p>
                <p className="text-sm font-bold text-gray-900">{isHidden ? '••••••••••' : (record.primary_doctor_number || 'N/A')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-sm text-gray-900 leading-relaxed">{record.address}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Additional Notes
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Medicines</p>
                <p className="text-sm text-gray-900">{isHidden ? 'Hidden for privacy' : (record.existing_medicines || 'None reported')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Other Notes</p>
                <p className="text-sm text-gray-600">{record.notes || 'No extra notes provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
