'use client';

export function SkipNav() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, {
          position: 'fixed', top: '16px', left: '16px', zIndex: '100',
          width: 'auto', height: 'auto', padding: '8px 16px',
          margin: '0', overflow: 'visible', clip: 'auto',
          background: '#1E40AF', color: '#FFFFFF',
          borderRadius: '8px', fontSize: '14px', fontWeight: '500',
          textDecoration: 'none',
        });
      }}
      onBlur={(e) => {
        Object.assign(e.currentTarget.style, {
          position: 'absolute', width: '1px', height: '1px',
          padding: '0', margin: '-1px', overflow: 'hidden',
          clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
        });
      }}
    >
      Skip to content
    </a>
  );
}
