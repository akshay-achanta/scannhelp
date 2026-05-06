import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('scannhelp_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    
    // Listen for storage changes (for same-page updates if needed)
    window.addEventListener('storage', checkUser);
    
    // Polling as a fallback for same-tab localStorage updates
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('scannhelp_user');
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img src="/logo.jpg" alt="ScanNHelp Logo" className="h-14 md:h-16 object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#home" className="text-gray-600 hover:text-primary font-medium transition-colors">Home</a>
            <a href="/#product" className="text-gray-600 hover:text-primary font-medium transition-colors">Product</a>
            <a href="/#safety" className="text-gray-600 hover:text-primary font-medium transition-colors">Safety</a>
            <a href="/#contactus" className="text-gray-600 hover:text-primary font-medium transition-colors">Contact Us</a>
            
            <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-8">
              {user ? (
                <div className="flex items-center gap-6">
                  <Link 
                    to="/app/dashboard" 
                    className="flex items-center gap-2 text-gray-700 hover:text-primary font-bold transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-primary/20 shadow-sm">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
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
              )}
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
              href="/#home" 
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
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
              {user ? (
                <div className="col-span-2 space-y-3 pt-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-4 border border-gray-100">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center border-2 border-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    to="/app/dashboard" 
                    className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-4 border border-gray-200 text-red-600 rounded-xl font-bold bg-white hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
