/**
 * AURA Fight Club — App Router
 * ─────────────────────────────
 * Routes:
 *   /            → ScrollFilm (cinematic homepage — unchanged)
 *   /drop-001    → Drop001 page
 *   /product/:slug → ProductDetail page (standalone)
 *
 * ScrollFilm.jsx is never modified.
 * All new routes are additive only.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollFilm        from './ScrollFilm.jsx';
import Drop001Page       from './pages/Drop001.jsx';
import ProductDetailPage from './pages/ProductDetailRoute.jsx';
import ApparelPage       from './pages/Apparel.jsx';
import FootwearPage      from './pages/Footwear.jsx';
import EquipmentPage     from './pages/Equipment.jsx';

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
        {/* Catch-all → homepage */}
        <Route path="*"              element={<ScrollFilm />} />
      </Routes>
    </BrowserRouter>
  );
}
