import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  HeartPulse, 
  Smartphone, 
  BellRing, 
  Package, 
  ClipboardList, 
  BadgeInfo, 
  LifeBuoy,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section id="home" className="relative bg-orange-50/50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Protect, Safeguard and Recover <br />
                <span className="text-gray-700 text-3xl sm:text-4xl">Your Belongings / Your Loved Ones</span> <br />
                <span className="text-primary">With ScanNHelp</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Versatile QR sticker solutions …
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#product" className="bg-primary hover:bg-primary-dark text-white text-center px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  What is ScanNHelp? &rarr;
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3 scale-105"></div>
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixid=M3w5MTMyMXwwfDF8c2VhcmNofDJ8fEVsZWN0cm9uaWMlMjBkZXZpY2VzfGVufDB8fHx8MTY5NDUyNzQwMHww&ixlib=rb-4.0.3&w=1200"
                alt="Electronic devices protected by ScanNHelp"
                className="relative rounded-3xl shadow-2xl object-cover h-[400px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Product
            </h2>
            <p className="mt-4 text-lg text-gray-600">Simple recovery of your valuable belongings.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ClipboardList className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Setup (for owner)</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Buy our QR stickers
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Stick/attach to your belongings
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Scan and register the item, providing necessary details
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">If lost? (for finder)</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Finder scans QR code and gets the owner's contact information
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Finder returns the item back to owner
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section id="safety" className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Emergency
            </h2>
            <p className="mt-4 text-lg text-gray-600">Safeguarding your loved ones when it matters most.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Setup */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
              <div className="bg-red-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <HeartPulse className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Setup</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Buy our QR solutions
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Stick/attach to belongings of your loved ones
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Register, provide primary contact information and medical information
                </li>
              </ul>
            </div>

            {/* Emergency Process */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <LifeBuoy className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Emergency?</h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="font-bold text-slate-900 mb-1">P.O.V. of Respondent (of emergency)</div>
                    <div className="text-slate-600 text-sm">The respondent/rescuer scans QR code and gets primary contact details.</div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="font-bold text-slate-900 mb-1">P.O.V. of Primary Contact</div>
                    <ul className="text-slate-600 text-sm space-y-1">
                      <li>• The primary contact is notified of the emergency.</li>
                      <li>• The primary contact allows the display of medical information of the person facing emergency.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <BadgeInfo className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="font-bold text-slate-900 mb-1">P.O.V. of Respondent</div>
                    <ul className="text-slate-600 text-sm space-y-1">
                      <li>• The respondent/rescuer is prompted to scan again.</li>
                      <li>• Medical information of the person facing emergency is displayed.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* About Us & Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About <span className="text-primary">Us</span></h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At ScanNHelp, we understand the stress of losing something precious or worrying about a loved one in an emergency. That's why we've developed innovative QR solutions to bring you peace of mind and practical support when it matters most.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our solutions are designed to:</h3>
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex gap-3 items-start">
                  <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Protect:</strong> Enable quick and hassle-free recovery of lost belongings.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <HeartPulse className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Save Lives:</strong> Provide emergency medical and contact information to safeguard your loved ones.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Be Accessible & Affordable:</strong> Simple, cost-effective, and within reach for everyone.</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-primary pl-4 bg-orange-50/30 py-2">
                We believe that people are inherently kind and helpful when given the right resources. By leveraging innovative technology, we strive to foster a supportive community, inspire good-will and make safety a priority for everyone.
              </p>
            </div>
            <div className="bg-orange-50 rounded-3xl p-12 flex items-center justify-center mt-12 lg:mt-0">
              <div className="text-center">
                <img src="/logo.jpg" alt="ScanNHelp Logo" className="w-64 md:w-80 max-w-full mx-auto mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contactus" className="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-50 blur-3xl opacity-50"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact <span className="text-primary">Us</span></h2>
            <p className="text-lg text-gray-600">
              For any queries, please reach out to us and we'll get back to you shortly.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg mt-4"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
