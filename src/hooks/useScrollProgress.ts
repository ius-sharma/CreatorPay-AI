'use client';

import { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { SECTIONS } from '@/config/sections';

export interface ScrollState {
  progress: number;
  lerpedProgress: number;
  activeSectionIndex: number;
  activeSection: (typeof SECTIONS)[number];
  prefersReducedMotion: boolean;
  isMobile: boolean;
  scrollToProgress: (target: number) => void;
  scrollToSection: (index: number) => void;
}

export function useScrollProgress(): ScrollState {
  const [progress, setProgress] = useState(0);
  const [lerpedProgress, setLerpedProgress] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const progressRef = useRef(0);
  const lerpedProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Accessibility: Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // 2. Responsive: Check mobile screen
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 3. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const rawProgress = totalScroll > 0 ? Math.min(Math.max(scrollY / totalScroll, 0), 1) : 0;

      progressRef.current = rawProgress;
      setProgress(rawProgress);

      // Determine active section
      const activeIdx = SECTIONS.findIndex(
        (sec) => rawProgress >= sec.scrollRange[0] && rawProgress <= sec.scrollRange[1]
      );
      if (activeIdx !== -1) {
        setActiveSectionIndex(activeIdx);
      } else if (rawProgress >= 0.99) {
        setActiveSectionIndex(SECTIONS.length - 1);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 4. Smooth 60fps RAF Lerp for WebGL Camera
    const animate = (time: number) => {
      lenis.raf(time);

      // Smooth camera interpolation
      const diff = progressRef.current - lerpedProgressRef.current;
      lerpedProgressRef.current += diff * 0.08;

      // Small threshold snap to avoid endless microscopic recalculations
      if (Math.abs(diff) < 0.0001) {
        lerpedProgressRef.current = progressRef.current;
      }

      setLerpedProgress(lerpedProgressRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, []);

  const scrollToProgress = (target: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = target * totalScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const scrollToSection = (index: number) => {
    const targetSection = SECTIONS[index];
    if (!targetSection) return;
    const midProgress = (targetSection.scrollRange[0] + targetSection.scrollRange[1]) / 2;
    scrollToProgress(midProgress);
  };

  return {
    progress,
    lerpedProgress,
    activeSectionIndex,
    activeSection: SECTIONS[activeSectionIndex] || SECTIONS[0],
    prefersReducedMotion,
    isMobile,
    scrollToProgress,
    scrollToSection,
  };
}
