'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  label: string;
  isCategory: boolean;
  categoryIndex?: number;
  targetX: number;
  targetY: number;
  sectionId?: string;
}

const CATEGORY_COLORS = [
  { color: '#1E40AF', glow: 'rgba(30,64,175,0.6)', sectionId: 'products' },
  { color: '#0EA5E9', glow: 'rgba(14,165,233,0.6)', sectionId: 'products' },
  { color: '#7C3AED', glow: 'rgba(124,58,237,0.6)', sectionId: 'products' },
];

interface ProductCategoryGraphProps {
  onCategoryClick?: (sectionId: string) => void;
  isMobile?: boolean;
}

export function ProductCategoryGraph({ onCategoryClick, isMobile = false }: ProductCategoryGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const hoveredNodeRef = useRef<Node | null>(null);

  const initNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const cx = width / 2;
    const cy = height / 2;

    // Category nodes — arranged in a triangle
    const catPositions = [
      { x: cx - width * 0.22, y: cy - height * 0.12 },
      { x: cx + width * 0.22, y: cy - height * 0.12 },
      { x: cx,                y: cy + height * 0.18 },
    ];

    PRODUCT_CATEGORIES.forEach((cat, i) => {
      nodes.push({
        id: cat.id,
        x: catPositions[i].x + (Math.random() - 0.5) * 40,
        y: catPositions[i].y + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
        radius: isMobile ? 18 : 22,
        color: CATEGORY_COLORS[i].color,
        glowColor: CATEGORY_COLORS[i].glow,
        label: cat.name.split(' ')[0], // First word only
        isCategory: true,
        categoryIndex: i,
        targetX: catPositions[i].x,
        targetY: catPositions[i].y,
        sectionId: 'products',
      });
    });

    // Product nodes — skip on mobile
    if (!isMobile) {
      PRODUCTS.forEach((product, idx) => {
        const catIdx = PRODUCT_CATEGORIES.findIndex(c => c.id === product.category.id);
        const catNode = nodes[catIdx];
        const angle = (idx / PRODUCTS.length) * Math.PI * 2;
        const spread = 80 + Math.random() * 60;
        const tx = catNode.targetX + Math.cos(angle) * spread;
        const ty = catNode.targetY + Math.sin(angle) * spread;

        nodes.push({
          id: product.id,
          x: tx + (Math.random() - 0.5) * 30,
          y: ty + (Math.random() - 0.5) * 30,
          vx: 0, vy: 0,
          radius: 3 + Math.random() * 2,
          color: CATEGORY_COLORS[catIdx].color,
          glowColor: CATEGORY_COLORS[catIdx].glow,
          label: product.name,
          isCategory: false,
          categoryIndex: catIdx,
          targetX: tx,
          targetY: ty,
        });
      });
    }

    nodesRef.current = nodes;
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const clicked = nodesRef.current.find(n => {
        if (!n.isCategory) return false;
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 10;
      });

      if (clicked?.sectionId) {
        onCategoryClick?.(clicked.sectionId);
        // Smooth scroll to products section
        document.getElementById(clicked.sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const REPEL_RADIUS = 130;
      const REPEL_STRENGTH = 0.8;
      const RETURN_STRENGTH = 0.04;
      const DAMPING = 0.88;

      // Update physics
      nodes.forEach(node => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_STRENGTH;
          node.vx -= (dx / dist) * force;
          node.vy -= (dy / dist) * force;
        }

        // Spring back to target
        node.vx += (node.targetX - node.x) * RETURN_STRENGTH;
        node.vy += (node.targetY - node.y) * RETURN_STRENGTH;

        // Damping
        node.vx *= DAMPING;
        node.vy *= DAMPING;

        node.x += node.vx;
        node.y += node.vy;
      });

      // Draw connections (product → category)
      if (!isMobile) {
        const catNodes = nodes.filter(n => n.isCategory);
        const prodNodes = nodes.filter(n => !n.isCategory);

        prodNodes.forEach(prod => {
          const cat = catNodes[prod.categoryIndex ?? 0];
          if (!cat) return;
          ctx.beginPath();
          ctx.moveTo(prod.x, prod.y);
          ctx.lineTo(cat.x, cat.y);
          ctx.strokeStyle = `rgba(${prod.categoryIndex === 0 ? '30,64,175' : prod.categoryIndex === 1 ? '14,165,233' : '124,58,237'},0.12)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      }

      // Detect hovered category node
      hoveredNodeRef.current = null;
      nodes.forEach(node => {
        if (!node.isCategory) return;
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 10) {
          hoveredNodeRef.current = node;
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNodeRef.current === node;

        if (node.isCategory) {
          // Glow
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * (isHovered ? 3.5 : 2.5));
          gradient.addColorStop(0, node.glowColor.replace('0.6', isHovered ? '0.5' : '0.3'));
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * (isHovered ? 3.5 : 2.5), 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * (isHovered ? 1.15 : 1), 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Label
          ctx.font = `bold ${isMobile ? 9 : 10}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, node.x, node.y);

          // Hover tooltip
          if (isHovered) {
            canvas.style.cursor = 'pointer';
            const fullLabel = PRODUCT_CATEGORIES[node.categoryIndex ?? 0]?.name ?? '';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText(fullLabel, node.x, node.y + node.radius + 16);
          }
        } else {
          // Product dot
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = node.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
          ctx.fill();
        }
      });

      // Reset cursor if not hovering category
      if (!hoveredNodeRef.current) {
        canvas.style.cursor = 'default';
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [initNodes, isMobile, onCategoryClick]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
      style={{ opacity: 0.9, display: 'block' }}
    />
  );
}
