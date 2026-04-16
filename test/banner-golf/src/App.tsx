/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GolfGame from './components/GolfGame';

export default function App() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Brand Mark */}
      <div className="absolute bottom-10 left-10 opacity-5 font-serif text-4xl tracking-[10px] text-gold pointer-events-none uppercase">
        St Andrews Club
      </div>

      <div className="flex flex-col items-center gap-12 z-10">
        <div className="text-center">
          <h1 className="text-3xl font-serif tracking-[4px] uppercase text-gold mb-2">The Pro Open</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-[2px]">Ad Unit: Standard MREC (300x250)</p>
        </div>

        <GolfGame />

        <div className="flex gap-16">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted tracking-[1.5px]">Theme</span>
            <span className="text-sm font-serif text-gold">Sophisticated Dark</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted tracking-[1.5px]">Typography</span>
            <span className="text-sm font-serif text-gold">Georgia / Serif</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted tracking-[1.5px]">Interaction</span>
            <span className="text-sm font-serif text-gold">Tap-to-Swing HUD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
