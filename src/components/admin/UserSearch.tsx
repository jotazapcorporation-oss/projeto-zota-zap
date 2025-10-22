import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearch = ({ value, onChange }: UserSearchProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(localValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [localValue]);

  return (
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Buscar por nome ou email..."
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => setLocalValue('')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
