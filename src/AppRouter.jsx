import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeStaticHero from './components/HomeStaticHero.jsx';
import LaunchLandingPage from './pages/LaunchLandingPage.jsx';
import CinematicPage from './pages/CinematicPage.jsx';
import CampaignPage from './pages/CampaignPage.jsx';
import DropsPage from './pages/Drops.jsx';
import Drop001Page from './pages/Drop001.jsx';
import ProductDetailPage from './pages/ProductDetailRoute.jsx';
import ApparelPage from './pages/Apparel.jsx';
import FootwearPage from './pages/Footwear.jsx';
import EquipmentPage from './pages/Equipment.jsx';
import FightClubPage from './pages/FightClub.jsx';
import OurStoryPage from './pages/OurStory.jsx';
import AdminAssetManager from './pages/AdminAssetManager.jsx';
import AdminPageMedia from './pages/AdminPageMedia.jsx';
import AdminLaunchChecklist from './pages/AdminLaunchChecklist.jsx';
import AdminWaitlist from './pages/AdminWaitlist.jsx';
import AdminCinematic from './pages/AdminCinematic.jsx';
import AdminSuppliers from './pages/AdminSuppliers.jsx';
import EngagementModal from './components/EngagementModal.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeStaticHero />} />
        <Route path="/launch" element={<LaunchLandingPage />} />
        <Route path="/cinematic" element={<CinematicPage />} />
        <Route path="/drops" element={<DropsPage />} />
        <Route path="/drop-001" element={<Drop001Page />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/apparel" element={<ApparelPage />} />
        <Route path="/footwear" element={<FootwearPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/the-campaign" element={<CampaignPage />} />
        <Route path="/fight-club" element={<FightClubPage />} />
        <Route path="/fightclub" element={<FightClubPage />} />
        <Route path="/admin" element={<AdminAssetManager />} />
        <Route path="/admin/page-media" element={<AdminPageMedia />} />
        <Route path="/admin/cinematic" element={<AdminCinematic />} />
        <Route path="/admin/suppliers" element={<AdminSuppliers />} />
        <Route path="/admin/launch" element={<AdminLaunchChecklist />} />
        <Route path="/admin/waitlist" element={<AdminWaitlist />} />
        <Route path="*" element={<CinematicPage />} />
      </Routes>
      <EngagementModal />
    </BrowserRouter>
  );
}
