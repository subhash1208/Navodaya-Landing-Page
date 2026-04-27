'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';

// ─── Brand colors matching our design tokens ─────────────────────────────────
const SUN = { fill: '#7DD3FC', glow: '#38BDF8', innerGlow: '#BAE6FD' };
const PLANET_COLORS = [
  { fill: '#60A5FA', glow: '#3B82F6' }, // brand-primary blue — Hygiene & Safety
  { fill: '#22D3EE', glow: '#06B6D4' }, // brand-secondary cyan — Hotel Amenities
  { fill: '#C084FC', glow: '#A855F7' }, // purple — Spa & Salon
];

// ─── Physics constants ────────────────────────────────────────────────────────
const SPRING       = 0.03;
const DAMPING      = 0.88;
const MOON_REPEL_R = 40;
const MOON_REPEL_F = 1.05;
const HOVER_R      = 28;
const SWAY_SPD_X   = 0.8;
const SWAY_SPD_Y   = 0.6;

// ─── Node type ────────────────────────────────────────────────────────────────
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
  pIdx: number;
  swayAmp: number; swayPhase: number;
}

// ─── Build nodes from real product/category data ──────────────────────────────
function buildNodes(cx: number, cy: number): SolarNode[] {
  const nodes: SolarNode[] = [];

  // Sun node — invisible anchor point (no visual, just physics origin)
  // The 3D logo placeholder is rendered as HTML on top — no canvas node needed
  nodes.push({
    id: 'sun', type: 'sun',
    x: cx, y: cy, vx: 0, vy: 0,
    homeX: cx, homeY: cy,
    radius: 0,  // zero radius = invisible
    color: 'transparent', glow: 'transparent', innerGlow: 'transparent',
    driftAmp: 2, driftSpd: 0.28, driftPh: 0,
    orbitAngle: 0, orbitR: 0,
    parentId: null, label: null, pIdx: -1,
    swayAmp: 0, swayPhase: 0,
  });

  // Planets = product categories — exactly 120° apart to prevent collision
  PRODUCT_CATEGORIES.forEach((cat, p) => {
    const pa = (p / 3) * Math.PI * 2; // exactly 0°, 120°, 240° — no offset
    const pr = 165;
    const px = cx + Math.cos(pa) * pr;
    const py = cy + Math.sin(pa) * pr;
    const col = PLANET_COLORS[p];
    const planetId = `p${p}`;

    nodes.push({
      id: planetId, type: 'planet',
      x: px, y: py, vx: 0, vy: 0,
      homeX: px, homeY: py,
      radius: 16,
      color: col.fill, glow: col.glow,
      driftAmp: 5, driftSpd: 0.22 + p * 0.06, driftPh: p * 1.3,
      orbitAngle: pa, orbitR: pr,
      parentId: 'sun',
      label: cat.name.split(' ')[0], // First word: "Disposable", "Hotel", "Disposable"
      pIdx: p,
      swayAmp: 0, swayPhase: 0,
    });

    // Moons = products in this category
    const catProducts = PRODUCTS.filter(prod => prod.category.id === cat.id);
    catProducts.forEach((product, m) => {
      const total = catProducts.length;
      const ma = (m / total) * Math.PI * 2 + p * 0.7 + 0.5;
      // Distribute at 3 orbit radii for depth
      const orbitRadii = [38, 52, 66];
      const mr = orbitRadii[m % 3];
      const swayPhase = m * 2.09 + p * 1.57;
      const swayAmp = 10 + (m % 3) * 3; // 10–16px

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
        pIdx: p,
        swayAmp, swayPhase,
      });
    });
  });

  return nodes;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ProductCategoryGraphProps {
  width?: number;
  height?: number;
  onPlanetClick?: (categoryIndex: number) => void;
  isMobile?: boolean;
}

export function ProductCategoryGraph({
  width = 500,
  height = 500,
  onPlanetClick,
  isMobile = false,
}: ProductCategoryGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{ nodes: SolarNode[]; t: number } | null>(null);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    let nodes = buildNodes(cx, cy);

    // On mobile: only keep sun + 3 planets (no moons)
    if (isMobile) {
      nodes = nodes.filter(n => n.type !== 'moon');
    }

    stateRef.current = { nodes, t: 0 };
  }, [width, height, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const byId = (id: string) => stateRef.current?.nodes.find(n => n.id === id);

    const frame = () => {
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(frame); return; }

      s.t += 0.016;
      const { nodes, t } = s;

      // ── Update home positions ──────────────────────────────────────────
      for (const n of nodes) {
        if (n.type === 'sun') {
          n.homeX = width  / 2 + Math.sin(t * n.driftSpd + n.driftPh) * n.driftAmp;
          n.homeY = height / 2 + Math.cos(t * n.driftSpd * 0.7 + n.driftPh) * n.driftAmp;

        } else if (n.type === 'planet') {
          const sun = byId('sun');
          if (!sun) continue;
          // All planets orbit at the SAME speed — just different starting angles (120° apart)
          // This prevents collision
          const a = n.orbitAngle + t * 0.06;
          n.homeX = sun.x + Math.cos(a) * n.orbitR;
          n.homeY = sun.y + Math.sin(a) * n.orbitR;

        } else {
          // Moon — seaweed sinusoidal sway anchored to parent planet
          const parent = byId(n.parentId!);
          if (!parent) continue;
          const swayX = Math.sin(t * SWAY_SPD_X + n.swayPhase) * n.swayAmp;
          const swayY = Math.cos(t * SWAY_SPD_Y + n.swayPhase + 0.5) * n.swayAmp;
          n.homeX = parent.x + Math.cos(n.orbitAngle) * n.orbitR + swayX;
          n.homeY = parent.y + Math.sin(n.orbitAngle) * n.orbitR + swayY;
        }
      }

      // ── Spring physics + cursor repulsion (moons only) ─────────────────
      const cur = cursorRef.current;
      for (const n of nodes) {
        n.vx += (n.homeX - n.x) * SPRING;
        n.vy += (n.homeY - n.y) * SPRING;

        if (n.type === 'moon') {
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

      // ── Hover detection ────────────────────────────────────────────────
      let hovPIdx = -1;
      for (const n of nodes) {
        if (n.type !== 'planet') continue;
        const dx = n.x - cur.x, dy = n.y - cur.y;
        if (Math.sqrt(dx * dx + dy * dy) < HOVER_R) { hovPIdx = n.pIdx; break; }
      }
      canvas.style.cursor = hovPIdx >= 0 ? 'pointer' : 'default';

      // ── Draw ───────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, width, height);
      // No background fill — canvas is transparent over hero dark bg

      // Orbit reference rings (very subtle)
      const sun = byId('sun');
      if (sun) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.arc(sun.x, sun.y, 165, 0, Math.PI * 2); ctx.stroke();
        for (let p = 0; p < 3; p++) {
          const pl = byId(`p${p}`);
          if (!pl) continue;
          ctx.beginPath(); ctx.arc(pl.x, pl.y, 66, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }

      // ── Gradient thread lines ──────────────────────────────────────────
      if (sun) {
        ctx.save();
        ctx.lineCap = 'round';

        for (let p = 0; p < 3; p++) {
          const planet = byId(`p${p}`);
          if (!planet) continue;

          // Planet → Sun
          const pg = ctx.createLinearGradient(planet.x, planet.y, sun.x, sun.y);
          pg.addColorStop(0, planet.color + '59');
          pg.addColorStop(1, planet.color + '0D');
          ctx.strokeStyle = pg;
          ctx.lineWidth   = 1.5;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(planet.x, planet.y);
          ctx.lineTo(sun.x, sun.y);
          ctx.stroke();

          // Moon → Planet
          const catProducts = PRODUCTS.filter(prod => prod.category.id === PRODUCT_CATEGORIES[p].id);
          catProducts.forEach((_, m) => {
            const moon = byId(`p${p}m${m}`);
            if (!moon) return;
            const mg = ctx.createLinearGradient(moon.x, moon.y, planet.x, planet.y);
            mg.addColorStop(0, moon.color + '40');
            mg.addColorStop(1, moon.color + '08');
            ctx.strokeStyle = mg;
            ctx.lineWidth   = 0.8;
            ctx.beginPath();
            ctx.moveTo(moon.x, moon.y);
            ctx.lineTo(planet.x, planet.y);
            ctx.stroke();
          });
        }
        ctx.restore();
      }

      // ── Draw nodes (moons first, then planets, then sun) ──────────────
      const order = [
        ...nodes.filter(n => n.type === 'moon'),
        ...nodes.filter(n => n.type === 'planet'),
        ...nodes.filter(n => n.type === 'sun'),
      ];
      for (const n of order) {
        drawNode(ctx, n, n.type === 'planet' && n.pIdx === hovPIdx, t);
      }

      // ── Planet labels on hover ─────────────────────────────────────────
      ctx.save();
      for (const n of nodes) {
        if (n.type !== 'planet' || n.pIdx !== hovPIdx) continue;
        ctx.font        = "600 10px 'Inter', sans-serif";
        ctx.textAlign   = 'center';
        ctx.fillStyle   = n.color;
        ctx.shadowColor = n.glow;
        ctx.shadowBlur  = 6;
        ctx.fillText((n.label ?? '').toUpperCase(), n.x, n.y - n.radius - 10);
        ctx.shadowBlur  = 0;
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, isMobile]);

  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    cursorRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const onLeave = useCallback(() => {
    cursorRef.current = { x: -9999, y: -9999 };
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPlanetClick) return;
    const r  = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (const n of stateRef.current?.nodes ?? []) {
      if (n.type !== 'planet') continue;
      const dx = n.x - mx, dy = n.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < HOVER_R) {
        onPlanetClick(n.pIdx);
        // Scroll to products section
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        break;
      }
    }
  }, [onPlanetClick]);

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

// ─── Draw node helper ─────────────────────────────────────────────────────────
function drawNode(
  ctx: CanvasRenderingContext2D,
  n: SolarNode,
  hovered: boolean,
  t: number,
) {
  const { x, y, radius, color, glow, type } = n;

  // Skip invisible nodes (sun is now a physics anchor only)
  if (radius === 0) return;

  const pulse = type === 'sun'
    ? 1 + Math.sin(t * 1.8) * 0.08
    : hovered ? 1.3 : 1;
  const r = radius * pulse;

  const glowR    = type === 'sun'    ? r * 4.5
                 : type === 'planet' ? r * (hovered ? 4 : 2.8)
                 : r * 3.5;
  const alphaHex = type === 'moon'   ? '28'
                 : hovered           ? '55'
                 : type === 'sun'    ? '44' : '33';

  const g1 = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  g1.addColorStop(0,   glow + (type === 'sun' ? '66' : alphaHex));
  g1.addColorStop(0.5, glow + '18');
  g1.addColorStop(1,   glow + '00');
  ctx.fillStyle = g1;
  ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2); ctx.fill();

  if (type === 'sun') {
    const g2 = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
    g2.addColorStop(0,   n.innerGlow ?? '#fff');
    g2.addColorStop(0.4, color);
    g2.addColorStop(1,   glow);
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    return;
  }

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
    return;
  }

  // Moon
  ctx.globalAlpha = 0.65;
  ctx.fillStyle   = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
