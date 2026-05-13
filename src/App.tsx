import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "./components/ui/Toast";

// Lazy loading pages
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Payment = lazy(() => import("./pages/Payment"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const CGV = lazy(() => import("./pages/CGV"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const SafetyAndPayment = lazy(() => import("./pages/SafetyAndPayment"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const DeliveryReturns = lazy(() => import("./pages/DeliveryReturns"));

// Protected Route components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user || !user.isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#FF6B35] font-bold">Chargement de l'univers Appiotti...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/boutique" element={<Shop />} />
                    <Route path="/boutique/:id" element={<ProductDetail />} />
                    <Route path="/panier" element={<Cart />} />
                    <Route path="/paiement" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                    <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                    <Route path="/securite-virement" element={<SafetyAndPayment />} />
                    <Route path="/inscription" element={<Auth mode="signup" />} />
                    <Route path="/connexion" element={<Auth mode="login" />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/a-propos" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/mentions-legales" element={<Legal />} />
                    <Route path="/cgv" element={<CGV />} />
                    <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
                    <Route path="/politique-de-cookies" element={<CookiesPolicy />} />
                    <Route path="/livraisons-et-retours" element={<DeliveryReturns />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
