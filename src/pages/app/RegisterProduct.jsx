import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { ArrowLeft, Package, User, Phone, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  device_name: z.string().min(1, 'Device name is required'),
  display_information: z.boolean().default(false),
  is_lost: z.boolean().default(false),
  description: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  alt_number: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  reward_amount: z.string().optional(),
  notes: z.string().optional(),
});

export default function RegisterProduct() {
  useRequireAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      display_information: false,
      is_lost: false,
    }
  });

  useEffect(() => {
    if (id) {
      const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
      const existing = records.find(r => r.id === id && r.type === 'product');
      if (existing) {
        reset(existing);
      }
    }
  }, [id, reset]);

  const onSubmit = (data) => {
    const existing = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const newRecord = {
      id,
      type: 'product',
      ...data,
      created_at: new Date().toISOString()
    };
    
    // Update or add
    const index = existing.findIndex(r => r.id === id);
    if (index > -1) {
      existing[index] = newRecord;
    } else {
      existing.push(newRecord);
    }
    
    localStorage.setItem('scannhelp_records', JSON.stringify(existing));
    toast.success('Product registered successfully!');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/app/dashboard')} className="p-2 hover:bg-gray-100 rounded-full mr-4 transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Register Product</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Hint Bar */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-8 flex items-center">
          <div className="bg-white p-2 rounded-lg mr-4">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Scanning URL</p>
            <p className="text-sm text-orange-800 font-mono truncate">scannhelp.com/app/scan?t_t=1&t_id={id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Product Info Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Package className="h-5 w-5 text-primary mr-2" /> Product Info
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Tag</label>
                <input
                  type="text"
                  readOnly
                  value={id}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device / Item <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('device_name')}
                  placeholder="e.g. MacBook Pro, Blue Backpack"
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                    errors.device_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                {errors.device_name && <p className="mt-1 text-xs text-red-500">{errors.device_name.message}</p>}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-gray-900">Display Information</p>
                  <p className="text-xs text-gray-500">Allow others to see your contact details when scanned</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('display_information')}
                  className="w-5 h-5 accent-primary" 
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-gray-900">Mark as Lost</p>
                  <p className="text-xs text-gray-500">Enable this if the item is currently missing</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('is_lost')}
                  className="w-5 h-5 accent-red-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Any identifying features or extra info..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 text-primary mr-2" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('mobile')}
                    placeholder="+91 00000 00000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt. Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('alt_number')}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('address')}
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    placeholder="Complete address for recovery"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-5 w-5 text-primary mr-2" /> Rewards
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward Amount (₹)</label>
                <input
                  type="number"
                  {...register('reward_amount')}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  placeholder="Message for the person who finds your item"
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Register Product
          </button>
        </form>
      </div>
    </div>
  );
}
