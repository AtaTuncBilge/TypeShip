import React, { useId } from 'react';

export const SPACE_PALETTE = {
  ink: '#020203',
  inkSoft: '#050506',
  panel: 'rgba(255, 255, 255, 0.05)',
  panelStrong: 'rgba(255, 255, 255, 0.075)',
  panelMuted: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 30, 60, 0.3)',
  text: '#EDEDEF',
  textMuted: '#A0A5AE',
  accent: '#FF1E3C',
  accentStrong: '#FF3A54',
  accentWarm: '#FFB072',
  accentWarmStrong: '#FF7F63',
  success: '#FFFFFF',
  danger: '#FF7F91',
  dangerSoft: 'rgba(255, 30, 60, 0.18)',
};

export const STANDARD_GAME_PROFILE = {
  key: 'standard',
  label: 'Standard',
  description: 'continuous adaptive pressure tuned around live WPM and accuracy.',
  sessionSeconds: 90,
  hull: 100,
  impactDamage: 20,
  baseVisibleMeteors: 3,
  maxMeteors: 8,
  baseSpawnDelay: 620,
  minSpawnDelay: 180,
  maxSpawnDelay: 920,
  travelMin: 7.2,
  travelMax: 9.1,
  minTokenLength: 2,
  maxTokenLength: 24,
};

const METEOR_VARIANTS = [
  { shellA: '#1D1E24', shellB: '#07080B', crack: '#FF3A54', crater: '#111218' },
  { shellA: '#252128', shellB: '#090A0D', crack: '#FF6A63', crater: '#13141A' },
  { shellA: '#1E2026', shellB: '#06070A', crack: '#FF5877', crater: '#101117' },
];

const CRATER_LAYOUTS = [
  [
    { x: 34, y: 40, r: 8 },
    { x: 72, y: 34, r: 6 },
    { x: 58, y: 70, r: 10 },
  ],
  [
    { x: 36, y: 32, r: 7 },
    { x: 74, y: 44, r: 8 },
    { x: 54, y: 69, r: 11 },
  ],
  [
    { x: 40, y: 28, r: 7 },
    { x: 75, y: 36, r: 8 },
    { x: 48, y: 72, r: 10 },
  ],
];

export const resolveDifficulty = () => STANDARD_GAME_PROFILE;

export const SpaceBackdrop = ({ className = '', children, compact = false }) => {
  const classes = ['ts-space-shell', compact ? 'ts-space-shell--compact' : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="ts-space-layer ts-space-layer--nebula" />
      <div className="ts-space-layer ts-space-layer--stars" />
      <div className="ts-space-layer ts-space-layer--sparkles" />
      <div className="ts-space-layer ts-space-layer--grid" />
      <div className="ts-space-layer ts-space-layer--noise" />
      <div className="ts-celestial ts-celestial--planet-crimson" />
      <div className="ts-celestial ts-celestial--planet-ring" />
      <div className="ts-celestial ts-celestial--moon" />
      <div className="ts-streak ts-streak--one" />
      <div className="ts-streak ts-streak--two" />
      {children}
    </div>
  );
};

export const TypeShipMark = ({ className = '' }) => {
  const id = useId().replace(/:/g, '');

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 96 96">
      <defs>
        <linearGradient id={`${id}-mark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF1E3C" />
          <stop offset="100%" stopColor="#FF6677" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="84" height="84" rx="22" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
      <path d="M18 48L34 34L64 32L78 40L60 48L78 56L64 64L34 62L18 48Z" fill={`url(#${id}-mark)`} />
      <path d="M28 48L40 40L56 40L46 48L56 56L40 56L28 48Z" fill="#FFFFFF" opacity="0.92" />
      <path d="M18 48H78" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const ShipSprite = ({ danger = false, className = '' }) => {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      aria-hidden="true"
      className={[`ts-ship-art${danger ? ' is-danger' : ''}`, className].filter(Boolean).join(' ')}
      viewBox="0 0 420 200"
    >
      <defs>
        <linearGradient id={`${id}-shell`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22252D" />
          <stop offset="55%" stopColor="#11131A" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>
        <linearGradient id={`${id}-shell-hi`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={`${id}-wing`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#181A21" />
          <stop offset="100%" stopColor="#0A0B10" />
        </linearGradient>
        <linearGradient id={`${id}-accent`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF1E3C" />
          <stop offset="100%" stopColor="#FF3A54" />
        </linearGradient>
        <linearGradient id={`${id}-cockpit`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3F6" />
          <stop offset="100%" stopColor="#FF8698" />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FF6A63" />
        </linearGradient>
      </defs>
      <ellipse cx="176" cy="170" rx="128" ry="18" fill="rgba(255, 30, 60, 0.12)" />
      <g>
        <path d="M40 100L124 50L286 48L356 70L398 100L356 130L286 152L124 150L40 100Z" fill={`url(#${id}-shell)`} stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <path d="M88 100L160 62L274 60L334 78L364 100L334 122L274 140L160 138L88 100Z" fill="#090B10" opacity="0.98" />
        <path d="M132 60L92 22L182 56L168 84Z" fill={`url(#${id}-wing)`} />
        <path d="M132 140L92 178L182 144L168 116Z" fill={`url(#${id}-wing)`} />
        <path d="M274 58L352 74L328 95L258 82Z" fill="#151922" />
        <path d="M274 142L352 126L328 105L258 118Z" fill="#151922" />
        <path d="M180 76L246 84L276 100L246 116L180 124L152 100L180 76Z" fill={`url(#${id}-cockpit)`} opacity="0.94" />
        <path d="M98 100H340" stroke={`url(#${id}-accent)`} strokeWidth="4" strokeLinecap="round" opacity="0.94" />
        <path d="M162 88H246" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.18" />
        <path d="M164 112H244" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
        <path d="M150 70L256 78" stroke={`url(#${id}-shell-hi)`} strokeWidth="5" strokeLinecap="round" />
        <path d="M206 92L222 84L242 86L230 100L242 114L222 116L206 108L216 100Z" fill={`url(#${id}-accent)`} />
        <path d="M214 100L224 94L234 96L228 100L234 104L224 106L214 100Z" fill="#FFFFFF" opacity="0.9" />
        <circle cx="286" cy="100" r="6" fill="#FF4B67" opacity="0.95" />
        <path d="M58 88L14 100L58 112L88 100Z" fill={`url(#${id}-core)`} className="ts-thruster-flame" />
        <path d="M74 74L40 84L84 92Z" fill="#FF9AA7" className="ts-thruster-flame ts-thruster-flame--alt" />
        <path d="M74 126L40 116L84 108Z" fill="#FF9AA7" className="ts-thruster-flame ts-thruster-flame--alt" />
      </g>
    </svg>
  );
};

export const MeteorSprite = ({ active = false, danger = false, variant = 0 }) => {
  const id = useId().replace(/:/g, '');
  const palette = METEOR_VARIANTS[variant % METEOR_VARIANTS.length];
  const craters = CRATER_LAYOUTS[variant % CRATER_LAYOUTS.length];

  return (
    <svg aria-hidden="true" className={`ts-meteor-art${active ? ' is-active' : ''}${danger ? ' is-danger' : ''}`} viewBox="0 0 120 120">
      <defs>
        <radialGradient id={`${id}-surface`} cx="36%" cy="26%" r="78%">
          <stop offset="0%" stopColor={palette.shellA} />
          <stop offset="68%" stopColor={palette.shellB} />
          <stop offset="100%" stopColor="#020203" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.crack} stopOpacity="0.42" />
          <stop offset="100%" stopColor={palette.crack} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${id}-halo)`} opacity="0.52" />
      <path d="M18 42L36 18L74 12L102 28L108 62L92 94L56 108L24 90L12 62Z" fill={`url(#${id}-surface)`} stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <path d="M40 20L72 14L98 28L102 50L78 48L56 34Z" fill="rgba(255,255,255,0.08)" />
      {craters.map((crater, index) => (
        <g key={`${variant}-${index}`}>
          <circle cx={crater.x} cy={crater.y} r={crater.r} fill={palette.crater} opacity="0.88" />
          <circle cx={crater.x - 1.5} cy={crater.y - 1.5} r={Math.max(2, crater.r * 0.38)} fill="rgba(255,255,255,0.08)" />
        </g>
      ))}
      <path d="M28 78L48 62L70 74" stroke={palette.crack} strokeWidth="4" strokeLinecap="round" opacity="0.72" />
      <path d="M56 32L80 44L72 66" stroke={palette.crack} strokeWidth="3" strokeLinecap="round" opacity="0.52" />
    </svg>
  );
};

export const ExplosionBurst = ({ className = '' }) => (
  <div className={[`ts-explosion-burst`, className].filter(Boolean).join(' ')} aria-hidden="true">
    <span className="ts-explosion-burst__ring" />
    <span className="ts-explosion-burst__core" />
    <span className="ts-explosion-burst__spark ts-explosion-burst__spark--one" />
    <span className="ts-explosion-burst__spark ts-explosion-burst__spark--two" />
    <span className="ts-explosion-burst__spark ts-explosion-burst__spark--three" />
  </div>
);
