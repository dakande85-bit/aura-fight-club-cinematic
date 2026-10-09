import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalSEO } from './components/SEO.jsx';
import Analytics from './components/Analytics.jsx';
import HomeStaticHero from './components/HomeStaticHero.jsx';
import FightHub from './pages/FightHub.jsx';
import FighterComparePage from './pages/FighterComparePage.jsx';
import FilmRoom from './pages/FilmRoom.jsx';
import VerdictPage from './pages/VerdictPage.jsx';
import ChampionsPage from './pages/ChampionsPage.jsx';
import LaunchLandingPage from './pages/LaunchLandingPage.jsx';
import CinematicPage from './pages/CinematicPage.jsx';
import CampaignPage from './pages/CampaignPage.jsx';
import FightClubPage from './pages/FightClub.jsx';
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

const legacyLifestylePaths = [
  '/shop',
  '/apparel',
  '/footwear',
  '/accessories',
  '/equipment',
  '/drops',
  '/drop-001',
  '/pre-orders',
  '/made-to-order',
  '/cart',
];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalSEO />
      <Analytics />
      <Routes>
        <Route path="/" element={<HomeStaticHero />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<ArticlePage />} />
        <Route path="/fighters" element={<FightersIndexPage />} />
        <Route path="/fighters/compare" element={<FighterComparePage />} />
        <Route path="/fighters/:slug" element={<FighterProfilePage />} />
        <Route path="/topics" element={<TopicsIndexPage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/authors/dare-akande" element={<AuthorPage />} />
        <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
        <Route path="/corrections" element={<CorrectionsPolicyPage />} />
        <Route path="/fight-hub" element={<FightHub />} />
        <Route path="/film-room" element={<FilmRoom />} />
        <Route path="/verdict" element={<VerdictPage />} />
        <Route path="/calendar" element={<FightHub />} />
        <Route path="/rankings" element={<ChampionsPage />} />
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

        {legacyLifestylePaths.map((path) => (
          <Route key={path} path={path} element={<Navigate to="/lifestyle" replace />} />
        ))}
        <Route path="/shop/*" element={<Navigate to="/lifestyle" replace />} />
        <Route path="/collections/*" element={<Navigate to="/lifestyle" replace />} />
        <Route path="/products/*" element={<Navigate to="/lifestyle" replace />} />
        <Route path="/product/:slug" element={<Navigate to="/lifestyle" replace />} />

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
