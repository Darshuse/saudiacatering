export function Logo({ size = 40, variant = 'light' }: { size?: number; variant?: 'light' | 'dark' }) {
  const color = variant === 'dark' ? '#FAF8F4' : '#0F4C3A';
  const gold = '#C9A227';

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(40,40)">
        <polygon points="0,-30 5,-15 20,-20 15,-5 30,0 15,5 20,20 5,15 0,30 -5,15 -20,20 -15,5 -30,0 -15,-5 -20,-20 -5,-15" fill={color} opacity="0.9"/>
        <polygon points="0,-15 10,-10 15,0 10,10 0,15 -10,10 -15,0 -10,-10" fill={gold} opacity="0.8"/>
        <circle cx="0" cy="0" r="4" fill={color}/>
        <line x1="0" y1="15" x2="0" y2="28" stroke={gold} strokeWidth="2"/>
        <line x1="0" y1="28" x2="-8" y2="35" stroke={gold} strokeWidth="1.5"/>
        <line x1="0" y1="28" x2="8" y2="35" stroke={gold} strokeWidth="1.5"/>
      </g>
    </svg>
  );
}
