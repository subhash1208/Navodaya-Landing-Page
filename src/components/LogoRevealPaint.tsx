import React from "react";
import logoImage from '../assets/images/logo.png';

/**
 * Mask-painted logo reveal:
 * - Two animated stroke masks ("hands") start at diagonally opposite corners,
 *   paint toward the center, and stop — revealing the full logo.
 * - Works with both SVG or PNG assets (we treat them as an <image>).
 * - No need to edit internal SVG paths.
 */
const LogoRevealPaint: React.FC<{
  size?: number;        // rendered size in px
  durationMs?: number;  // time for each hand to paint
  delayMs?: number;     // delay before starting
  onDone?: () => void;  // callback after animation completes
}> = ({ size = 96, durationMs = 1400, delayMs = 100, onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(() => onDone?.(), delayMs + durationMs + 200);
    return () => clearTimeout(t);
  }, [delayMs, durationMs, onDone]);

  // We use a square viewBox and viewBox-preserving image to stay crisp.
  // The masks are animated strokes (big rounded caps) moving along diagonals.
  const vars = {
    "--nvDrawDur": `${durationMs}ms`,
    "--nvDrawDelay": `${delayMs}ms`,
  } as React.CSSProperties;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Navodaya logo animated paint"
      style={vars}
    >
      <defs>
        {/* Hand 1: from top-left toward center */}
        <mask id="maskA" maskUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="black" />
          <path
            d="M -10 -10 L 50 50"
            fill="none"
            stroke="white"
            strokeWidth="28"
            strokeLinecap="round"
            pathLength={1}
            className="nv-handA"
          />
        </mask>

        {/* Hand 2: from bottom-right toward center */}
        <mask id="maskB" maskUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="black" />
          <path
            d="M 110 110 L 50 50"
            fill="none"
            stroke="white"
            strokeWidth="28"
            strokeLinecap="round"
            pathLength={1}
            className="nv-handB"
          />
        </mask>

        {/* Combine masks so either hand reveals pixels (A OR B). */}
        <mask id="maskCombined">
          <rect width="100" height="100" fill="black" />
          {/* Reuse the same animated strokes */}
          <path d="M -10 -10 L 50 50" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" pathLength={1} className="nv-handA" />
          <path d="M 110 110 L 50 50" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" pathLength={1} className="nv-handB" />
        </mask>
      </defs>

      {/* The logo image — we reveal it with the combined mask */}
      <image
        href={logoImage}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        mask="url(#maskCombined)"
      />
    </svg>
  );
};

export default LogoRevealPaint;
