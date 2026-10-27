import React, { useCallback, useEffect, useRef, useState } from 'react';

const MEMES = [
  { name: 'Dancing Pepe', img: 'https://i.imgflip.com/4/1bij.jpg' },
  { name: 'Surprised Pikachu', img: 'https://i.imgflip.com/2/9vct.jpg' },
  { name: 'NPC Wojak', img: 'https://i.imgflip.com/6/1otk96.jpg' },
  { name: 'Doggo', img: 'https://i.imgflip.com/1ur9b0.jpg' },
  { name: 'Rickroll', img: 'https://i.imgflip.com/26am.jpg' },
  { name: 'Trollface', img: 'https://i.imgflip.com/1bim.jpg' },
  { name: 'Big Chungus', img: 'https://i.imgflip.com/3si4.jpg' },
  { name: 'Wojak Crying', img: 'https://i.imgflip.com/1bh8.jpg' },
  { name: 'Sad Keanu', img: 'https://i.imgflip.com/3ooze.jpg' },
];

interface BugData {
  id: number;
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface PixelBugInstanceProps {
  bug: BugData;
  onBounce: (id: number) => void;
}

const PixelBugInstance: React.FC<PixelBugInstanceProps> = ({ bug, onBounce }) => {
  const bugRef = useRef<HTMLDivElement>(null);
  const meme = MEMES[bug.index % MEMES.length];
  const size = bug.size;
  const bouncedRef = useRef({ left: false, right: false, top: false, bottom: false });

  useEffect(() => {
    const el = bugRef.current;
    if (!el) return;

    let x = bug.x;
    let y = bug.y;
    let vx = bug.vx;
    let vy = bug.vy;

    const update = () => {
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size - 30;

      x += vx;
      y += vy;

      let hit = false;

      if (x <= 0) {
        if (!bouncedRef.current.left) {
          bouncedRef.current.left = true;
          hit = true;
        }
        x = 0;
        vx = Math.abs(vx);
      } else if (x >= maxX) {
        if (!bouncedRef.current.right) {
          bouncedRef.current.right = true;
          hit = true;
        }
        x = maxX;
        vx = -Math.abs(vx);
      } else {
        bouncedRef.current.left = false;
        bouncedRef.current.right = false;
      }

      if (y <= 0) {
        if (!bouncedRef.current.top) {
          bouncedRef.current.top = true;
          hit = true;
        }
        y = 0;
        vy = Math.abs(vy);
      } else if (y >= maxY) {
        if (!bouncedRef.current.bottom) {
          bouncedRef.current.bottom = true;
          hit = true;
        }
        y = maxY;
        vy = -Math.abs(vy);
      } else {
        bouncedRef.current.top = false;
        bouncedRef.current.bottom = false;
      }

      if (hit) {
        onBounce(bug.id);
      }

      el.style.transform = `translate(${x}px, ${y}px) scaleX(${vx > 0 ? 1 : -1})`;

      requestAnimationFrame(update);
    };

    update();
  }, [bug, size, onBounce]);

  return (
    <div
      ref={bugRef}
      className="fixed top-0 left-0 z-[100000] pointer-events-auto cursor-not-allowed select-none"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center">
        <div className="mb-1 px-1.5 py-0.5 rounded bg-black/90 text-yellow-300 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg border border-yellow-400/60">
          {meme.name}
        </div>
        <div
          className="rounded-lg overflow-hidden border-2 border-yellow-400 shadow-[0_0_25px_rgba(255,215,0,0.9)] bg-black"
          style={{ width: size, height: size }}
        >
          <img
            src={meme.img}
            alt={meme.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export const PixelBug: React.FC = () => {
  const [bugs, setBugs] = useState<BugData[]>([]);

  useEffect(() => {
    const initial: BugData[] = [];
    for (let i = 0; i < 2; i++) {
      const size = 72 + i * 8;
      initial.push({
        id: Date.now() + i,
        index: i,
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size - 40),
        vx: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2.5),
        vy: (Math.random() > 0.5 ? 1 : -1) * (2.4 + Math.random() * 2),
        size,
      });
    }
    setBugs(initial);
  }, []);

  const onBounce = useCallback((id: number) => {
    setBugs((prev) => {
      if (prev.length > 250) return prev;
      const source = prev.find((b) => b.id === id);
      if (!source) return prev;

      const size = Math.max(56, source.size - 4);
      const newBug: BugData = {
        id: Date.now() + Math.random() * 100000,
        index: (source.index + prev.length) % MEMES.length,
        x: Math.max(0, Math.min(window.innerWidth - size, source.x)),
        y: Math.max(0, Math.min(window.innerHeight - size - 40, source.y)),
        vx: (Math.random() > 0.5 ? 1 : -1) * (Math.abs(source.vx) * 1.08),
        vy: (Math.random() > 0.5 ? 1 : -1) * (Math.abs(source.vy) * 1.08),
        size,
      };

      return [...prev, newBug];
    });
  }, []);

  return (
    <>
      {bugs.map((bug) => (
        <PixelBugInstance key={bug.id} bug={bug} onBounce={onBounce} />
      ))}
    </>
  );
};


