"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Disable on mobile or reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.innerWidth <= 767 || prefersReducedMotion) {
      setIsVisible(false);
      return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const animateCursor = () => {
      dotX += (mouseX - dotX) * 0.08;
      dotY += (mouseY - dotY) * 0.08;
      ringX += (mouseX - ringX) * 0.04;
      ringY += (mouseY - ringY) * 0.04;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${dotX}px`;
        dotRef.current.style.top = `${dotY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      
      requestAnimationFrame(animateCursor);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(animateCursor);
    
    // Handle hover states
    const interactiveElements = document.querySelectorAll("a, button, .magnetic");
    
    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.classList.add("opacity-0");
      if (ringRef.current) {
        ringRef.current.style.width = "60px";
        ringRef.current.style.height = "60px";
        ringRef.current.style.borderColor = "var(--accent-purple)";
      }
    };
    
    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.classList.remove("opacity-0");
      if (ringRef.current) {
        ringRef.current.style.width = "40px";
        ringRef.current.style.height = "40px";
        ringRef.current.style.borderColor = "var(--accent-teal)";
      }
    };
    
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[10000] w-3 h-3 rounded-full opacity-90"
        style={{ 
          background: "var(--accent-teal)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[10000] rounded-full opacity-30 transition-all duration-300"
        style={{ 
          width: "40px",
          height: "40px",
          border: "1px solid var(--accent-teal)",
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}
