"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from '@/lib/types';

interface ForceGraphOptions {
  width: number;
  height: number;
  attraction?: number;
  repulsion?: number;
  damping?: number;
}

export function useForceGraph(initialNodes: Node[], initialEdges: Edge[], options: ForceGraphOptions) {
  const { width, height, attraction = 0.01, repulsion = 1000, damping = 0.9 } = options;
  const [nodes, setNodes] = useState<Node[]>(() => 
    initialNodes.map(node => ({
      ...node,
      x: node.x === 0 ? width / 2 + (Math.random() - 0.5) * 100 : node.x,
      y: node.y === 0 ? height / 2 + (Math.random() - 0.5) * 100 : node.y,
    }))
  );
  const [edges] = useState<Edge[]>(initialEdges);
  const animationFrameRef = useRef<number>();
  const draggingNodeRef = useRef<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const nodeMap = useRef(new Map(nodes.map(n => [n.id, n]))).current;
  useEffect(() => {
    nodeMap.clear();
    nodes.forEach(n => nodeMap.set(n.id, n));
  }, [nodes, nodeMap]);


  const simulate = useCallback(() => {
    setNodes(currentNodes => {
      const newNodes = currentNodes.map(node => {
        // Create a mutable copy for this simulation step
        return { ...node, fx: 0, fy: 0 };
      });
      const nodeIndexMap = new Map(newNodes.map((n, i) => [n.id, i]));

      // Repulsion force between all nodes
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const a = newNodes[i];
          const b = newNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (repulsion * a.size * b.size) / (distance * distance * distance);
          
          a.fx! -= force * dx;
          a.fy! -= force * dy;
          b.fx! += force * dx;
          b.fy! += force * dy;
        }
      }

      // Attraction force along edges
      for (const edge of edges) {
        const sourceIndex = nodeIndexMap.get(edge.source);
        const targetIndex = nodeIndexMap.get(edge.target);
        if (sourceIndex === undefined || targetIndex === undefined) continue;

        const sourceNode = newNodes[sourceIndex];
        const targetNode = newNodes[targetIndex];

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        
        const force = attraction;
        
        sourceNode.fx! += force * dx;
        sourceNode.fy! += force * dy;
        targetNode.fx! -= force * dx;
        targetNode.fy! -= force * dy;
      }
      
      // Focus force
      const focusTarget = focusedNodeId ? newNodes[nodeIndexMap.get(focusedNodeId)!] : { x: width / 2, y: height / 2 };
      
      for (const node of newNodes) {
          const dx = focusTarget.x - node.x;
          const dy = focusTarget.y - node.y;
          const distance = Math.sqrt(dx*dx + dy*dy) || 1;
          
          let force = 0;
          if (focusedNodeId) {
             if (node.id === focusedNodeId) force = attraction * 5;
             else if (node.parentId === focusedNodeId) force = attraction * 2;
             else if(node.type !== 'ROOT') force = -attraction * 0.5; // push others away
          } else {
             if(node.type === 'ROOT') force = attraction * 2;
             else if(node.type === 'CATEGORY') force = attraction * 1;
          }

          node.fx! += force * dx;
          node.fy! += force * dy;
      }


      // Update positions
      return newNodes.map(node => {
        if (draggingNodeRef.current === node.id) {
            return { ...node, vx: 0, vy: 0 };
        }
        
        let newVx = (node.vx + node.fx!) * damping;
        let newVy = (node.vy + node.fy!) * damping;
        let newX = node.x + newVx;
        let newY = node.y + newVy;
        
        // Boundary check
        newX = Math.max(node.size, Math.min(width - node.size, newX));
        newY = Math.max(node.size, Math.min(height - node.size, newY));

        return { ...node, vx: newVx, vy: newVy, x: newX, y: newY };
      });
    });

    animationFrameRef.current = requestAnimationFrame(simulate);
  }, [repulsion, attraction, damping, width, height, edges, focusedNodeId]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulate]);
  
  const handleMouseDown = (nodeId: string) => {
    draggingNodeRef.current = nodeId;
  };

  const handleMouseMove = (x: number, y: number) => {
    if (!draggingNodeRef.current) return;
    setNodes(currentNodes =>
      currentNodes.map(node =>
        node.id === draggingNodeRef.current ? { ...node, x, y } : node
      )
    );
  };
  
  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  const handleNodeClick = (nodeId: string) => {
    if (focusedNodeId === nodeId) {
      setFocusedNodeId(null);
    } else {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type === 'CATEGORY') {
        setFocusedNodeId(nodeId);
      } else {
        setFocusedNodeId(null);
      }
    }
  };


  return { nodes, edges: initialEdges, handleMouseDown, handleMouseMove, handleMouseUp, handleNodeClick };
}
