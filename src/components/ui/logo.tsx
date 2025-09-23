import { useTheme } from '@/hooks/useTheme'

interface LogoProps {
  className?: string
  showIcon?: boolean
  iconOnly?: boolean
}

export function Logo({ className = "h-8 w-auto", showIcon = false, iconOnly = false }: LogoProps) {
  const { theme } = useTheme()
  
  // Determina se está no modo escuro
  const isDarkMode = theme === 'dark'
  
  if (iconOnly) {
    return (
      <img 
        src="/lovable-uploads/a5a40de7-4096-4a32-af0c-76fe03ec72f7.png"
        alt="JSAP Icon" 
        className={className}
      />
    )
  }
  
  if (showIcon) {
    return (
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/a5a40de7-4096-4a32-af0c-76fe03ec72f7.png"
          alt="JSAP Icon" 
          className="h-6 w-6"
        />
        <img 
          src={isDarkMode 
            ? "/lovable-uploads/bd48b065-36ce-4af8-926d-a1f05a2d43c5.png" // Logo branca
            : "/lovable-uploads/1c9bdf0f-2ce0-4cff-b275-4506803853fe.png" // Logo preta
          }
          alt="JSAP" 
          className={className}
        />
      </div>
    )
  }
  
  return (
    <img 
      src={isDarkMode 
        ? "/lovable-uploads/bd48b065-36ce-4af8-926d-a1f05a2d43c5.png" // Logo branca
        : "/lovable-uploads/1c9bdf0f-2ce0-4cff-b275-4506803853fe.png" // Logo preta
      }
      alt="JSAP" 
      className={className}
    />
  )
}