import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4 group">
              <img src="/logo.jpg" alt="ScanNHelp Logo" className="h-12 md:h-14 object-contain" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Tag, Track, and Recover with ScanNHelp. Your reliable partner for finding lost items while protecting your privacy.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-primary transition-colors text-sm">Home</Link></li>
              <li><a href="https://scannhelp.myshopify.com/collections/all" target="_blank" rel="noreferrer noopener" className="text-gray-500 hover:text-primary transition-colors text-sm">Buy Now</a></li>
              <li><a href="/#aboutus" className="text-gray-500 hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="/#contactus" className="text-gray-500 hover:text-primary transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Policies</h3>
            <ul className="space-y-3">
              <li><Link to="/terms-conditions" className="text-gray-500 hover:text-primary transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link to="/returns-refund" className="text-gray-500 hover:text-primary transition-colors text-sm">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>support@scannhelp.com</li>
              <li>1-800-SCAN-HELP</li>
              <li className="pt-2">
                <Link to="/signup" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors">
                  Create an account <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} All rights reserved by ScanNHelp.com
          </p>
        </div>
      </div>
    </footer>
  );
}
