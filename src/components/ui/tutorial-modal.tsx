import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Lightbulb } from "lucide-react";
import { tutorialContents } from "@/data/tutorialContent";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  progress: boolean[];
  onToggleStep: (stepIndex: number) => void;
  onReset: () => void;
}

export function TutorialModal({
  isOpen,
  onClose,
  sectionId,
  progress,
  onToggleStep,
  onReset,
}: TutorialModalProps) {
  const content = tutorialContents[sectionId];

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Steps Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                📚 Passo a passo
              </h3>
              <div className="space-y-3">
                {content.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{step.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{step.text}</p>
                    </div>
                    <Checkbox
                      checked={progress[index] || false}
                      onCheckedChange={() => onToggleStep(index)}
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            {content.tips && content.tips.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Dicas Importantes
                </h3>
                <div className="space-y-2">
                  {content.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <span className="text-yellow-500">💡</span>
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Summary */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Seu Progresso</p>
                  <p className="text-sm text-muted-foreground">
                    {progress.filter(Boolean).length} de {content.steps.length} passos concluídos
                  </p>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round((progress.filter(Boolean).length / content.steps.length) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
          <Button onClick={onClose}>
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
