'use client';

export default function ReviewsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '1rem' }}>
        ⭐ Reviews
      </h1>
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</p>
        <p>Review management will be implemented in Phase 5.</p>
        <p style={{ fontSize: 'var(--text-sm)', marginTop: '0.5rem' }}>
          Moderate and display customer reviews on your menu page.
        </p>
      </div>
    </div>
  );
}
