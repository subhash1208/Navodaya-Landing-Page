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
          backgroundColor: '#FAF8F2',
          color: '#0C0B08',
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
              color: '#6F6A60',
              margin: 0,
            }}
          >
            Error
          </p>
          <hr
            style={{
              border: 0,
              borderTop: '1px solid #D7D4CD',
              margin: '1rem 0',
            }}
          />
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '0 0 0.75rem',
              color: '#00559A',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#524E46', margin: '0 0 1.5rem' }}>
            The page could not be rendered. Please try again, or reload if the problem persists.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.75rem',
                // grey-400 (#8E897C) on paper (#FAF8F2) measures 3.28:1 at 12px normal weight,
                // below the 4.5:1 WCAG 1.4.3 threshold for normal text. grey-600 (#524E46) is
                // 7.79:1 on the same ground (documented in tailwind.config.ts), clearing it
                // comfortably — matches the ratio already used for the paragraph above.
                color: '#524E46',
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
              backgroundColor: '#00559A',
              color: '#FAF8F2',
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
