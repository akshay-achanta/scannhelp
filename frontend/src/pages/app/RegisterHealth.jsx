import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { 
  ArrowLeft, ArrowRight, HeartPulse, User, Phone, MapPin, 
  Activity, ShieldCheck, Stethoscope, Loader2, Check, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  id: z.string().min(1, 'Tag ID is required'),
  blood_group: z.string().min(1, 'Blood group is required'),
  existing_health_issues: z.string().max(500).optional(),
  primary_doctor_number: z.string().regex(/^\d*$/, 'Must contain only digits').max(20).optional(),
  allergies: z.string().max(500).optional(),
  existing_medicines: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  physically_disabled: z.boolean().default(false),
  name: z.string().min(1, 'Name is required').max(100),
  mobile: z.string().min(1, 'Phone number is required').regex(/^\d+$/, 'Must contain only digits').max(20),
  alt_number: z.string().regex(/^\d*$/, 'Must contain only digits').max(20).optional(),
  address: z.string().min(1, 'Address is required').max(255),
  display_information: z.boolean().default(false),
});

export default function RegisterHealth() {
  const token = useRequireAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!token || token === 'null') return null;

  const { register, handleSubmit, reset, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialId,
      physically_disabled: false,
      display_information: false,
    }
  });

  const currentId = watch('id');

  const nextStep = async () => {
    const fieldsForStep = {
      1: ['id', 'name', 'blood_group'],
      2: ['existing_health_issues', 'allergies', 'existing_medicines'],
      3: ['mobile', 'address'],
      4: ['display_information', 'notes'],
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
    { title: 'Basics', icon: User },
    { title: 'Medical', icon: Activity },
    { title: 'Emergency', icon: Phone },
    { title: 'Privacy', icon: ShieldCheck },
    { title: 'Review', icon: CheckCircle2 }
  ];

  const formData = watch();

  useEffect(() => {
    if (initialId) {
      async function fetchExisting() {
        try {
          const profile = await api.getHealthProfile(initialId);
          if (profile) {
            const formData = {
              ...profile,
              existing_medicines: profile.medications,
              existing_health_issues: profile.conditions,
              mobile: profile.emergency_phone,
            };
            reset(formData);
            setIsEdit(true);
          }
        } catch (err) {
          // If 404, it's a new profile registration, which is fine
          if (err.message !== 'Failed to fetch health profile') {
            console.error('Failed to fetch existing profile:', err);
          }
        }
      }
      fetchExisting();
    }
  }, [initialId, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { id: formId, ...rest } = data;
      const profileData = {
        name: rest.name,
        blood_group: rest.blood_group,
        allergies: rest.allergies,
        medications: rest.existing_medicines,
        conditions: rest.existing_health_issues,
        emergency_contact: rest.name,
        emergency_phone: rest.mobile,
        alt_number: rest.alt_number,
        address: rest.address,
        notes: rest.notes,
        physically_disabled: rest.physically_disabled,
        display_information: rest.display_information,
        primary_doctor_number: rest.primary_doctor_number,
      };

      if (isEdit) {
        await api.updateHealthProfile(formId, profileData);
        toast.success('Health profile updated!');
      } else {
        await api.createHealthProfile({
          id: formId,
          ...profileData
        });
        toast.success('Health profile saved!');
      }
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save health profile');
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
            <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Health Profile' : 'New Health Profile'}</h1>
          </div>
          <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">Step {currentStep}/5</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-10 relative px-2">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep >= idx + 1;
            const isCompleted = currentStep > idx + 1;
            
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <Icon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className={`hidden md:block text-[10px] font-bold uppercase mt-2 tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-200/20 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                  <h3 className="font-bold text-blue-900 mb-1 text-base">Personal Information</h3>
                  <p className="text-xs text-blue-700">Let's start with who this profile is for.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tag ID *</label>
                    <input 
                      type="text" 
                      {...register('id')} 
                      placeholder="e.g. 2000829"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.id ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                    {errors.id && <p className="mt-1 text-xs text-red-500">{errors.id.message}</p>}
                    <p className="mt-1 text-[10px] text-gray-400 font-mono">Current scanning URL: scannhelp.com/app/scan?t_id={currentId || '...'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                    <input {...register('name')} className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="e.g. Akshay Achanta" />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Blood Group *</label>
                    <select {...register('blood_group')} className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.blood_group ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}>
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    {errors.blood_group && <p className="mt-1 text-xs text-red-500">{errors.blood_group.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-6">
                  <h3 className="font-bold text-red-900 mb-1 text-base">Medical History</h3>
                  <p className="text-xs text-red-700">Important health information for emergency responders.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Existing Health Issues</label>
                    <textarea {...register('existing_health_issues')} rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none" placeholder="e.g. Diabetes, Asthma, Heart Condition..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Allergies</label>
                    <input {...register('allergies')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="e.g. Peanuts, Penicillin..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Current Medications</label>
                    <textarea {...register('existing_medicines')} rows="2" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none" placeholder="List any daily medicines..." />
                  </div>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Physically Disabled</p>
                      <p className="text-xs text-gray-500">Check if there are any physical limitations.</p>
                    </div>
                    <input type="checkbox" {...register('physically_disabled')} className="w-6 h-6 accent-blue-600" />
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-6">
                  <h3 className="font-bold text-green-900 mb-1 text-base">Emergency Contacts</h3>
                  <p className="text-xs text-green-700">Who should we call in an emergency?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Phone Number *</label>
                    <input 
                      {...register('mobile')} 
                      onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.mobile ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                      placeholder="0000000000" 
                    />
                    {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alternate Phone Number</label>
                    <input 
                      {...register('alt_number')} 
                      onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.alt_number ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                      placeholder="Optional"
                    />
                    {errors.alt_number && <p className="mt-1 text-xs text-red-500">{errors.alt_number.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Primary Doctor's Number</label>
                    <input 
                      {...register('primary_doctor_number')} 
                      onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${errors.primary_doctor_number ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                      placeholder="Optional"
                    />
                    {errors.primary_doctor_number && <p className="mt-1 text-xs text-red-500">{errors.primary_doctor_number.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
                    <textarea {...register('address')} rows="3" className={`w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Current residence address..." />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Privacy & Save */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-6">
                  <h3 className="font-bold text-purple-900 mb-1 text-base">Privacy & Final Notes</h3>
                  <p className="text-xs text-purple-700">Finalize your profile visibility and add any extra notes.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="pr-4">
                      <p className="text-sm font-bold text-gray-900">Display Information</p>
                      <p className="text-xs text-gray-500">Allow this information to be visible when scanned.</p>
                    </div>
                    <input type="checkbox" {...register('display_information')} className="w-6 h-6 accent-blue-600" />
                  </label>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Special Instructions / Notes</label>
                    <textarea {...register('notes')} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none" placeholder="e.g. Blood donor, carry an inhaler, etc..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Final Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gray-900 p-6 rounded-2xl mb-6 shadow-lg shadow-blue-900/20">
                  <h3 className="font-bold text-white mb-1 text-base">Final Review</h3>
                  <p className="text-xs text-gray-400">Please confirm all medical details before finishing.</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</span>
                    <span className="text-sm font-bold text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Group</span>
                    <span className="text-sm font-bold text-red-600">{formData.blood_group}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emergency Contact</span>
                    <span className="text-sm font-bold text-gray-900">{formData.mobile}</span>
                  </div>
                  {formData.allergies && (
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Allergies</span>
                      <span className="text-sm font-bold text-orange-600">{formData.allergies}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-dashed border-blue-200 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest text-center flex-1">Ready to complete health profile</p>
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
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  Next Step
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {loading ? 'Saving...' : (isEdit ? 'Confirm Update' : 'Finish & Save')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
