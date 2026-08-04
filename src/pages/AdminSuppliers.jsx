import { Link } from 'react-router-dom';
import '../styles/admin-suppliers.css';

export default function AdminSuppliers() {
  return (
    <main className="sup-admin sup-admin--locked">
      <section className="sup-secure">
        <p className="sup-secure__eyebrow">Admin Supplier Command Centre</p>
        <h1>Supplier data locked</h1>
        <p>
          The former seeded supplier command centre has been removed from the frontend bundle.
          Supplier records must be managed from secured Supabase tables or a server-side admin service
          after the hardening migrations are applied.
        </p>
        <p>
          Historical Git commits still exposed the previous supplier intelligence and require owner-approved
          history remediation or credential/business rotation where applicable.
        </p>
        <Link to="/admin">Return to Admin Asset Manager</Link>
      </section>
    </main>
  );
}
