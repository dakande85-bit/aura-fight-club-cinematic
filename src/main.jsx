import React from 'react';
import { createRoot } from 'react-dom/client';
import ScrollFilm from './ScrollFilm.jsx';
import './styles/global.css';
import './styles/scroll-film.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ScrollFilm />
  </React.StrictMode>
);
