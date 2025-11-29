import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
};

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium focus:outline-none';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50',
    ghost: 'text-slate-700 hover:text-slate-900',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
