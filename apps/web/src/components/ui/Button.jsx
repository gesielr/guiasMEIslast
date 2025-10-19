import React from 'react';

export default function Button({ children, variant = 'primary', ...props }){
  const base = { padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' };
  const variants = {
    primary: { background: '#10B981', color: '#fff' },
    secondary: { background: '#1E40AF', color: '#fff' },
    danger: { background: '#DC2626', color: '#fff' },
    ghost: { background: 'transparent', color: '#6B7280', border: '1px solid #e5e7eb' }
  };
  return <button {...props} style={{ ...base, ...(variants[variant] || variants.primary), ...(props.style || {}) }}>{children}</button>;
}
