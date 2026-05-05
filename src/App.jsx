import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnsRefund from './pages/ReturnsRefund';
import NotFound from './pages/NotFound';

// App Pages
import Dashboard from './pages/app/Dashboard';
import RegisterProduct from './pages/app/RegisterProduct';
import RegisterHealth from './pages/app/RegisterHealth';
import ViewProduct from './pages/app/ViewProduct';
import ViewHealth from './pages/app/ViewHealth';
import ScanRedirect from './pages/app/ScanRedirect';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginSignup />} />
          <Route path="signup" element={<LoginSignup />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="returns-refund" element={<ReturnsRefund />} />
          
          {/* App Routes */}
          <Route path="app/dashboard" element={<Dashboard />} />
          <Route path="app/register/product" element={<RegisterProduct />} />
          <Route path="app/register/health" element={<RegisterHealth />} />
          <Route path="app/view/product/:id" element={<ViewProduct />} />
          <Route path="app/view/health/:id" element={<ViewHealth />} />
          <Route path="app/scan" element={<ScanRedirect />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
