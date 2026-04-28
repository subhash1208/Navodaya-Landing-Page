'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PLANET_COLORS = [
  { fill: '#60A5FA', glow: '#3B82F6' },
  { fill: '#22D3EE', glow: '#06B6D4' },
  { fill: '#C084FC', glow: '#A855F7' },
];

// ─── Physics constants ────────────────────────────────────────────────────────
const SPRING        = 0.03;
const DAMPING       = 0.88;
const MOON_REPEL_R  = 40;
const MOON_REPEL_F  = 1.05;
const HOVER_R       = 28;
const SWAY_SPD_X    = 0.8;
const SWAY_SPD_Y    = 0.6;
const PLANET_RADIUS = 22;   // increased from 16 to fit label text
const EXPAND_RING_R = 185;  // radius of product ring when expanded — larger for label spacing
const OUTER_ORBIT_R = 195;  // max radius for non-selected planets when expanded (safe within 520px canvas: 260-195=65px margin)

// ─── Types ────────────────────────────────────────────────────────────────────
interface SolarNode {
  id: string;
  type: 'sun' | 'planet' | 'moon';
  x: number; y: number; vx: number; vy: number;
  homeX: number; homeY: number;
  radius: number;
  color: string; glow: string; innerGlow?: string;
  driftAmp: number; driftSpd: number; driftPh: number;
  orbitAngle: number; orbitR: number;
  parentId: string | null;
  label: string | null;
  slug: string | null;
  pIdx: number;
  swayAmp: number; swayPhase: number;
  // Expansion animation fields
  expandedTargetX: number;
  expandedTargetY: number;
  expandedFinalAngle: number;
  spiralProgress: number;   // 0 = collapsed, 1 = fully expanded
  expandedOpacity: number;  // 1 = visible, 0 = hidden (other category moons)
}

export interface ProductPosition {
  x: number;
  y: number;
  angle: number;
  label: string;
  slug: string;
  pIdx: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcRadialPositions(cx: number, cy: number, count: number): Array<{ x: number; y: number; angle: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // start from top
    return {
      x: cx + Math.cos(angle) * EXPAND_RING_R,
      y: cy + Math.sin(angle) * EXPAND_RING_R,
      angle,
    };
  });
}

function buildNodes(cx: number, cy: number): SolarNode[] {
  const nodes: SolarNode[] = [];

  // Sun — invisible physics anchor
  nodes.push({
    id: 'sun', type: 'sun',
    x: cx, y: cy, vx: 0, vy: 0,
    homeX: cx, homeY: cy,
    radius: 0,
    color: 'transparent', glow: 'transparent', innerGlow: 'transparent',
    driftAmp: 2, driftSpd: 0.28, driftPh: 0,
    orbitAngle: 0, orbitR: 0,
    parentId: null, label: null, slug: null, pIdx: -1,
    swayAmp: 0, swayPhase: 0,
    expandedTargetX: cx, expandedTargetY: cy,
    expandedFinalAngle: 0, spiralProgress: 0, expandedOpacity: 1,
  });

  PRODUCT_CATEGORIES.forEach((cat, p) => {
    const pa = (p / 3) * Math.PI * 2;
    const pr = 165;
    const px = cx + Math.cos(pa) * pr;
    const py = cy + Math.sin(pa) * pr;
    const col = PLANET_COLORS[p];
    const planetId = `p${p}`;

    nodes.push({
      id: planetId, type: 'planet',
      x: px, y: py, vx: 0, vy: 0,
      homeX: px, homeY: py,
      radius: PLANET_RADIUS,
      color: col.fill, glow: col.glow,
      driftAmp: 5, driftSpd: 0.22 + p * 0.06, driftPh: p * 1.3,
      orbitAngle: pa, orbitR: pr,
      parentId: 'sun',
      label: cat.name.split(' ')[0],
      slug: cat.slug,
      pIdx: p,
      swayAmp: 0, swayPhase: 0,
      expandedTargetX: px, expandedTargetY: py,
      expandedFinalAngle: pa, spiralProgress: 0, expandedOpacity: 1,
    });

    const catProducts = PRODUCTS.filter(prod => prod.category.id === cat.id);
    catProducts.forEach((product, m) => {
      const total = catProducts.length;
      const ma = (m / total) * Math.PI * 2 + p * 0.7 + 0.5;
      const orbitRadii = [38, 52, 66];
      const mr = orbitRadii[m % 3];
      const swayPhase = m * 2.09 + p * 1.57;
      const swayAmp = 10 + (m % 3) * 3;

      nodes.push({
        id: `p${p}m${m}`, type: 'moon',
        x: px + Math.cos(ma) * mr,
        y: py + Math.sin(ma) * mr,
        vx: 0, vy: 0,
        homeX: px + Math.cos(ma) * mr,
        homeY: py + Math.sin(ma) * mr,
        radius: 3,
        color: col.fill, glow: col.glow,
        driftAmp: 0, driftSpd: 0, driftPh: 0,
        orbitAngle: ma, orbitR: mr,
        parentId: planetId,
        label: product.name,
        slug: product.slug,
        pIdx: p,
        swayAmp, swayPhase,
        expandedTargetX: px, expandedTargetY: py,
        expandedFinalAngle: ma, spiralProgress: 0, expandedOpacity: 1,
      });
    });
  });

  return nodes;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductCategoryGraphProps {
  width?: number;
  height?: number;
  isMobile?: boolean;
  onExpandChange?: (categoryIndex: number | null, positions: ProductPosition[]) => void;
  onLogoScale?: (scale: number) => void;
  collapseRef?: React.MutableRefObject<(() => void) | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProductCategoryGraph({
  width = 500,
  height = 500,
  isMobile = false,
  onExpandChange,
  onLogoScale,
  collapseRef,
}: ProductCategoryGraphProps) {
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const stateRef           = useRef<{ nodes: SolarNode[]; t: number } | null>(null);
  const cursorRef          = useRef({ x: -9999, y: -9999 });
  const rafRef             = useRef<number>(0);
  const expandedRef        = useRef<number | null>(null);
  const reducedMotionRef   = useRef(false);
  const [, forceUpdate]    = useState(0);

  // ── Build nodes on mount / resize ─────────────────────────────────────────
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    let nodes = buildNodes(cx, cy);
    if (isMobile) nodes = nodes.filter(n => n.type !== 'moon');
    stateRef.current = { nodes, t: 0 };
  }, [width, height, isMobile]);

  // ── Expand / collapse helper ───────────────────────────────────────────────
  const triggerExpand = useCallback((pIdx: number | null) => {
    const s = stateRef.current;
    if (!s) return;
    const cx = width / 2;
    const cy = height / 2;

    expandedRef.current = pIdx;

    if (pIdx === null) {
      for (const n of s.nodes) { n.expandedOpacity = 1; }
      onLogoScale?.(1);
      onExpandChange?.(null, []);
    } else {
      // Compute radial positions for this category's products
      const catProducts = PRODUCTS.filter(prod => prod.category.id === PRODUCT_CATEGORIES[pIdx].id);
      const radialPos = calcRadialPositions(cx, cy, catProducts.length);

      let moonIdx = 0;
      for (const n of s.nodes) {
        if (n.type === 'moon' && n.pIdx === pIdx) {
          const rp = radialPos[moonIdx % radialPos.length];
          n.expandedTargetX = rp.x;
          n.expandedTargetY = rp.y;
          n.expandedFinalAngle = rp.angle;
          n.spiralProgress = 0; // reset — will animate to 1
          n.expandedOpacity = 1;
          moonIdx++;
        } else if (n.type === 'moon') {
          n.expandedOpacity = 0; // other category moons fade out
        }
      }

      onLogoScale?.(0.6);

      // Emit final positions for HTML overlay (after animation delay)
      const positions: ProductPosition[] = catProducts.map((prod, i) => ({
        x: radialPos[i].x,
        y: radialPos[i].y,
        angle: radialPos[i].angle,
        label: prod.name,
        slug: prod.slug,
        pIdx,
      }));
      onExpandChange?.(pIdx, positions);
    }

    forceUpdate(v => v + 1);
  }, [width, height, onExpandChange, onLogoScale]);

  // Expose collapse to parent via collapseRef
  useEffect(() => {
    if (collapseRef) {
      collapseRef.current = () => {
        if (expandedRef.current !== null) triggerExpand(null);
      };
    }
  }, [triggerExpand, collapseRef]);

  // ── rAF draw loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotionRef.current) return;

    const byId = (id: string) => stateRef.current?.nodes.find(n => n.id === id);

    const frame = () => {
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(frame); return; }

      s.t += 0.016;
      const { nodes, t } = s;
      const expanded = expandedRef.current;
      const cx = width / 2;
      const cy = height / 2;

      // ── Update home positions ────────────────────────────────────────
      for (const n of nodes) {
        if (n.type === 'sun') {
          n.homeX = cx + Math.sin(t * n.driftSpd + n.driftPh) * n.driftAmp;
          n.homeY = cy + Math.cos(t * n.driftSpd * 0.7 + n.driftPh) * n.driftAmp;

        } else if (n.type === 'planet') {
          const sun = byId('sun');
          if (!sun) continue;

          if (expanded !== null && n.pIdx === expanded) {
            // Selected planet moves to canvas center
            n.homeX = cx;
            n.homeY = cy;
          } else if (expanded !== null) {
            // Other planets drift to outer edge — clamped to stay within canvas
            const a = n.orbitAngle + t * 0.06;
            n.homeX = sun.x + Math.cos(a) * OUTER_ORBIT_R;
            n.homeY = sun.y + Math.sin(a) * OUTER_ORBIT_R;
          } else {
            // Normal orbit
            const a = n.orbitAngle + t * 0.06;
            n.homeX = sun.x + Math.cos(a) * n.orbitR;
            n.homeY = sun.y + Math.sin(a) * n.orbitR;
          }

        } else {
          // Moon
          if (expanded !== null && n.pIdx === expanded) {
            // Spiral outward to radial position
            const SPIRAL_SPEED = 0.025;
            n.spiralProgress = Math.min(1, n.spiralProgress + SPIRAL_SPEED);
            const ease = 1 - Math.pow(1 - n.spiralProgress, 3); // cubic ease-out
            const spiralOffset = (1 - ease) * Math.PI * 2.5; // 1.25 full rotations decay
            const r = EXPAND_RING_R * ease;
            n.homeX = cx + Math.cos(n.expandedFinalAngle + spiralOffset) * r;
            n.homeY = cy + Math.sin(n.expandedFinalAngle + spiralOffset) * r;

          } else if (expanded !== null) {
            // Other category moons — collapse toward their parent planet
            const parent = byId(n.parentId!);
            if (!parent) continue;
            n.spiralProgress = Math.max(0, n.spiralProgress - 0.04);
            n.homeX = parent.x;
            n.homeY = parent.y;

          } else {
            // Normal sway
            n.spiralProgress = Math.max(0, n.spiralProgress - 0.04);
            const parent = byId(n.parentId!);
            if (!parent) continue;
            const swayX = Math.sin(t * SWAY_SPD_X + n.swayPhase) * n.swayAmp;
            const swayY = Math.cos(t * SWAY_SPD_Y + n.swayPhase + 0.5) * n.swayAmp;
            n.homeX = parent.x + Math.cos(n.orbitAngle) * n.orbitR + swayX;
            n.homeY = parent.y + Math.sin(n.orbitAngle) * n.orbitR + swayY;
          }
        }
      }

      // ── Spring physics + cursor repulsion ────────────────────────────
      const cur = cursorRef.current;
      for (const n of nodes) {
        n.vx += (n.homeX - n.x) * SPRING;
        n.vy += (n.homeY - n.y) * SPRING;

        if (n.type === 'moon' && expanded === null) {
          const dx = n.x - cur.x;
          const dy = n.y - cur.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MOON_REPEL_R && d > 0) {
            const f = ((MOON_REPEL_R - d) / MOON_REPEL_R) * MOON_REPEL_F;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
        }

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x  += n.vx;
        n.y  += n.vy;
      }

      // ── Hover detection ──────────────────────────────────────────────
      let hovPIdx = -1;
      for (const n of nodes) {
        if (n.type !== 'planet') continue;
        const dx = n.x - cur.x, dy = n.y - cur.y;
        if (Math.sqrt(dx * dx + dy * dy) < HOVER_R) { hovPIdx = n.pIdx; break; }
      }
      canvas.style.cursor = hovPIdx >= 0 ? 'pointer' : 'default';

      // ── Draw ─────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, width, height);

      // Orbit rings
      const sun = byId('sun');
      if (sun) {
        ctx.save();
        ctx.globalAlpha = expanded !== null ? 0.02 : 0.05;
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.arc(sun.x, sun.y, 165, 0, Math.PI * 2); ctx.stroke();
        if (expanded === null) {
          for (let p = 0; p < 3; p++) {
            const pl = byId(`p${p}`);
            if (!pl) continue;
            ctx.beginPath(); ctx.arc(pl.x, pl.y, 66, 0, Math.PI * 2); ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Expanded ring guide
      if (expanded !== null && sun) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = PLANET_COLORS[expanded].glow;
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.arc(cx, cy, EXPAND_RING_R, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Thread lines
      if (sun) {
        ctx.save();
        ctx.lineCap = 'round';

        for (let p = 0; p < 3; p++) {
          const planet = byId(`p${p}`);
          if (!planet) continue;

          const planetAlpha = expanded !== null && p !== expanded ? 0.15 : 1;

          const pg = ctx.createLinearGradient(planet.x, planet.y, sun.x, sun.y);
          pg.addColorStop(0, planet.color + '59');
          pg.addColorStop(1, planet.color + '0D');
          ctx.strokeStyle = pg;
          ctx.lineWidth   = 1.5;
          ctx.globalAlpha = planetAlpha;
          ctx.beginPath(); ctx.moveTo(planet.x, planet.y); ctx.lineTo(sun.x, sun.y); ctx.stroke();

          const catProducts = PRODUCTS.filter(prod => prod.category.id === PRODUCT_CATEGORIES[p].id);
          catProducts.forEach((_, m) => {
            const moon = byId(`p${p}m${m}`);
            if (!moon) return;
            const moonAlpha = moon.expandedOpacity * (expanded !== null && p !== expanded ? 0 : 0.5);
            if (moonAlpha < 0.01) return;
            const mg = ctx.createLinearGradient(moon.x, moon.y, planet.x, planet.y);
            mg.addColorStop(0, moon.color + '40');
            mg.addColorStop(1, moon.color + '08');
            ctx.strokeStyle = mg;
            ctx.lineWidth   = 0.8;
            ctx.globalAlpha = moonAlpha;
            ctx.beginPath(); ctx.moveTo(moon.x, moon.y); ctx.lineTo(planet.x, planet.y); ctx.stroke();
          });
        }
        ctx.restore();
      }

      // Draw nodes
      const order = [
        ...nodes.filter(n => n.type === 'moon'),
        ...nodes.filter(n => n.type === 'planet'),
        ...nodes.filter(n => n.type === 'sun'),
      ];
      for (const n of order) {
        const isHovered = n.type === 'planet' && n.pIdx === hovPIdx;
        const isExpanded = n.type === 'planet' && n.pIdx === expanded;
        const planetFade = expanded !== null && n.type === 'planet' && n.pIdx !== expanded ? 0.4 : 1;
        const moonFade   = n.type === 'moon' ? n.expandedOpacity : 1;
        drawNode(ctx, n, isHovered || isExpanded, t, planetFade * moonFade);
      }

      // Planet labels — always visible inside nodes
      ctx.save();
      for (const n of nodes) {
        if (n.type !== 'planet') continue;
        const isExpanded = n.pIdx === expanded;
        const alpha = expanded !== null && !isExpanded ? 0.4 : 1;
        ctx.globalAlpha = alpha;
        ctx.font        = `bold 7px 'Inter', sans-serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle   = '#ffffff';
        ctx.fillText((n.label ?? '').toUpperCase(), n.x, n.y);
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, isMobile]);

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    cursorRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const onLeave = useCallback(() => {
    cursorRef.current = { x: -9999, y: -9999 };
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r  = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    // Check if a planet was clicked
    for (const n of stateRef.current?.nodes ?? []) {
      if (n.type !== 'planet') continue;
      const dx = n.x - mx, dy = n.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < HOVER_R) {
        if (expandedRef.current === n.pIdx) {
          triggerExpand(null);
        } else {
          triggerExpand(n.pIdx);
        }
        e.stopPropagation(); // prevent right-panel onClick from also firing
        return;
      }
    }

    // Background click on canvas — collapse if expanded
    if (expandedRef.current !== null) {
      triggerExpand(null);
    }
    e.stopPropagation();
  }, [triggerExpand]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      aria-hidden="true"
      style={{ display: 'block', background: 'transparent' }}
    />
  );
}

// ─── Draw node ────────────────────────────────────────────────────────────────
function drawNode(
  ctx: CanvasRenderingContext2D,
  n: SolarNode,
  hovered: boolean,
  t: number,
  alpha: number,
) {
  if (n.radius === 0 || alpha < 0.01) return;

  const { x, y, radius, color, glow, type } = n;
  const pulse = hovered ? 1.25 : 1;
  const r = radius * pulse;

  ctx.save();
  ctx.globalAlpha = alpha;

  const glowR    = type === 'planet' ? r * (hovered ? 4 : 2.8) : r * 3.5;
  const alphaHex = type === 'moon'   ? '28' : hovered ? '55' : '33';

  const g1 = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  g1.addColorStop(0,   glow + alphaHex);
  g1.addColorStop(0.5, glow + '18');
  g1.addColorStop(1,   glow + '00');
  ctx.fillStyle = g1;
  ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2); ctx.fill();

  if (type === 'planet') {
    const g3 = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
    g3.addColorStop(0,   hovered ? '#ffffff' : color + 'FF');
    g3.addColorStop(0.6, color);
    g3.addColorStop(1,   glow + 'CC');
    ctx.fillStyle = g3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hovered ? '#ffffff55' : color + '66';
    ctx.lineWidth   = 0.8;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();

    // Pulsing ring to indicate clickability
    const pulseR = r + 4 + Math.sin(t * 2.5) * 2;
    ctx.strokeStyle = glow + '44';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.arc(x, y, pulseR, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
    return;
  }

  // Moon
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
