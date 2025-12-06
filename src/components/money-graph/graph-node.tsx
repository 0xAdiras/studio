"use client";

import type { Node } from '@/lib/types';
import { format } from 'date-fns';

interface GraphNodeProps {
  node: Node;
  onMouseDown: (nodeId: string) => void;
  onClick: (nodeId: string) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function GraphNode({ node, onMouseDown, onClick }: GraphNodeProps) {
  const { id, x, y, size, color, label, value } = node;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown(id);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(id);
  }

  const formattedValue = currencyFormatter.format(value);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <circle
        r={size}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth="3"
        className="transition-all duration-300 group-hover:stroke-primary"
      />
      <text
        textAnchor="middle"
        dy=".3em"
        fill="hsl(var(--foreground))"
        className="text-sm font-semibold select-none pointer-events-none"
        style={{ fontSize: Math.max(10, size / 4) }}
      >
        {label}
      </text>
      <text
        textAnchor="middle"
        dy="1.8em"
        fill="hsl(var(--foreground))"
        className="text-xs font-mono select-none pointer-events-none opacity-80"
        style={{ fontSize: Math.max(8, size / 5) }}
      >
        {formattedValue}
      </text>
    </g>
  );
}
