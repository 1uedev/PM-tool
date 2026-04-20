import Link from "next/link";

const variants = {
  primary:
    "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-primary/40",
  secondary:
    "bg-white/5 text-white border border-white/10 hover:bg-white/10",
  outline:
    "bg-transparent border border-primary text-primary-light hover:bg-primary/10",
};

export default function Button({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer transition-all ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
