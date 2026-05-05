import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { ArrowLeft, HeartPulse, User, Phone, MapPin, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  blood_group: z.string().min(1, 'Blood group is required'),
  existing_health_issues: z.string().optional(),
  primary_doctor_number: z.string().optional(),
  allergies: z.string().optional(),
  existing_medicines: z.string().optional(),
  notes: z.string().optional(),
  physically_disabled: z.boolean().default(false),
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Phone number is required'),
  alt_number: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  display_information: z.boolean().default(false),
});

export default function RegisterHealth() {
  useRequireAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      physically_disabled: false,
      display_information: false,
    }
  });

  useEffect(() => {
    if (id) {
      const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
      const existing = records.find(r => r.id === id && r.type === 'health');
      if (existing) {
        reset(existing);
      }
    }
  }, [id, reset]);

  const onSubmit = (data) => {
    const existing = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const newRecord = {
      id,
      type: 'health',
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
    toast.success('Health profile saved!');
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
          <h1 className="text-xl font-bold text-gray-900">Health Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Hint Bar */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-center">
          <div className="bg-white p-2 rounded-lg mr-4">
            <HeartPulse className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Scanning URL</p>
            <p className="text-sm text-blue-800 font-mono truncate">scannhelp.com/app/scan?t_t=2&t_id={id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Medical Details Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Stethoscope className="h-5 w-5 text-blue-600 mr-2" /> Medical Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group <span className="text-red-500">*</span></label>
                <select
                  {...register('blood_group')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {errors.blood_group && <p className="mt-1 text-xs text-red-500">{errors.blood_group.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Doctor #</label>
                <input
                  type="tel"
                  {...register('primary_doctor_number')}
                  placeholder="+91 00000 00000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Health Issues</label>
                <textarea
                  {...register('existing_health_issues')}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none"
                  placeholder="e.g. Diabetes, Hypertension..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (If Any)</label>
                <input
                  type="text"
                  {...register('allergies')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Medicines</label>
                <textarea
                  {...register('existing_medicines')}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-gray-900">Physically Disabled</p>
                  <p className="text-xs text-gray-500">Check this if the profile belongs to someone with physical disabilities</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('physically_disabled')}
                  className="w-5 h-5 accent-blue-600" 
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  {...register('mobile')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt. Number</label>
                <input
                  type="tel"
                  {...register('alt_number')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <textarea
                  {...register('address')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" /> Security
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex-1 pr-4">
                <p className="text-sm font-bold text-gray-900">Display Information</p>
                <p className="text-xs text-gray-500">
                  If disabled, sensitive medical details will be hidden from public scans until you grant access.
                </p>
              </div>
              <input 
                type="checkbox" 
                {...register('display_information')}
                className="w-5 h-5 accent-blue-600" 
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Save Health Profile
          </button>
        </form>
      </div>
    </div>
  );
}
