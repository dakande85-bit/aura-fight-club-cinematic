import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalSEO } from './components/SEO.jsx';
import HomeStaticHero from './components/HomeStaticHero.jsx';
import LaunchLandingPage from './pages/LaunchLandingPage.jsx';
import CinematicPage from './pages/CinematicPage.jsx';
import CampaignPage from './pages/CampaignPage.jsx';
import DropsPage from './pages/Drops.jsx';
import Drop001Page from './pages/Drop001.jsx';
import PreOrdersPage from './pages/PreOrders.jsx';
import ProductDetailPage from './pages/ProductDetailRoute.jsx';
import ApparelPage from './pages/Apparel.jsx';
import FootwearPage from './pages/Footwear.jsx';
import EquipmentPage from './pages/Equipment.jsx';
import FightClubPage from './pages/FightClub.jsx';
import CartPage from './pages/Cart.jsx';
import AdminAssetManager from './pages/AdminAssetManager.jsx';
import AdminPageMedia from './pages/AdminPageMedia.jsx';
import AdminLaunchChecklist from './pages/AdminLaunchChecklist.jsx';
import AdminWaitlist from './pages/AdminWaitlist.jsx';
import AdminCinematic from './pages/AdminCinematic.jsx';
import AdminArticles from './pages/AdminArticles.jsx';
import AdminSuppliers from './pages/AdminSuppliers.jsx';
import AdminMonetization from './pages/AdminMonetization.jsx';
import Advertise from './pages/Advertise.jsx';
import CommercialPolicy from './pages/CommercialPolicy.jsx';
import MembersPage from './pages/Members.jsx';
import { PrivacyPolicy, CookiePolicy, Terms } from './pages/LegalPages.jsx';
import { NewsPage, WatchPage, LifestylePage, ArticlePage, CalendarPage, RankingsPage, FightPage } from './pages/EditorialPages.jsx';
import { FightersIndexPage, FighterProfilePage, TopicsIndexPage, TopicPage, GuidesIndexPage, GuidePage, AuthorPage, EditorialPolicyPage, CorrectionsPolicyPage } from './pages/DiscoveryPages.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalSEO />
      <Routes>
        <Route path="/" element={<HomeStaticHero />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<ArticlePage />} />
        <Route path="/fighters" element={<FightersIndexPage />} />
        <Route path="/fighters/:slug" element={<FighterProfilePage />} />
        <Route path="/topics" element={<TopicsIndexPage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/authors/dare-akande" element={<AuthorPage />} />
        <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
        <Route path="/corrections" element={<CorrectionsPolicyPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/fights/:id" element={<FightPage />} />
        <Route path="/watch" element={<WatchPage />} />
        <Route path="/lifestyle" element={<LifestylePage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/commercial-policy" element={<CommercialPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/launch" element={<LaunchLandingPage />} />
        <Route path="/who-we-are" element={<CinematicPage />} />
        <Route path="/cinematic" element={<Navigate to="/who-we-are" replace />} />
        <Route path="/drops" element={<DropsPage />} />
        <Route path="/drop-001" element={<Drop001Page />} />
        <Route path="/pre-orders" element={<PreOrdersPage />} />
        <Route path="/made-to-order" element={<Navigate to="/pre-orders" replace />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/apparel" element={<ApparelPage />} />
        <Route path="/footwear" element={<FootwearPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/our-story" element={<Navigate to="/who-we-are" replace />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/the-campaign" element={<CampaignPage />} />
        <Route path="/fight-club" element={<FightClubPage />} />
        <Route path="/fightclub" element={<FightClubPage />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/monetisation" element={<AdminMonetization />} />
        <Route path="/admin/monetization" element={<AdminMonetization />} />
        <Route path="/admin" element={<AdminAssetManager />} />
        <Route path="/admin/page-media" element={<AdminPageMedia />} />
        <Route path="/admin/cinematic" element={<AdminCinematic />} />
        <Route path="/admin/suppliers" element={<AdminSuppliers />} />
        <Route path="/admin/launch" element={<AdminLaunchChecklist />} />
        <Route path="/admin/waitlist" element={<AdminWaitlist />} />
        <Route path="*" element={<CinematicPage />} />
      </Routes>
    </BrowserRouter>
  );
}
