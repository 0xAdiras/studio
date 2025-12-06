"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Node, Edge } from "@/lib/types";
import { ForceDirectedGraph } from "@/components/money-graph/force-directed-graph";
import { SmartInputBar } from "@/components/money-graph/smart-input-bar";
import { handleTransactionInput } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ParsedTransactionOutput } from "@/ai/flows/smart-input-transaction-parsing";

const AUTH_STATUS_KEY = "moneygraph-auth-status";

const initialNodes: Node[] = [
  { id: 'root', label: 'Wallet', value: 50000, type: 'ROOT', parentId: null, x: 0, y: 0, vx: 0, vy: 0, size: 80, color: 'hsl(var(--primary))' },
  { id: 'food', label: 'Food', value: 0, type: 'CATEGORY', parentId: 'root', x: 0, y: 0, vx: 0, vy: 0, size: 60, color: 'hsl(var(--muted-foreground))' },
  { id: 'travel', label: 'Travel', value: 0, type: 'CATEGORY', parentId: 'root', x: 0, y: 0, vx: 0, vy: 0, size: 60, color: 'hsl(var(--muted-foreground))' },
  { id: 'bills', label: 'Bills', value: 0, type: 'CATEGORY', parentId: 'root', x: 0, y: 0, vx: 0, vy: 0, size: 60, color: 'hsl(var(--muted-foreground))' },
  { id: 'lends', label: 'Lends', value: 0, type: 'CATEGORY', parentId: 'root', x: 0, y: 0, vx: 0, vy: 0, size: 60, color: 'hsl(var(--muted-foreground))' },
];

const initialEdges: Edge[] = [
  { source: 'root', target: 'food' },
  { source: 'root', target: 'travel' },
  { source: 'root', target: 'bills' },
  { source: 'root', target: 'lends' },
];


export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [version, setVersion] = useState(0); // Used to trigger re-renders in graph

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_STATUS_KEY);
    if (authStatus !== "true") {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const updateGraph = useCallback((parsedOutput: ParsedTransactionOutput) => {
    setNodes(currentNodes => {
      let newNodes = [...currentNodes];
      let newEdges = [...edges];
      
      const { amount, category, merchant, people, splitDetails } = parsedOutput;
      const lowerCategory = category.toLowerCase();
      const lowerMerchant = merchant.toLowerCase();

      // 1. Update wallet
      const rootNodeIndex = newNodes.findIndex(n => n.id === 'root');
      if (rootNodeIndex !== -1) {
        newNodes[rootNodeIndex] = { ...newNodes[rootNodeIndex], value: newNodes[rootNodeIndex].value - amount };
      }

      // 2. Find or create category node
      let categoryNode = newNodes.find(n => n.label.toLowerCase() === lowerCategory);
      if (!categoryNode) {
        const categoryId = `cat_${Date.now()}`;
        categoryNode = { id: categoryId, label: category, value: 0, type: 'CATEGORY', parentId: 'root', x: 0, y: 0, vx: 0, vy: 0, size: 60, color: 'hsl(var(--muted-foreground))' };
        newNodes.push(categoryNode);
        newEdges.push({ source: 'root', target: categoryId });
      }
      
      const categoryNodeIndex = newNodes.findIndex(n => n.id === categoryNode!.id);
      newNodes[categoryNodeIndex] = { ...newNodes[categoryNodeIndex], value: newNodes[categoryNodeIndex].value + amount };

      // 3. Find or create merchant node
      let merchantNode = newNodes.find(n => n.label.toLowerCase() === lowerMerchant && n.parentId === categoryNode!.id);
      if (!merchantNode) {
        const merchantId = `merch_${Date.now()}`;
        merchantNode = { id: merchantId, label: merchant, value: 0, type: 'MERCHANT', parentId: categoryNode!.id, x: 0, y: 0, vx: 0, vy: 0, size: 40, color: 'hsl(var(--secondary))' };
        newNodes.push(merchantNode);
        newEdges.push({ source: categoryNode!.id, target: merchantId });
      }
      
      const merchantNodeIndex = newNodes.findIndex(n => n.id === merchantNode!.id);
      newNodes[merchantNodeIndex] = { ...newNodes[merchantNodeIndex], value: newNodes[merchantNodeIndex].value + amount };

      // 4. Handle splits and debtors
      if (splitDetails && Object.keys(splitDetails).length > 1) {
        for (const person in splitDetails) {
          if (person.toLowerCase() === 'me' || person.toLowerCase() === 'i') continue;

          const debtorId = `debtor_${person.toLowerCase()}`;
          let debtorNode = newNodes.find(n => n.id === debtorId);
          if (!debtorNode) {
            debtorNode = { id: debtorId, label: person, value: 0, type: 'DEBTOR', parentId: merchantNode.id, x: 0, y: 0, vx: 0, vy: 0, size: 30, color: 'hsl(var(--primary))' };
            newNodes.push(debtorNode);
            newEdges.push({ source: merchantNode.id, target: debtorId });
          }

          const debtorNodeIndex = newNodes.findIndex(n => n.id === debtorId);
          newNodes[debtorNodeIndex] = { ...newNodes[debtorNodeIndex], value: newNodes[debtorNodeIndex].value + splitDetails[person] };
        }
      }
      
      setEdges(newEdges);
      return newNodes;
    });

    setVersion(v => v + 1); // Force graph component to re-render with new nodes/edges
    
  }, [edges]);


  const onTransactionSubmit = async (input: string) => {
    const result = await handleTransactionInput(input);
    if (result.success && result.data) {
      toast({
        title: "Transaction Added",
        description: `Parsed: ${result.data.amount} for ${result.data.category} at ${result.data.merchant}`,
      });
      updateGraph(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "AI Parsing Error",
        description: result.error || "Could not understand the input.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-screen w-full relative bg-background">
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <ForceDirectedGraph key={version} nodes={nodes} edges={edges} />
      <SmartInputBar onSubmit={onTransactionSubmit} />
    </main>
  );
}
