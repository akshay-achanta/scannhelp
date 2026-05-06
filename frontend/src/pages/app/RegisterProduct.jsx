import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { 
  ArrowLeft, ArrowRight, Package, User, Phone, MapPin, 
  Award, Loader2, Check, Smartphone, Eye, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  id: z.string().min(1, 'Tag ID is required'),
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
  const initialId = searchParams.get('id') || '';
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, reset, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialId,
      display_information: false,
      is_lost: false,
    }
  });

  const currentId = watch('id');

  const nextStep = async () => {
    const fieldsForStep = {
      1: ['id', 'device_name'],
      2: ['display_information', 'is_lost'],
      3: ['name', 'mobile', 'address'],
      4: ['reward_amount', 'notes'],
    };
    
    const isValid = await trigger(fieldsForStep[currentStep]);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const steps = [
    { title: 'Item', icon: Smartphone },
    { title: 'Privacy', icon: Eye },
    { title: 'Contact', icon: User },
    { title: 'Reward', icon: Award },
    { title: 'Review', icon: CheckCircle2 }
  ];

  const formData = watch();

  useEffect(() => {
    if (initialId) {
      async function fetchExisting() {
        try {
          const product = await api.getProduct(initialId);
          if (product) {
            reset(product);
            setIsEdit(true);
          }
        } catch (err) {
          console.error('Failed to fetch existing product:', err);
        }
      }
      fetchExisting();
    }
  }, [initialId, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { id: formId, ...rest } = data;
      if (isEdit) {
        await api.updateProduct(formId, rest);
        toast.success('Product updated successfully!');
      } else {
        await api.createProduct(data);
        toast.success('Product registered successfully!');
      }
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/app/dashboard')} className="p-2 hover:bg-gray-100 rounded-full mr-4 transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Register Product'}</h1>
          </div>
          <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">Step {currentStep}/5</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep >= idx + 1;
            const isCompleted = currentStep > idx + 1;
            
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-primary text-white' : isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <Icon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className={`hidden md:block text-[10px] font-bold uppercase mt-2 tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            
            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6">
                  <h3 className="font-bold text-orange-900 mb-1 text-base">Item Identity</h3>
                  <p className="text-xs text-orange-700">Tell us what this tag will be attached to.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tag ID *</label>
                    <input 
                      type="text" 
                      {...register('id')} 
                      placeholder="e.g. 2000829"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.id ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    />
                    {errors.id && <p className="mt-1 text-xs text-red-500">{errors.id.message}</p>}
                    <p className="mt-1 text-[10px] text-gray-400 font-mono">Current scanning URL: scannhelp.com/app/scan?t_id={currentId || '...'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Device / Item Name *</label>
                    <input 
                      type="text" 
                      {...register('device_name')} 
                      placeholder="e.g. Blue Backpack, Car Keys"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.device_name ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    />
                    {errors.device_name && <p className="mt-1 text-xs text-red-500">{errors.device_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Brief Description (Optional)</label>
                    <textarea {...register('description')} rows="3" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary resize-none" placeholder="Color, brand, or special marks..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Privacy Settings */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                  <h3 className="font-bold text-blue-900 mb-1 text-base">Privacy & Visibility</h3>
                  <p className="text-xs text-blue-700">Control what others see when they scan your tag.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="pr-4">
                      <p className="text-sm font-bold text-gray-900">Show Contact Info</p>
                      <p className="text-xs text-gray-500">Allow finders to see your name and number immediately.</p>
                    </div>
                    <input type="checkbox" {...register('display_information')} className="w-6 h-6 accent-primary" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl cursor-pointer hover:bg-red-50 transition-colors border border-red-100">
                    <div className="pr-4">
                      <p className="text-sm font-bold text-red-900">Mark as Lost</p>
                      <p className="text-xs text-red-600">Enable this to show a 'Lost Item' message on the scan page.</p>
                    </div>
                    <input type="checkbox" {...register('is_lost')} className="w-6 h-6 accent-red-500" />
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-6">
                  <h3 className="font-bold text-green-900 mb-1 text-base">Your Details</h3>
                  <p className="text-xs text-green-700">Provide the details so the finder can return your item.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                    <input {...register('name')} className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} placeholder="John Doe" />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Mobile *</label>
                      <input {...register('mobile')} className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.mobile ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} placeholder="+91 00000 00000" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Alt. Number</label>
                      <input {...register('alt_number')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Home Address *</label>
                    <textarea {...register('address')} rows="3" className={`w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} placeholder="Full address for shipping back your item..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Reward & Notes */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-6">
                  <h3 className="font-bold text-purple-900 mb-1 text-base">Rewards & Instructions</h3>
                  <p className="text-xs text-purple-700">Add a reward or a custom message for the person who finds your item.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reward (₹)</label>
                    <input type="number" {...register('reward_amount')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary" placeholder="Optional: e.g. 500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Custom Message for Finder</label>
                    <textarea {...register('notes')} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary resize-none" placeholder="e.g. Please call me anytime after 6 PM. Thank you so much!" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Final Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gray-900 p-6 rounded-2xl mb-6 shadow-lg shadow-gray-200">
                  <h3 className="font-bold text-white mb-1 text-base">Final Review</h3>
                  <p className="text-xs text-gray-400">Please confirm all details before finishing.</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tag ID</span>
                    <span className="text-sm font-bold text-gray-900">{formData.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Device</span>
                    <span className="text-sm font-bold text-gray-900">{formData.device_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Owner</span>
                    <span className="text-sm font-bold text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</span>
                    <span className="text-sm font-bold text-gray-900">{formData.mobile}</span>
                  </div>
                  {formData.reward_amount && (
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reward</span>
                      <span className="text-sm font-bold text-green-600">₹{formData.reward_amount}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-orange-50 rounded-2xl border border-dashed border-orange-200 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <p className="text-[10px] text-orange-700 font-bold uppercase tracking-widest text-center flex-1">Ready to complete registration</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-10">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Next Step
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {loading ? 'Processing...' : (isEdit ? 'Confirm Update' : 'Finish & Register')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
