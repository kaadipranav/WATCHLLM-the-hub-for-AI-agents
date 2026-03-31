"use client";

import { useEffect, useRef } from "react";

interface Node {
  id: number;
  type: string;
  x: number;
  y: number;
  phase: number;
}

interface Edge {
  from: number;
  to: number;
  isLLM?: boolean;
  isFailure?: boolean;
}

const nodeTypes: Record<string, { color: string; label: string }> = {
  start: { color: "#ffffff", label: "start" },
  llm_call: { color: "#7b61ff", label: "llm_call" },
  tool_call: { color: "#00e5b0", label: "tool_call" },
  decision: { color: "rgba(255,255,255,0.6)", label: "decision" },
  failed: { color: "#ff6b35", label: "failed" },
  passed: { color: "rgba(0,229,176,0.6)", label: "passed" },
};

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGraph();
    };

    const initGraph = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const spread = Math.min(canvas.width, canvas.height) * 0.3;

      nodesRef.current = [
        { id: 0, type: "start", x: centerX - spread * 0.8, y: centerY - spread * 0.3, phase: Math.random() * Math.PI * 2 },
        { id: 1, type: "llm_call", x: centerX - spread * 0.4, y: centerY - spread * 0.5, phase: Math.random() * Math.PI * 2 },
        { id: 2, type: "tool_call", x: centerX, y: centerY - spread * 0.2, phase: Math.random() * Math.PI * 2 },
        { id: 3, type: "decision", x: centerX + spread * 0.3, y: centerY + spread * 0.1, phase: Math.random() * Math.PI * 2 },
        { id: 4, type: "llm_call", x: centerX + spread * 0.6, y: centerY - spread * 0.3, phase: Math.random() * Math.PI * 2 },
        { id: 5, type: "failed", x: centerX + spread * 0.8, y: centerY + spread * 0.3, phase: Math.random() * Math.PI * 2 },
        { id: 6, type: "tool_call", x: centerX - spread * 0.1, y: centerY + spread * 0.4, phase: Math.random() * Math.PI * 2 },
        { id: 7, type: "passed", x: centerX - spread * 0.5, y: centerY + spread * 0.5, phase: Math.random() * Math.PI * 2 },
      ];

      edgesRef.current = [
        { from: 0, to: 1 },
        { from: 1, to: 2, isLLM: true },
        { from: 2, to: 3 },
        { from: 3, to: 4, isLLM: true },
        { from: 4, to: 5, isFailure: true },
        { from: 3, to: 6 },
        { from: 6, to: 7 },
      ];
    };

    const draw = (timestamp: number) => {
      if (!ctx) return;

      const cycleDuration = 8000;
      const cycleTime = timestamp % cycleDuration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      const edgeProgress = Math.min(1, Math.max(0, (cycleTime - 3000) / 2000));
      drawEdges(ctx, edgeProgress, timestamp);

      // Draw nodes
      const nodeProgress = Math.min(1, cycleTime / 3000);
      drawNodes(ctx, nodeProgress, timestamp);

      // Draw execution dot
      if (cycleTime > 5000 && cycleTime < 6000) {
        const execProgress = (cycleTime - 5000) / 1000;
        drawExecutionDot(ctx, execProgress);
      }

      // Draw failure flash
      if (cycleTime > 6000 && cycleTime < 7000) {
        const flashProgress = (cycleTime - 6000) / 1000;
        drawFailureFlash(ctx, flashProgress);
      }

      if (!prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    const drawNodes = (ctx: CanvasRenderingContext2D, progress: number, timestamp: number) => {
      const time = timestamp / 1000;
      const visibleCount = Math.floor(nodesRef.current.length * progress);

      nodesRef.current.forEach((node, i) => {
        if (i >= visibleCount) return;

        const nodeType = nodeTypes[node.type];
        const floatX = Math.sin(time + node.phase) * 3;
        const floatY = Math.cos(time * 0.7 + node.phase) * 3;

        const x = node.x + floatX;
        const y = node.y + floatY;

        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = nodeType.color;

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = nodeType.color;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Label
        ctx.font = "10px JetBrains Mono";
        ctx.fillStyle = "#44445a";
        ctx.textAlign = "center";
        ctx.fillText(nodeType.label, x, y + 24);
      });
    };

    const drawEdges = (ctx: CanvasRenderingContext2D, progress: number, timestamp: number) => {
      const visibleCount = Math.floor(edgesRef.current.length * progress);

      edgesRef.current.forEach((edge, i) => {
        if (i >= visibleCount) return;

        const fromNode = nodesRef.current[edge.from];
        const toNode = nodesRef.current[edge.to];

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(
          fromNode.x + (toNode.x - fromNode.x) * Math.min(1, progress * edgesRef.current.length - i),
          fromNode.y + (toNode.y - fromNode.y) * Math.min(1, progress * edgesRef.current.length - i)
        );

        if (edge.isFailure) {
          ctx.strokeStyle = "#ff6b35";
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -timestamp / 50;
        } else if (edge.isLLM) {
          ctx.strokeStyle = "rgba(123, 97, 255, 0.3)";
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.setLineDash([]);
        }

        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    };

    const drawExecutionDot = (ctx: CanvasRenderingContext2D, progress: number) => {
      const edgeIndex = Math.floor(progress * edgesRef.current.length);
      const edgeProgress = (progress * edgesRef.current.length) % 1;

      if (edgeIndex >= edgesRef.current.length) return;

      const edge = edgesRef.current[edgeIndex];
      const fromNode = nodesRef.current[edge.from];
      const toNode = nodesRef.current[edge.to];

      const x = fromNode.x + (toNode.x - fromNode.x) * edgeProgress;
      const y = fromNode.y + (toNode.y - fromNode.y) * edgeProgress;

      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffffff";

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    const drawFailureFlash = (ctx: CanvasRenderingContext2D, progress: number) => {
      const failedNode = nodesRef.current.find((n) => n.type === "failed");
      if (!failedNode) return;

      const flashes = 3;
      const flashIndex = Math.floor(progress * flashes);
      const colors = ["#ff6b35", "#ff3366", "#ff6b35"];

      if (flashIndex < flashes) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = colors[flashIndex];

        ctx.beginPath();
        ctx.arc(failedNode.x, failedNode.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = colors[flashIndex];
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // Radiating ring
      ctx.beginPath();
      ctx.arc(failedNode.x, failedNode.y, 20 + progress * 60, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 107, 53, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (prefersReducedMotion) {
      // Static render
      drawNodes(ctx, 1, 0);
      drawEdges(ctx, 1, 0);
    } else {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
