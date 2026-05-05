import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { 
  Plus, 
  Package, 
  HeartPulse, 
  ChevronRight, 
  MapPin, 
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [records, setRecords] = useState([]);
  const [showSheet, setShowSheet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    setRecords(savedRecords);
  }, []);

  const productRecords = records.filter(r => r.type === 'product');
  const healthRecords = records.filter(r => r.type === 'health');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
            <div className="flex mt-6 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'products' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 Products
                {activeTab === 'products' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'health' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏥 Health
                {activeTab === 'health' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' ? (
          <div className="space-y-4">
            {productRecords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productRecords.map((record) => (
                  <div 
                    key={record.id}
                    onClick={() => navigate(`/app/view/product/${record.id}`)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.is_lost 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {record.is_lost ? 'Lost' : 'Safe'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{record.device_name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Tag: {record.id}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products registered yet</h3>
                <p className="text-gray-500 mt-1">Add your first item to keep it secure.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {healthRecords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthRecords.map((record) => (
                  <div 
                    key={record.id}
                    onClick={() => navigate(`/app/view/health/${record.id}`)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <HeartPulse className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 uppercase">
                        {record.blood_group}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{record.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Profile ID: {record.id}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <HeartPulse className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No health profiles yet</h3>
                <p className="text-gray-500 mt-1">Create a health profile for emergency safety.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowSheet(true)}
          className="bg-[#534AB7] hover:bg-[#4339a0] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-2 font-bold transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add
        </button>
      </div>

      {/* Bottom Sheet Backdrop */}
      {showSheet && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setShowSheet(false)}
        >
          {/* Bottom Sheet Content */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">Register New</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  const id = Math.random().toString(36).substr(2, 9);
                  navigate(`/app/register/product?id=${id}`);
                }}
                className="flex items-center p-4 bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-colors text-left"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Register Product</div>
                  <div className="text-sm text-gray-500">Tag your valuable belongings</div>
                </div>
              </button>
              <button
                onClick={() => {
                  const id = Math.random().toString(36).substr(2, 9);
                  navigate(`/app/register/health`);
                }}
                className="flex items-center p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors text-left"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <HeartPulse className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Health Profile</div>
                  <div className="text-sm text-gray-500">Safety profile for loved ones</div>
                </div>
              </button>
            </div>
            <button 
              onClick={() => setShowSheet(false)}
              className="w-full mt-8 py-4 text-gray-500 font-medium hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
