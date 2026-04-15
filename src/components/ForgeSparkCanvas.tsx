import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;        // velocidade horizontal (vento)
  vy: number;        // leve deriva vertical
  life: number;      // 0..1
  decay: number;
  size: number;
  hue: number;       // 0-55 → laranja/dourado
  wobble: number;    // fase senoidal para o balançar no vento
  wobbleSpeed: number;
  wobbleAmp: number;
  trail: { x: number; y: number; a: number }[];
  type: 'ember' | 'streak';
}

function createSpark(canvas: HTMLCanvasElement): Spark {
  const type: Spark['type'] = Math.random() < 0.5 ? 'ember' : 'streak';

  // Nasce na borda esquerda ou dentro do primeiro quarto da tela
  const x = -20 + Math.random() * canvas.width * 0.15;
  const y = canvas.height * 0.1 + Math.random() * canvas.height * 0.75;

  // Vento: velocidade horizontal dominante, pequena variação vertical
  const windSpeed = 3.5 + Math.random() * 6.5;   // px/frame
  const vy        = (Math.random() - 0.5) * 1.2;  // leve deriva ↑↓

  return {
    x, y,
    vx: windSpeed,
    vy,
    life: 1,
    decay: 0.004 + Math.random() * 0.007,          // faíscas vivem bastante
    size: type === 'ember'
      ? 1.5 + Math.random() * 2.5
      : 0.5 + Math.random() * 1.2,
    hue: Math.random() * 50,                        // vermelho → dourado
    wobble: Math.random() * Math.PI * 2,            // fase aleatória
    wobbleSpeed: 0.04 + Math.random() * 0.06,
    wobbleAmp: 0.4 + Math.random() * 1.2,          // amplitude do balanço
    trail: [],
    type,
  };
}

export default function ForgeSparkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparks    = useRef<Spark[]>([]);
  const frameRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let lastSpawn = 0;

    const tick = (time: number) => {
      // Spawn contínuo: a cada 40-120ms, 1-3 novas faíscas
      if (time - lastSpawn > 280 + Math.random() * 400) {
        const n = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < n; i++) sparks.current.push(createSpark(canvas));
        lastSpawn = time;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparks.current.length - 1; i >= 0; i--) {
        const s = sparks.current[i];

        // Atualiza wobble (balanço senoidal → simula vento turbulento)
        s.wobble += s.wobbleSpeed;
        const wobbleY = Math.sin(s.wobble) * s.wobbleAmp;

        s.x   += s.vx;
        s.y   += s.vy + wobbleY * 0.15;
        s.life -= s.decay;

        // Remove se saiu pela direita ou morreu
        if (s.life <= 0 || s.x > canvas.width + 40) {
          sparks.current.splice(i, 1);
          continue;
        }

        // Trail
        s.trail.push({ x: s.x, y: s.y, a: s.life });
        if (s.trail.length > 14) s.trail.shift();

        const alpha = Math.min(0.45, s.life * 0.5); // sutil mas visível

        if (s.type === 'ember') {
          // Ember: bola glowing que boia
          const r = s.size + Math.sin(s.wobble * 1.7) * 0.5; // pulsa um pouco

          // Rastro suave
          if (s.trail.length > 2) {
            ctx.beginPath();
            ctx.moveTo(s.trail[0].x, s.trail[0].y);
            for (let t = 1; t < s.trail.length; t++) ctx.lineTo(s.trail[t].x, s.trail[t].y);
            const tg = ctx.createLinearGradient(s.trail[0].x, s.trail[0].y, s.x, s.y);
            tg.addColorStop(0, `hsla(${s.hue}, 100%, 55%, 0)`);
            tg.addColorStop(1, `hsla(${s.hue}, 100%, 70%, ${alpha * 0.25})`);
            ctx.strokeStyle = tg;
            ctx.lineWidth = r * 1.2;
            ctx.lineCap   = 'round';
            ctx.stroke();
          }

          // Glow radial
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4);
          grd.addColorStop(0,   `hsla(${s.hue}, 100%, 95%, ${alpha})`);
          grd.addColorStop(0.3, `hsla(${s.hue}, 100%, 70%, ${alpha * 0.8})`);
          grd.addColorStop(0.7, `hsla(${s.hue}, 100%, 50%, ${alpha * 0.3})`);
          grd.addColorStop(1,   `hsla(${s.hue}, 100%, 30%, 0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

        } else {
          // Streak: linha fina e rápida como lasca de metal
          if (s.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(s.trail[0].x, s.trail[0].y);
            for (let t = 1; t < s.trail.length; t++) ctx.lineTo(s.trail[t].x, s.trail[t].y);

            const sg = ctx.createLinearGradient(
              s.trail[0].x, s.trail[0].y, s.x, s.y
            );
            sg.addColorStop(0, `hsla(${s.hue}, 100%, 60%, 0)`);
            sg.addColorStop(0.6, `hsla(${s.hue + 15}, 100%, 80%, ${alpha * 0.6})`);
            sg.addColorStop(1,   `hsla(${s.hue + 30}, 100%, 98%, ${alpha})`);
            ctx.strokeStyle = sg;
            ctx.lineWidth   = s.size;
            ctx.lineCap     = 'round';
            ctx.stroke();
          }

          // Ponto brilhante na cabeça
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(60, 100%, 95%, ${alpha * 0.9})`;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5, mixBlendMode: 'screen' }}
    />
  );
}
