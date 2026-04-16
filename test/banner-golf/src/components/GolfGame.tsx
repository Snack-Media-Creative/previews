import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trophy, ArrowRight } from 'lucide-react';

// --- Types ---
interface Vector {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'sand' | 'water';
}

interface Level {
  ballStart: Vector;
  holePos: Vector;
  obstacles: Obstacle[];
}

// --- Constants ---
const WIDTH = 300;
const HEIGHT = 250;
const BALL_RADIUS = 5;
const HOLE_RADIUS = 10;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.1;
const MAX_POWER = 15;

const LEVELS: Level[] = [
  {
    ballStart: { x: 50, y: 125 },
    holePos: { x: 250, y: 125 },
    obstacles: []
  },
  {
    ballStart: { x: 50, y: 50 },
    holePos: { x: 250, y: 200 },
    obstacles: [
      { x: 120, y: 0, w: 20, h: 180, type: 'wall' }
    ]
  },
  {
    ballStart: { x: 50, y: 125 },
    holePos: { x: 250, y: 125 },
    obstacles: [
      { x: 100, y: 75, w: 100, h: 100, type: 'sand' },
      { x: 140, y: 0, w: 20, h: 80, type: 'wall' },
      { x: 140, y: 170, w: 20, h: 80, type: 'wall' }
    ]
  },
  {
    ballStart: { x: 50, y: 50 },
    holePos: { x: 250, y: 200 },
    obstacles: [
      { x: 100, y: 100, w: 100, h: 50, type: 'water' },
      { x: 80, y: 0, w: 10, h: 150, type: 'wall' },
      { x: 210, y: 100, w: 10, h: 150, type: 'wall' }
    ]
  }
];

export default function GolfGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [gameState, setGameState] = useState<'aiming' | 'moving' | 'won' | 'gameover'>('aiming');
  const [shake, setShake] = useState(0);
  
  // Ball state
  const ballPos = useRef<Vector>({ ...LEVELS[0].ballStart });
  const ballVel = useRef<Vector>({ x: 0, y: 0 });
  const ballTrail = useRef<Vector[]>([]);
  
  // Interaction state
  const [dragStart, setDragStart] = useState<Vector | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Vector | null>(null);

  const currentLevel = LEVELS[levelIdx];

  // Reset level
  const resetLevel = () => {
    ballPos.current = { ...currentLevel.ballStart };
    ballVel.current = { x: 0, y: 0 };
    ballTrail.current = [];
    setStrokes(0);
    setGameState('aiming');
    setShake(0);
  };

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      if (shake > 0) setShake(s => Math.max(0, s - 0.5));

      if (gameState === 'moving') {
        // Save trail
        ballTrail.current.push({ ...ballPos.current });
        if (ballTrail.current.length > 10) ballTrail.current.shift();

        // Apply velocity
        ballPos.current.x += ballVel.current.x;
        ballPos.current.y += ballVel.current.y;

        // Apply friction
        let currentFriction = FRICTION;
        
        // Check obstacles
        currentLevel.obstacles.forEach(obs => {
          if (
            ballPos.current.x + BALL_RADIUS > obs.x &&
            ballPos.current.x - BALL_RADIUS < obs.x + obs.w &&
            ballPos.current.y + BALL_RADIUS > obs.y &&
            ballPos.current.y - BALL_RADIUS < obs.y + obs.h
          ) {
            if (obs.type === 'wall') {
              setShake(3);
              // Simple bounce logic
              const dx = Math.min(Math.abs(ballPos.current.x - obs.x), Math.abs(ballPos.current.x - (obs.x + obs.w)));
              const dy = Math.min(Math.abs(ballPos.current.y - obs.y), Math.abs(ballPos.current.y - (obs.y + obs.h)));
              
              if (dx < dy) {
                ballVel.current.x *= -0.8;
                ballPos.current.x += ballVel.current.x; // push out
              } else {
                ballVel.current.y *= -0.8;
                ballPos.current.y += ballVel.current.y; // push out
              }
            } else if (obs.type === 'sand') {
              currentFriction = 0.85;
            } else if (obs.type === 'water') {
              setShake(5);
              // Reset to start
              ballPos.current = { ...currentLevel.ballStart };
              ballVel.current = { x: 0, y: 0 };
              setGameState('aiming');
            }
          }
        });

        ballVel.current.x *= currentFriction;
        ballVel.current.y *= currentFriction;

        // Boundary bounce
        if (ballPos.current.x - BALL_RADIUS < 0 || ballPos.current.x + BALL_RADIUS > WIDTH) {
          setShake(2);
          ballVel.current.x *= -0.8;
          ballPos.current.x = Math.max(BALL_RADIUS, Math.min(WIDTH - BALL_RADIUS, ballPos.current.x));
        }
        if (ballPos.current.y - BALL_RADIUS < 0 || ballPos.current.y + BALL_RADIUS > HEIGHT) {
          setShake(2);
          ballVel.current.y *= -0.8;
          ballPos.current.y = Math.max(BALL_RADIUS, Math.min(HEIGHT - BALL_RADIUS, ballPos.current.y));
        }

        // Stop if slow
        if (Math.abs(ballVel.current.x) < MIN_VELOCITY && Math.abs(ballVel.current.y) < MIN_VELOCITY) {
          ballVel.current = { x: 0, y: 0 };
          setGameState('aiming');
        }

        // Check hole
        const distToHole = Math.hypot(ballPos.current.x - currentLevel.holePos.x, ballPos.current.y - currentLevel.holePos.y);
        if (distToHole < HOLE_RADIUS) {
          if (Math.hypot(ballVel.current.x, ballVel.current.y) < 3) {
            setGameState('won');
          }
        }
      }

      draw();
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear - Grass Gradient
      const grassGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grassGradient.addColorStop(0, '#1A2F1A');
      grassGradient.addColorStop(1, '#0D160D');
      ctx.fillStyle = grassGradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Fairway highlight
      ctx.beginPath();
      const fairwayGrad = ctx.createRadialGradient(WIDTH/2, 0, 0, WIDTH/2, 0, HEIGHT);
      fairwayGrad.addColorStop(0, 'rgba(45, 90, 39, 0.4)');
      fairwayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fairwayGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw obstacles
      currentLevel.obstacles.forEach(obs => {
        if (obs.type === 'wall') ctx.fillStyle = '#C5A059'; // Gold accent for walls
        else if (obs.type === 'sand') ctx.fillStyle = '#3a3a2a'; // Muted sand
        else if (obs.type === 'water') ctx.fillStyle = '#0a1a2a'; // Deep water
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        
        if (obs.type === 'wall') {
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // Draw hole
      ctx.beginPath();
      ctx.arc(currentLevel.holePos.x, currentLevel.holePos.y, HOLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      // Hole rim
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();

      // Draw trail
      ballTrail.current.forEach((pos, i) => {
        const opacity = i / ballTrail.current.length;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BALL_RADIUS * opacity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 160, 89, ${opacity * 0.3})`;
        ctx.fill();
        ctx.closePath();
      });

      // Draw ball
      ctx.beginPath();
      ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      // Ball highlight
      ctx.beginPath();
      ctx.arc(ballPos.current.x - 1, ballPos.current.y - 1, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.closePath();

      // Draw aim line
      if (gameState === 'aiming' && dragStart && dragCurrent) {
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const dist = Math.min(Math.hypot(dx, dy), 100);
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(ballPos.current.x, ballPos.current.y);
        ctx.lineTo(
          ballPos.current.x + Math.cos(angle) * dist,
          ballPos.current.y + Math.sin(angle) * dist
        );
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.8)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.closePath();
        
        // Power indicator (Bar at bottom)
        const powerRatio = dist / 100;
        const barWidth = 180;
        const barX = (WIDTH - barWidth) / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeStyle = '#C5A059';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(barX, HEIGHT - 15, barWidth, 4, 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#C5A059';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#C5A059';
        ctx.beginPath();
        ctx.roundRect(barX, HEIGHT - 15, barWidth * powerRatio, 4, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, levelIdx, shake]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'aiming') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ('touches' in e) ? e.touches[0].clientX : e.clientX;
    const y = ('touches' in e) ? e.touches[0].clientY : e.clientY;
    
    setDragStart({ x: x - rect.left, y: y - rect.top });
    setDragCurrent({ x: x - rect.left, y: y - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ('touches' in e) ? e.touches[0].clientX : e.clientX;
    const y = ('touches' in e) ? e.touches[0].clientY : e.clientY;

    setDragCurrent({ x: x - rect.left, y: y - rect.top });
  };

  const handleMouseUp = () => {
    if (!dragStart || !dragCurrent) return;
    
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const dist = Math.min(Math.hypot(dx, dy), 100);
    const angle = Math.atan2(dy, dx);
    
    const power = (dist / 100) * MAX_POWER;
    
    if (power > 0.5) {
      ballVel.current = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power
      };
      setStrokes(s => s + 1);
      setGameState('moving');
    }
    
    setDragStart(null);
    setDragCurrent(null);
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(l => l + 1);
    } else {
      // Game complete or loop back
      setLevelIdx(0);
    }
  };

  return (
    <div 
      className="relative w-[300px] h-[250px] bg-[#080808] overflow-hidden font-sans select-none shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-gold/30"
      style={{
        transform: `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)`
      }}
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="cursor-crosshair"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none font-serif italic text-[10px] text-gold uppercase tracking-[1px]">
        <span>Hole {levelIdx + 1} - Par 3</span>
        <span>Stroke {strokes}</span>
      </div>

      <button
        onClick={resetLevel}
        className="absolute bottom-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-gold/60 hover:text-gold transition-colors border border-gold/20"
      >
        <RefreshCw size={12} />
      </button>

      {/* Win State Overlay */}
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-gold p-4 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6"
            >
              <Trophy className="text-gold w-10 h-10 mx-auto mb-3" />
              <h2 className="text-2xl font-serif italic tracking-widest uppercase">Excellence</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-[2px] mt-1">Hole in {strokes}</p>
            </motion.div>
            
            <button
              onClick={nextLevel}
              className="flex items-center gap-3 bg-transparent border border-gold text-gold px-8 py-2.5 rounded-none font-sans font-medium uppercase text-[10px] tracking-[2px] hover:bg-gold hover:text-black transition-all duration-300"
            >
              Next Course <ArrowRight size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {strokes === 0 && gameState === 'aiming' && levelIdx === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
        >
          <p className="text-[9px] text-gold/40 font-serif italic uppercase tracking-[2px]">
            Pull back to strike
          </p>
        </motion.div>
      )}
    </div>
  );
}
