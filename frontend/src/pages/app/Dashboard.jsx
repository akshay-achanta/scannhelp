import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { 
  Plus, 
  Package, 
  HeartPulse, 
  ChevronRight, 
  MapPin, 
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Crown
} from 'lucide-react';

export default function Dashboard() {
  const token = useRequireAuth();
  const location = useLocation();
  const activeTab = location.pathname.endsWith('/health') ? 'health' : location.pathname.endsWith('/shop') ? 'shop' : 'products';
  const [productRecords, setProductRecords] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || token === 'null') {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [products, health] = await Promise.all([
          api.getProducts(),
          api.getHealthProfiles()
        ]);
        setProductRecords(products);
        setHealthRecords(health);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Load orders on mount and when tab changes to shop
    if (activeTab === 'shop') {
      const savedOrders = JSON.parse(localStorage.getItem('scannhelp_orders') || '[]');
      setOrders(savedOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  }, [activeTab]);

  if (!token || token === 'null') return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
              <button
                onClick={() => navigate('/app/subscriptions')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:opacity-90 transition-all"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Subscriptions</span>
              </button>
            </div>
            <div className="flex mt-6 border-b border-gray-100 gap-1">
              <button
                onClick={() => navigate('/app/dashboard/products')}
                className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'products' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 Products
                {activeTab === 'products' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                onClick={() => navigate('/app/dashboard/health')}
                className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'health' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏥 Health
                {activeTab === 'health' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                onClick={() => navigate('/app/dashboard/shop')}
                className={`px-5 py-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                  activeTab === 'shop' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Shop
                {activeTab === 'shop' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your records...</p>
          </div>
        ) : activeTab === 'products' ? (
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
        ) : activeTab === 'shop' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Your Orders</h2>
              <button
                onClick={() => navigate('/app/shop')}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl"
              >
                + Buy Tags
              </button>
            </div>
            
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-3 rounded-xl shrink-0">
                        <ShoppingBag className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{order.tagName}</h3>
                        <p className="text-xs text-gray-500">Order #{order.id.toUpperCase()} · ₹{order.price}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-[10px] uppercase tracking-wider font-bold rounded-full border border-yellow-200">
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mt-1 mb-6">Buy physical QR tags to protect your belongings.</p>
                <button
                  onClick={() => navigate('/app/shop')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Go to Shop
                </button>
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
                  setShowSheet(false);
                  navigate('/app/register/health');
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
              <button
                onClick={() => { setShowSheet(false); navigate('/app/shop'); }}
                className="flex items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors text-left"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <ShoppingBag className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Buy QR Tags</div>
                  <div className="text-sm text-gray-500">Get physical QR tags delivered</div>
                </div>
              </button>
              <button
                onClick={() => { setShowSheet(false); navigate('/app/subscriptions'); }}
                className="flex items-center p-4 bg-purple-50 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-colors text-left"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Subscriptions</div>
                  <div className="text-sm text-gray-500">Upgrade your plan</div>
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
