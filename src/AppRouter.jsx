import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollFilm         from './ScrollFilm.jsx';
import CampaignScrollFilm from './CampaignScrollFilm.jsx';
import Drop001Page        from './pages/Drop001.jsx';
import ProductDetailPage  from './pages/ProductDetailRoute.jsx';
import ApparelPage        from './pages/Apparel.jsx';
import FootwearPage       from './pages/Footwear.jsx';
import EquipmentPage      from './pages/Equipment.jsx';
import FightClubPage      from './pages/FightClub.jsx';
import AdminAssetManager  from './pages/AdminAssetManager.jsx';
import CinematicSceneBuilder from './pages/admin/CinematicSceneBuilder.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<ScrollFilm />} />
        <Route path="/drop-001"      element={<Drop001Page />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/apparel"       element={<ApparelPage />} />
        <Route path="/footwear"      element={<FootwearPage />} />
        <Route path="/equipment"     element={<EquipmentPage />} />
        <Route path="/campaign"      element={<CampaignScrollFilm />} />
        <Route path="/the-campaign"  element={<CampaignScrollFilm />} />
        <Route path="/fight-club"    element={<FightClubPage />} />
        <Route path="/fightclub"     element={<FightClubPage />} />
        <Route path="/admin"         element={<AdminAssetManager />} />
        <Route path="/admin/cinematic" element={<CinematicSceneBuilder />} />
        {/* Catch-all → homepage */}
        <Route path="*"              element={<ScrollFilm />} />
      </Routes>
    </BrowserRouter>
  );
}
