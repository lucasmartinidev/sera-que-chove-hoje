import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonVariantProps } from './button-variants'

export type ButtonProps = ButtonVariantProps & {
  'aria-label'?: string
  'aria-pressed'?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 'aria-label': ariaLabel, 'aria-pressed': ariaPressed, children, className, disabled, onClick, size, type, variant }, ref) => {
    return (
      <button
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        ref={ref}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
