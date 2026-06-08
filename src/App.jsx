import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Header from './components/Header.jsx';
import CinematicHero from './components/CinematicHero.jsx';
import BrandStatementScene from './components/BrandStatementScene.jsx';
import DropReveal from './components/DropReveal.jsx';
import CategoryPanels from './components/CategoryPanels.jsx';
import CampaignScene from './components/CampaignScene.jsx';
import FightClubCTA from './components/FightClubCTA.jsx';
import Footer from './components/Footer.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const lenis = new Lenis({
      duration: mq.matches ? 0 : 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: !mq.matches,
    });

    const ticker = time => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(refreshTimer);
      lenis.destroy();
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <CinematicHero />
        <BrandStatementScene />
        <DropReveal />
        <CategoryPanels />
        <CampaignScene />
        <FightClubCTA />
      </main>
      <Footer />
    </>
  );
}
