export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 py-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Privacy Policy</h1>
          
          <div className="prose prose-orange max-w-none text-gray-600">
            <p className="mb-6">At ScanNHelp, we take your privacy very seriously. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">We collect information you provide when you create an account, purchase products, or register your QR codes. This includes your name, email address, phone number, and shipping address.</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">Your information is used to provide our services, process transactions, and communicate with you. The contact details you link to a QR code are kept completely private until you explicitly mark an item as "Lost" in our system.</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information Disclosure</h2>
            <p className="mb-4">When a finder scans a QR code for an item marked as lost, only the specific contact methods you have chosen to display will be revealed to them. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="mb-4">We implement a variety of security measures to maintain the safety of your personal information. All supplied sensitive information is transmitted via Secure Socket Layer (SSL) technology and encrypted in our database.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
