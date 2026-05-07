import { cn } from '../lib/utils';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className, showText = false }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("flex flex-col items-center justify-center p-1", className)}>
      {!hasError ? (
        <img 
          src="/logo.png" 
          alt="LIFEISSTAR" 
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg
          viewBox="-15 -15 130 130"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* High Fidelity SVG matching the provided logo design */}
          <g transform="translate(50, 50)">
            {/* Rotate 5 petals around the center */}
            {[
              { color: '#D1239F', rotate: -36 },  // Magenta
              { color: '#553B8A', rotate: 36 },   // Purple
              { color: '#00ADEF', rotate: 108 },  // Cyan
              { color: '#79B93B', rotate: 180 },  // Green
              { color: '#FCB040', rotate: 252 },  // Orange
            ].map((petal, i) => (
              <g key={i} transform={`rotate(${petal.rotate})`}>
                <path
                  d="M0 -6 C12 -6, 26 -18, 26 -36 C26 -54, 8 -54, 0 -36 C-8 -18, -12 -6, 0 -6Z"
                  fill={petal.color}
                  className="opacity-95"
                />
              </g>
            ))}
          </g>
        </svg>
      )}
      {showText && (
        <span className="mt-2 text-[8px] font-bold tracking-[0.2em] text-white uppercase text-center leading-tight whitespace-nowrap">
          LIFEISSTAR-GROUP
        </span>
      )}
    </div>
  );
}
