import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { WhoWeAreSections } from './OurStory.jsx';
import '../styles/our-story.css';

export default function CinematicPage() {
  return (
    <>
      <Header />
      <div className="os-page os-page--embedded">
        <WhoWeAreSections />
      </div>
      <Footer />
    </>
  );
}
