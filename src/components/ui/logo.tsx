interface LogoProps {
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
}
export function Logo({
  className = "h-8 w-auto",
  showIcon = false,
  iconOnly = false
}: LogoProps) {
  if (iconOnly) {
    return <img src="/logo-jzap.jpeg" alt="JZAP Icon" className={className} />;
  }
  if (showIcon) {
    return <div className="flex items-center gap-2">
        
        <img src="/logo-jzap.jpeg" alt="JZAP" className={className} />
      </div>;
  }
  return <img src="/logo-jzap.jpeg" alt="JZAP" className={className} />;
}