import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Edit, Download, Package, User, Phone, MapPin, Award, Shield, AlertTriangle, Loader2, Eye, EyeOff, MessageSquare, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { useRequireAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function ViewProduct() {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLostWizard, setShowLostWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    display_information: false,
    reward_amount: '',
    notes: ''
  });
  const [savingLost, setSavingLost] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const result = await api.getProduct(id);
        setRecord(result);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id, navigate]);

  const handleMarkAsLostClick = () => {
    if (record.is_lost) {
      // Mark as safe instantly
      toggleLostStatus(false);
    } else {
      // Open wizard
      setWizardData({
        display_information: record.display_information || false,
        reward_amount: record.reward_amount || '',
        notes: record.notes || ''
      });
      setWizardStep(1);
      setShowLostWizard(true);
    }
  };

  const toggleLostStatus = async (isLost, additionalData = {}) => {
    try {
      if (isLost) setSavingLost(true);
      const updatedRecord = await api.updateProduct(id, { 
        is_lost: isLost,
        ...additionalData
      });
      setRecord(updatedRecord);
      toast.success(`Product marked as ${isLost ? 'LOST' : 'SAFE'}`);
      setShowLostWizard(false);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSavingLost(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading record...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Record not found</h2>
        <button onClick={() => navigate('/app/dashboard')} className="mt-4 text-primary font-bold">Go back to Dashboard</button>
      </div>
    );
  }

  const scanUrl = `${window.location.origin}/app/scan?t_t=1&t_id=${id}`;

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
              onClick={handleMarkAsLostClick}
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

      {/* Lost Wizard Modal */}
      {showLostWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Report as Lost
              </h3>
              <button 
                onClick={() => setShowLostWizard(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto">
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8 relative px-4">
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 -z-0"></div>
                <div 
                  className="absolute top-1/2 left-4 h-0.5 bg-red-500 -translate-y-1/2 transition-all duration-300 -z-0"
                  style={{ width: `${((wizardStep - 1) / 2) * 100}%`, maxWidth: 'calc(100% - 2rem)' }}
                ></div>
                
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    wizardStep >= step ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 text-gray-400 border-2 border-white'
                  }`}>
                    {step}
                  </div>
                ))}
              </div>

              {/* Step 1: Privacy */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy Settings</h4>
                    <p className="text-sm text-gray-500">What should the finder see when they scan your tag?</p>
                  </div>

                  <label className={`cursor-pointer block p-5 rounded-2xl border-2 transition-all ${
                    wizardData.display_information ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        wizardData.display_information ? 'bg-primary border-primary text-white' : 'border-gray-300'
                      }`}>
                        {wizardData.display_information && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          {wizardData.display_information ? <Eye className="h-4 w-4 text-gray-400" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                          {wizardData.display_information ? 'Showing Contact Info' : 'Hidden Contact Info'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {wizardData.display_information ? 'Finder can see your name and mobile number. Recommended for faster recovery.' : 'Finder will not see your personal details. Contact will be hidden.'}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={wizardData.display_information}
                      onChange={(e) => setWizardData({...wizardData, display_information: e.target.checked})}
                    />
                  </label>
                  
                  {!wizardData.display_information && (
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                      <p className="text-xs text-orange-800 leading-relaxed">
                        With contact info hidden, the finder can only contact you anonymously via the portal message.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Reward & Message */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Reward & Message</h4>
                    <p className="text-sm text-gray-500">Incentivize the finder to return your item.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" /> Reward Amount (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={wizardData.reward_amount}
                        onChange={(e) => {
                          if (e.target.value.length <= 10) {
                            setWizardData({...wizardData, reward_amount: e.target.value});
                          }
                        }}
                        placeholder="e.g. 500"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" /> Message for Finder (Optional)
                    </label>
                    <textarea 
                      value={wizardData.notes}
                      onChange={(e) => setWizardData({...wizardData, notes: e.target.value})}
                      placeholder="e.g. This bag contains important documents. Please call me."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Review & Confirm</h4>
                    <p className="text-sm text-gray-500">Here's what the finder will see.</p>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-inner">
                    <div className="text-center mb-6 pb-6 border-b border-red-200">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <h5 className="font-bold text-red-900 text-lg">Reported Lost</h5>
                      <p className="text-xs text-red-700 mt-1">This item has been marked as lost by its owner.</p>
                    </div>

                    <div className="space-y-4">
                      {wizardData.display_information && (
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Owner Contact</p>
                          <p className="text-sm font-bold text-gray-900">{record.name}</p>
                          <p className="text-sm text-gray-600">{record.mobile}</p>
                        </div>
                      )}

                      {wizardData.reward_amount && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                          <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Reward Offered</p>
                          <p className="text-lg font-bold text-gray-900">₹{wizardData.reward_amount}</p>
                        </div>
                      )}

                      {wizardData.notes && (
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Message</p>
                          <p className="text-sm text-gray-700 italic">"{wizardData.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Sticky */}
            <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-3">
              {wizardStep > 1 && (
                <button 
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                >
                  Back
                </button>
              )}
              
              {wizardStep < 3 ? (
                <button 
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={() => toggleLostStatus(true, wizardData)}
                  disabled={savingLost}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingLost ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                  {savingLost ? 'Activating...' : 'Confirm & Mark Lost'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
