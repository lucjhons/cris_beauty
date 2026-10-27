import React, { useEffect, useRef } from 'react';

const MEMES = [
  {
    name: 'Dancing Pepe',
    img: 'https://i.imgflip.com/4/1bij.jpg',
  },
  {
    name: 'Surprised Pikachu',
    img: 'https://i.imgflip.com/2/9vct.jpg',
  },
  {
    name: 'NPC Wojak',
    img: 'https://i.imgflip.com/6/1otk96.jpg',
  },
  {
    name: 'Doggo',
    img: 'https://i.imgflip.com/1ur9b0.jpg',
  },
  {
    name: 'Rickroll',
    img: 'https://i.imgflip.com/26am.jpg',
  },
  {
    name: 'Trollface',
    img: 'https://i.imgflip.com/1bim.jpg',
  },
  {
    name: 'Big Chungus',
    img: 'https://i.imgflip.com/3si4.jpg',
  },
  {
    name: 'Wojak Crying',
    img: 'https://i.imgflip.com/1bh8.jpg',
  },
  {
    name: 'Sad Keanu',
    img: 'https://i.imgflip.com/3ooze.jpg',
  },
];

interface PixelBugInstanceProps {
  index: number;
}

const PixelBugInstance: React.FC<PixelBugInstanceProps> = ({ index }) => {
  const bugRef = useRef<HTMLDivElement>(null);
  const meme = MEMES[index % MEMES.length];
  const size = 76 + index * 6;

  useEffect(() => {
    const bug = bugRef.current;
    if (!bug) return;

    let x = Math.random() * (window.innerWidth - size);
    let y = Math.random() * (window.innerHeight - size - 30);
    let vx = (Math.random() > 0.5 ? 1 : -1) * (2.6 + Math.random() * 2.2 + index * 0.4);
    let vy = (Math.random() > 0.5 ? 1 : -1) * (2.0 + Math.random() * 1.8 + index * 0.3);

    const update = () => {
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size - 30;

      x += vx;
      y += vy;

      if (x <= 0) {
        x = 0;
        vx *= -1;
      } else if (x >= maxX) {
        x = maxX;
        vx *= -1;
      }

      if (y <= 0) {
        y = 0;
        vy *= -1;
      } else if (y >= maxY) {
        y = maxY;
        vy *= -1;
      }

      bug.style.transform = `translate(${x}px, ${y}px) scaleX(${vx > 0 ? 1 : -1})`;

      requestAnimationFrame(update);
    };

    update();

    const handleResize = () => {
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size - 30;
      if (x > maxX) x = maxX;
      if (y > maxY) y = maxY;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [index, size]);

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
  return (
    <>
      <PixelBugInstance index={0} />
      <PixelBugInstance index={1} />
      <PixelBugInstance index={2} />
      <PixelBugInstance index={3} />
    </>
  );
};

