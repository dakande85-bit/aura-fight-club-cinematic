import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter.jsx';
import './styles/global.css';
import './styles/scroll-film.css';
import './styles/aura-public-visual-pass.css';
import './styles/aura-launch-polish.css';
import './styles/aura-qa-overrides.css';
import './styles/aura-media-control.css';
import './styles/aura-mobile-release-fix.css';
import './styles/aura-homepage-mobile-static.css';
import './homepage-scroll-sync.js';
import './homepage-logo-fix.js';
import './aura-release-dom-fixes.js';
import './aura-home-mobile-hard-stop.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
