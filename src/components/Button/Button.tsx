import { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  onClick: () => void; // Function to call when clicked
  children: ReactNode; // Content of the button (text, icon, etc.)
  className?: string; // Allow passing additional classes
  ariaLabel?: string; // For accessibility
  variant?: 'primary' | 'secondary' | string; // Optional variant prop (allow string for flexibility)
}

/**
 * A general reusable button component.
 */
function Button({ onClick, children, className = '', ariaLabel, variant }: ButtonProps) {
  // Construct class names: base style, variant style (if provided), and any extra classes
  const buttonClasses = [
    styles.button,
    variant ? styles[variant] : '', // Apply variant class if it exists in CSS Modules
    className,
  ].filter(Boolean).join(' '); // Filter out empty strings and join

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default Button;
