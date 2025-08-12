import React from 'react';
import styles from './Label.module.css';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`${styles.label} ${className ?? ''}`}
    {...props}
  />
));
Label.displayName = 'Label';