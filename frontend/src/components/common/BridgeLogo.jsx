import React from 'react';
import { Link } from 'react-router-dom';

export function BridgeLogo({ size = 'md', to = '/' }) {
  const iconSizes = {
    sm: { width: 28, height: 28, fontSize: '1.15rem' },
    md: { width: 34, height: 34, fontSize: '1.35rem' },
    lg: { width: 44, height: 44, fontSize: '1.75rem' },
  };

  const current = iconSizes[size] || iconSizes.md;

  const logoContent = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {/* Origami Ribbon Green Triangle Icon */}
      <svg
        width={current.width}
        height={current.height}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background triangle shadow facet */}
        <polygon points="18,3 33,31 3,31" fill="#047857" />
        {/* Inner folded ribbon facet left */}
        <polygon points="18,3 3,31 18,22" fill="#10b981" />
        {/* Inner folded ribbon facet right */}
        <polygon points="18,3 33,31 18,22" fill="#059669" />
        {/* Center fold highlight */}
        <polygon points="18,10 25,27 18,22" fill="#34d399" opacity="0.9" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: current.fontSize,
          letterSpacing: '-0.03em',
          color: '#0f172a',
        }}
      >
        BRIDGE
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
