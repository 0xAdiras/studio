"use client";

import { useRef, useEffect, useState } from 'react';
import type { Node, Edge } from '@/lib/types';
import { useForceGraph } from '@/hooks/use-force-graph';
import { GraphNode } from './graph-node';
import { GraphEdge } from './graph-edge';

interface ForceDirectedGraphProps {
  nodes: Node[];
  edges: Edge[];
}

export function ForceDirectedGraph({ nodes: initialNodes, edges: initialEdges }: ForceDirectedGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  const { nodes, edges, handleMouseDown, handleMouseMove, handleMouseUp, handleNodeClick } = useForceGraph(
    initialNodes,
    initialEdges,
    { width: dimensions.width, height: dimensions.height }
  );
  
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      handleMouseMove(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseMove={onMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <marker
          id="arrowhead"
          viewBox="-0 -5 10 10"
          refX="10"
          refY="0"
          orient="auto"
          markerWidth="8"
          markerHeight="8"
          xoverflow="visible"
        >
          <path d="M 0,-5 L 10 ,0 L 0,5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        </marker>
      </defs>
      
      <g>
        {edges.map((edge) => (
          <GraphEdge key={`${edge.source}-${edge.target}`} edge={edge} nodes={nodes} />
        ))}
      </g>
      <g>
        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            onMouseDown={handleMouseDown}
            onClick={handleNodeClick}
          />
        ))}
      </g>
    </svg>
  );
}
