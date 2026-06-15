import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter.jsx';
import './styles/global.css';
import './styles/scroll-film.css';
import './styles/aura-public-visual-pass.css';
import './styles/aura-launch-polish.css';
import './styles/aura-qa-overrides.css';
import './styles/aura-media-control.css';
import './homepage-scroll-sync.js';

function forceAuraLogo() {
  return;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

forceAuraLogo();
