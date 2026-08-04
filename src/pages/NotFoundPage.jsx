import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/legal.css';

export default function NotFoundPage() {
  return (
    <div className="legal-page">
      <Header />
      <main className="legal-page__main legal-page__main--center">
        <p className="legal-page__eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="legal-page__intro">That route does not exist.</p>
        <Link className="legal-page__button" to="/">Return home</Link>
      </main>
      <Footer />
    </div>
  );
}
