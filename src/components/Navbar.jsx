import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, QrCode } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold leading-none tracking-tight text-gray-900">
                  Scan<span className="text-primary">N</span>Help
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  Secure Your Belongings
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#product" className="text-gray-600 hover:text-primary font-medium transition-colors">Product</a>
            <a href="/#safety" className="text-gray-600 hover:text-primary font-medium transition-colors">Safety</a>
            <a href="/#contactus" className="text-gray-600 hover:text-primary font-medium transition-colors">Contact Us</a>
            
            <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-8">
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary focus:outline-none p-2 rounded-lg hover:bg-gray-50"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <a 
              href="/#product" 
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Product
            </a>
            <a 
              href="/#safety" 
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Safety
            </a >
            <a 
              href="/#contactus" 
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </a>
            
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 px-3">
              <Link 
                to="/login" 
                className="flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
