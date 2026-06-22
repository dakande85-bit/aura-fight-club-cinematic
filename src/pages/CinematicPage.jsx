import HomeStaticHero from '../components/HomeStaticHero.jsx';
import HomepageExtras from '../components/HomepageExtras.jsx';
import Footer from '../components/Footer.jsx';
import { WhoWeAreSections } from './OurStory.jsx';
import '../styles/our-story.css';

export default function CinematicPage() {
  return (
    <>
      <HomeStaticHero />
      <HomepageExtras />
      <div className="os-page os-page--embedded">
        <WhoWeAreSections />
      </div>
      <Footer />
    </>
  );
}
