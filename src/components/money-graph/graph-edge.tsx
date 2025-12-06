"use client";

import type { Node, Edge } from '@/lib/types';

interface GraphEdgeProps {
  edge: Edge;
  nodes: Node[];
}

export function GraphEdge({ edge, nodes }: GraphEdgeProps) {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return null;

  const sourceX = sourceNode.x + (dx * sourceNode.size) / distance;
  const sourceY = sourceNode.y + (dy * sourceNode.size) / distance;
  const targetX = targetNode.x - (dx * targetNode.size) / distance;
  const targetY = targetNode.y - (dy * targetNode.size) / distance;

  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
      markerEnd="url(#arrowhead)"
    />
  );
}
