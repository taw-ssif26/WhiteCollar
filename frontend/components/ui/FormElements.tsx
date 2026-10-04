import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export function Field({ label, required, children, hint, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs text-charcoal/50 uppercase tracking-wider font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-charcoal/40">{hint}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full border border-cream-dark rounded-sm px-3 py-2 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors bg-white",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full border border-cream-dark rounded-sm px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full border border-cream-dark rounded-sm px-3 py-2 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors bg-white resize-none",
        className
      )}
      {...props}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = "primary", loading, children, className, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-charcoal text-ivory hover:bg-gold hover:text-charcoal",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "border border-cream-dark text-charcoal/70 hover:border-gold hover:text-gold bg-white",
  };
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
