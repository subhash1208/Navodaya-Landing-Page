'use client';

// `global-error` replaces the root layout when the layout itself throws, so it
// must render its own <html> and <body> and cannot export `metadata` (use the
// React <title> component instead). It also loads no stylesheet — globals.css
// belongs to the layout that just failed — so every style here is inline, and
// nothing is imported from `src/components`, `geist`, or any animation library.
// Hex values are the SEALED `ink` / `paper` / `grey` tokens from tailwind.config.ts.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAF8',
          color: '#0A0B0D',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <title>Something went wrong</title>
        <main style={{ maxWidth: '32rem', padding: '2rem', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6B6B64',
              margin: 0,
            }}
          >
            Error
          </p>
          <hr
            style={{
              border: 0,
              borderTop: '1px solid #D4D4D0',
              margin: '1rem 0',
            }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#4F4F49', margin: '0 0 1.5rem' }}>
            The page could not be rendered. Please try again, or reload if the problem persists.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.75rem',
                color: '#8A8A83',
                margin: '0 0 1.5rem',
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#0A0B0D',
              color: '#FAFAF8',
              border: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
