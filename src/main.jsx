import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter.jsx';
import './data/shopifyCatalogRuntimeSync.js';
import './styles/global.css';
import './styles/scroll-film.css';
import './styles/home-static.css';
import './styles/aura-public-visual-pass.css';
import './styles/aura-launch-polish.css';
import './styles/aura-qa-overrides.css';
import './styles/aura-media-control.css';
import './styles/aura-mobile-release-fix.css';
import './styles/aura-homepage-mobile-static.css';
import './styles/admin-cinematic.css';
import './styles/page-hero.css';
import './styles/brand-header-lock.css';
import './styles/product-media-lock.css';
import './styles/aura-public-stabilisation.css';
import './styles/aura-public-organisation.css';
import './styles/aura-cart-header-fix.css';
import './styles/aura-home-category-fix.css';
import './homepage-scroll-sync.js';
import './homepage-logo-fix.js';
import './aura-release-dom-fixes.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
