import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import '../styles/admin-auth.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const from = location.state?.from || '/admin';

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    if (!isSupabaseConfigured) {
      setStatus('idle');
      setError('Supabase is not configured for this environment.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setStatus('idle');
      setError(signInError.message);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <main className="admin-auth">
      <form className="admin-auth__panel" onSubmit={handleSubmit}>
        <Link to="/" className="admin-auth__brand">AURA Fight Club</Link>
        <p className="admin-auth__eyebrow">Admin</p>
        <h1>Sign in</h1>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="admin-auth__error">{error}</p>}
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
