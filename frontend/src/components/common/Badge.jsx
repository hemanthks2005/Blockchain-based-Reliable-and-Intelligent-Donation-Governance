import React from 'react';

export function Badge({ children, variant = 'info', className = '', ...props }) {
  const variantClass = {
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    purple: 'badge-purple',
  }[variant] || 'badge-info';

  return (
    <span className={`badge ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
