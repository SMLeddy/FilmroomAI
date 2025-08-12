import React from "react";
import styles from "./Input.module.css";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`${styles.input} ${className ?? ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";