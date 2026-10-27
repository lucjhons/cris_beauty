import React, { useEffect, useRef } from 'react';

export const CrazyCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = window.innerWidth - e.clientX;
      mouseY = window.innerHeight - e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.18;
      trailY += (mouseY - trailY) * 0.18;
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className="fixed pointer-events-none z-[100001] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="w-9 h-9 rounded-full border-2 border-fuchsia-500/80 shadow-[0_0_25px_rgba(236,72,153,0.7)] animate-pulse" />
      </div>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[100002] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="relative">
          <div className="w-4 h-4 bg-yellow-400 rotate-45 shadow-[0_0_15px_rgba(250,204,21,0.9)]" />
          <div className="absolute -top-1 -left-1 w-6 h-6 border border-cyan-400/70 rotate-12" />
        </div>
      </div>
    </>
  );
};
