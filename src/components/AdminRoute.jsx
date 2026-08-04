import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import '../styles/admin-auth.css';

const ADMIN_ROLES = new Set(['owner', 'editor', 'viewer']);

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ status: 'checking', session: null, role: null, error: '' });

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (!isSupabaseConfigured) {
        setState({ status: 'unconfigured', session: null, role: null, error: '' });
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionError) {
        setState({ status: 'error', session: null, role: null, error: sessionError.message });
        return;
      }

      const session = sessionData?.session;
      if (!session?.user?.email) {
        setState({ status: 'signed-out', session: null, role: null, error: '' });
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from('aura_admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (adminError) {
        setState({ status: 'error', session, role: null, error: adminError.message });
        return;
      }

      if (!ADMIN_ROLES.has(admin?.role)) {
        setState({ status: 'forbidden', session, role: null, error: '' });
        return;
      }

      setState({ status: 'authorized', session, role: admin.role, error: '' });
    }

    checkAccess();
    const { data: listener } = supabase?.auth.onAuthStateChange(() => checkAccess()) || { data: null };
    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (state.status === 'checking') {
    return <AdminShell title="Checking admin access" copy="Verifying your session..." />;
  }

  if (state.status === 'signed-out') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (state.status === 'forbidden') {
    return <AdminShell title="Forbidden" copy="This account is signed in, but it is not authorized for AURA admin tools." />;
  }

  if (state.status === 'unconfigured') {
    return (
      <AdminShell
        title="Admin unavailable"
        copy="Supabase environment variables are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      />
    );
  }

  if (state.status === 'error') {
    return <AdminShell title="Admin access error" copy={state.error || 'Unable to verify admin access.'} />;
  }

  return children;
}

function AdminShell({ title, copy }) {
  return (
    <main className="admin-auth">
      <section className="admin-auth__panel">
        <Link to="/" className="admin-auth__brand">AURA Fight Club</Link>
        <h1>{title}</h1>
        <p>{copy}</p>
      </section>
    </main>
  );
}
