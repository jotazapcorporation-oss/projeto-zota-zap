import { useState, useEffect } from 'react';

interface TutorialProgress {
  [sectionId: string]: boolean[];
}

export function useTutorial(sectionId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<boolean[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('vzap_tutorial_progress');
    if (savedProgress) {
      const allProgress: TutorialProgress = JSON.parse(savedProgress);
      setProgress(allProgress[sectionId] || []);
    }
  }, [sectionId]);

  const toggleStep = (stepIndex: number) => {
    const newProgress = [...progress];
    newProgress[stepIndex] = !newProgress[stepIndex];
    setProgress(newProgress);

    const savedProgress = localStorage.getItem('vzap_tutorial_progress');
    const allProgress: TutorialProgress = savedProgress ? JSON.parse(savedProgress) : {};
    allProgress[sectionId] = newProgress;
    localStorage.setItem('vzap_tutorial_progress', JSON.stringify(allProgress));
  };

  const resetProgress = () => {
    setProgress([]);
    const savedProgress = localStorage.getItem('vzap_tutorial_progress');
    const allProgress: TutorialProgress = savedProgress ? JSON.parse(savedProgress) : {};
    delete allProgress[sectionId];
    localStorage.setItem('vzap_tutorial_progress', JSON.stringify(allProgress));
  };

  return {
    isOpen,
    setIsOpen,
    progress,
    toggleStep,
    resetProgress,
  };
}
