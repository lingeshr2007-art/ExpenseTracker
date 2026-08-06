// src/components/Confetti.jsx
import React, { useEffect, useRef } from "react";

export default function Confetti({ active, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ["#4F46E5", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        speedY: Math.random() * 3 + 2,
      });
    }

    let startTime = Date.now();

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();

        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speedY;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
        }
      });

      if (Date.now() - startTime < 3500) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
