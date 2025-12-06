export type NodeType = 'ROOT' | 'CATEGORY' | 'MERCHANT' | 'PERSON' | 'DEBTOR';

export interface Node {
  id: string;
  label: string;
  value: number;
  type: NodeType;
  parentId: string | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export interface Edge {
  source: string;
  target: string;
}
