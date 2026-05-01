import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetailPage from "./pages/MaterialDetailPage";
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import UserProfilePage from "./pages/UserProfilePage";
import DashboardPage from "./pages/DashboardPage";
import CollectionsPage from "./pages/CollectionsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="materials/:id" element={<MaterialDetailPage />} />
        <Route path="auth" element={<AuthPage />} />
        
        {/* Widoki chronione przed niezalogowanymi gośćmi */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/upload" element={<UploadPage />} />
          <Route path="collections" element={<CollectionsPage />} />
        </Route>

        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;
