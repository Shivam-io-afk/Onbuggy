import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PortalSwitcherBar } from './components/PortalSwitcherBar';
import { TopLoadingBar } from './components/TopLoadingBar';
import { ServerTrafficNotice } from './components/ServerTrafficNotice';

import { HomePage } from './pages/HomePage';
import { SigninPage } from './pages/SigninPage';
import { SignupPage } from './pages/SignupPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ContactUsPage } from './pages/ContactUsPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { FAQPage } from './pages/FAQPage';
import { SoonPage } from './pages/SoonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { DeliveryPanelPage } from './pages/DeliveryPanelPage';
import { MerchantPanelPage } from './pages/MerchantPanelPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <TopLoadingBar />
            <ServerTrafficNotice />
            <PortalSwitcherBar />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/order-gothru" element={<CheckoutPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/user-profile" element={<UserProfilePage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/admin" element={<AdminPanelPage />} />
                  <Route path="/delivery-panel" element={<DeliveryPanelPage />} />
                  <Route path="/delivery" element={<DeliveryPanelPage />} />
                  <Route path="/merchant" element={<MerchantPanelPage />} />
                  <Route path="/vendor" element={<MerchantPanelPage />} />
                  <Route path="/soon" element={<SoonPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default App;

