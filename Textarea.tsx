import * as React from "react"
import styles from "./Textarea.module.css"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`${styles.textarea} ${className ?? ""}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"