import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const MapPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Generate demand points for Juba-like layout
    const points: { x: number; y: number; r: number; urgency: number; phase: number }[] = [];
    for (let i = 0; i < 35; i++) {
      points.push({
        x: rect.width * 0.2 + Math.random() * rect.width * 0.6,
        y: rect.height * 0.15 + Math.random() * rect.height * 0.7,
        r: 3 + Math.random() * 6,
        urgency: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }

    let frame: number;
    const animate = (time: number) => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Grid lines
      ctx.strokeStyle = "rgba(56, 130, 220, 0.06)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < rect.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Demand points
      points.forEach((p) => {
        const pulse = Math.sin(time * 0.002 + p.phase) * 0.3 + 0.7;
        const alpha = 0.3 + p.urgency * 0.5;

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        gradient.addColorStop(0, `rgba(56, 150, 255, ${alpha * pulse * 0.4})`);
        gradient.addColorStop(1, "rgba(56, 150, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(80, 170, 255, ${alpha * pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connections between nearby points
      ctx.strokeStyle = "rgba(56, 150, 255, 0.08)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden glass-card glow-shadow"
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-moyo-glow animate-glow-pulse" />
        <span className="text-xs text-muted-foreground">Live demand — Juba, South Sudan</span>
      </div>
    </motion.div>
  );
};

export default MapPreview;
