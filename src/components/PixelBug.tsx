import React, { useEffect, useRef, useState } from 'react';

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
];

export const PixelBug: React.FC = () => {
  const bugRef = useRef<HTMLDivElement>(null);
  const [meme] = useState(() => MEMES[Math.floor(Math.random() * MEMES.length)]);

  useEffect(() => {
    const bug = bugRef.current;
    if (!bug) return;

    let x = Math.random() * (window.innerWidth - 80);
    let y = Math.random() * (window.innerHeight - 100);
    let vx = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 1.4);
    let vy = (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.2);

    const update = () => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 100;

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

      bug.style.transform = `translate(${x}px, ${y}px) scaleX(${vx > 0 ? -1 : 1})`;

      requestAnimationFrame(update);
    };

    update();

    const handleResize = () => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 100;
      if (x > maxX) x = maxX;
      if (y > maxY) y = maxY;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={bugRef}
      className="fixed top-0 left-0 z-[100000] pointer-events-auto cursor-not-allowed select-none"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center">
        <div className="mb-1 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-lg">
          {meme.name}
        </div>
        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.8)] bg-black">
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
