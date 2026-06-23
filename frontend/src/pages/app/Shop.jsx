import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { ArrowLeft, Clock } from 'lucide-react';

export default function Shop() {
  useRequireAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <p className="text-xs text-gray-500">Physical tags for your belongings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-500">
            Our physical QR tag store is launching very soon. Stay tuned!
          </p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="mt-8 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
