import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TutorialButtonProps {
  onClick: () => void;
}

export function TutorialButton({ onClick }: TutorialButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>💡 Dicas passo a passo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
