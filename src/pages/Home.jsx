import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Search, Send, Clock, RefreshCcw, QrCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section id="home" className="relative bg-orange-50/50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Protect Your Belongings with <br />
                <span className="text-primary">ScanNHelp!</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Tag, Track, and Recover with ScanNHelp: Your Lost Items, Privacy and Peace of Mind!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://scannhelp.myshopify.com/collections/all" target="_blank" rel="noreferrer noopener" className="bg-primary hover:bg-primary-dark text-white text-center px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Get Your QR Stickers
                </a>
                <a href="#aboutus" className="bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary text-center px-8 py-3.5 rounded-full font-semibold transition-colors">
                  Learn More
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

      {/* What is ScanNHelp */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What is <span className="text-primary">ScanNHelp?</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            ScanNHelp provides a simple and effective solution for keeping track of your belongings. Just purchase our QR codes and attach them to your valuable items. If you ever lose something, the person who finds it can easily scan the QR code and reach out to you. It's a convenient way to ensure your lost items are returned to you.
          </p>
          <div className="inline-block bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4">
            <h3 className="text-xl font-bold text-primary">PRODUCTS STARTING FROM INR 100</h3>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Working Of <span className="text-primary">ScanNHelp</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Your Items</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Purchase "scannhelp" stickers with unique QR codes from us.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Register these codes on the ScanNHelp website, creating a secure digital link.
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">When It Goes Missing</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  If a tagged item goes missing, mark the item as lost on the website.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  The person who finds it can easily notify you by scanning the QR code.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  Scanning instantly connects them to you securely.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="aboutus" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About <span className="text-primary">Us</span></h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At ScanNHelp, our mission is to make the world a more secure place, one lost item at a time. We believe that protecting your belongings and maintaining your privacy should go hand in hand, and our innovative technology ensures just that.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
              <ul className="space-y-4 text-gray-600 mb-8">
                <li className="flex gap-3 items-start">
                  <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>"scannhelp" stickers and QR codes for an efficient and reliable system.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Search className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>Your privacy is paramount; you have control over when your information is revealed.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <RefreshCcw className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>We're dedicated to simplifying the process of recovering lost items.</span>
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-3xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex bg-white p-6 rounded-2xl shadow-xl mb-6">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900">Scan<span className="text-primary">N</span>Help</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <ShieldCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy & Security</h3>
              <p className="text-gray-600 text-sm">
                Only when you mark an item as lost do your details get revealed. You control your information.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <Search className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recovery Simple</h3>
              <p className="text-gray-600 text-sm">
                Once notified, quickly arrange retrieval. Say goodbye to the stress of lost possessions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <Send className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Our delivery service ensures that your items are returned to you promptly and securely.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Refund Policy</h3>
              <p className="text-gray-600 text-sm">
                Hassle-free refund within 30 days if you aren't completely happy with your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contactus" className="py-24 bg-white relative overflow-hidden">
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
