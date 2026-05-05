import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Edit, Download, Package, User, Phone, MapPin, Award, Shield, AlertTriangle } from 'lucide-react';
import { useRequireAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ViewProduct() {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const found = records.find(r => r.id === id && r.type === 'product');
    if (found) {
      setRecord(found);
    }
  }, [id]);

  const toggleLostStatus = () => {
    const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const index = records.findIndex(r => r.id === id);
    if (index > -1) {
      records[index].is_lost = !records[index].is_lost;
      localStorage.setItem('scannhelp_records', JSON.stringify(records));
      setRecord({ ...records[index] });
      toast.success(`Product marked as ${records[index].is_lost ? 'LOST' : 'SAFE'}`);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('product-qr');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `scannhelp-product-${id}.png`;
    link.href = url;
    link.click();
  };

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Record not found</h2>
        <button onClick={() => navigate('/app/dashboard')} className="mt-4 text-primary font-bold">Go back to Dashboard</button>
      </div>
    );
  }

  const scanUrl = `https://scannhelp.com/app/scan?t_t=1&t_id=${id}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/app/dashboard')} className="p-2 hover:bg-gray-100 rounded-full mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Product Details</h1>
          </div>
          <button 
            onClick={() => navigate(`/app/register/product?id=${id}`)}
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
              id="product-qr"
              value={scanUrl}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{record.device_name}</h2>
          <p className="text-sm text-gray-500 mb-6 font-mono">Tag ID: {id}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              <Download className="h-5 w-5" /> Download QR
            </button>
            <button 
              onClick={toggleLostStatus}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                record.is_lost 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <Shield className="h-5 w-5" /> {record.is_lost ? 'Mark as Safe' : 'Mark as Lost'}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" /> Product Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <p className={`font-bold ${record.is_lost ? 'text-red-600' : 'text-green-600'}`}>
                  {record.is_lost ? 'REPORTED LOST' : 'PROTECTED & SAFE'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Description</p>
                <p className="text-sm text-gray-900">{record.description || 'No description provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" /> Owner Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm font-bold text-gray-900">{record.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Contact</p>
                <p className="text-sm font-bold text-gray-900">{record.mobile}</p>
                {record.alt_number && <p className="text-sm text-gray-500 mt-1">{record.alt_number} (Alt)</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-sm text-gray-900 leading-relaxed">{record.address}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <Award className="h-4 w-4 mr-2" /> Recovery Rewards
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Reward Amount</p>
                <p className="text-lg font-bold text-primary">₹ {record.reward_amount || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Message for Finder</p>
                <p className="text-sm text-gray-600 italic">"{record.notes || 'No recovery notes provided'}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
