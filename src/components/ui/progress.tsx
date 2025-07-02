import * as React from "react"

interface ProgressProps {
  value?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-700 ${className}`}
      style={style}
      {...props}
    >
      <div
        className="h-full bg-yellow-500 transition-all duration-300 ease-out"
        style={{ 
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: (style as any)?.['--progress-background'] || '#eab308'
        }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress } 