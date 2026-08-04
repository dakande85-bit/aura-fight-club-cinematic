import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './lib/commerce/CartContext.jsx';
import HomePage from './pages/HomePage.jsx';
import CampaignPage from './pages/CampaignPage.jsx';
import Drop001Page from './pages/Drop001.jsx';
import ProductDetailPage from './pages/ProductDetailRoute.jsx';
import CartPage from './pages/CartPage.jsx';
import ApparelPage from './pages/Apparel.jsx';
import FootwearPage from './pages/Footwear.jsx';
import EquipmentPage from './pages/Equipment.jsx';
import FightClubPage from './pages/FightClub.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminAssetManager from './pages/AdminAssetManager.jsx';
import CinematicSceneBuilder from './pages/admin/CinematicSceneBuilder.jsx';
import AdminSuppliers from './pages/AdminSuppliers.jsx';
import LegalPage from './pages/LegalPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function AppRouter() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drop-001" element={<Drop001Page />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/apparel" element={<ApparelPage />} />
        <Route path="/footwear" element={<FootwearPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/the-campaign" element={<CampaignPage />} />
        <Route path="/fight-club" element={<FightClubPage />} />
        <Route path="/fightclub" element={<FightClubPage />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/shipping" element={<LegalPage type="shipping" />} />
        <Route path="/returns" element={<LegalPage type="returns" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminAssetManager /></AdminRoute>} />
        <Route path="/admin/cinematic" element={<AdminRoute><CinematicSceneBuilder /></AdminRoute>} />
        <Route path="/admin/suppliers" element={<AdminRoute><AdminSuppliers /></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
