import { useRef, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePDFStore } from '../../store/usePDFStore';
import { RecipeStepCard } from './RecipeStepCard';

/**
 * RecipeStrip
 * A horizontally scrollable drag-and-drop container for recipe steps.
 * Handles reordering logic and auto-scrolling to new steps.
 */
export function RecipeStrip({ 
  activeStepId, 
  onSetActiveStep 
}: { 
  activeStepId: string | null, 
  onSetActiveStep: (id: string | null) => void 
}) {
  const steps = usePDFStore(state => state.activeRecipe.steps);
  const reorderSteps = usePDFStore(state => state.reorderSteps);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-scroll to end when steps are added to keep focus on the new action
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [steps.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex(s => s.id === active.id);
      const newIndex = steps.findIndex(s => s.id === over.id);
      reorderSteps(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-full bg-white border-y border-gray-100 py-3">
      <div 
        ref={scrollContainerRef}
        className="flex items-start gap-0 overflow-x-auto no-scrollbar scroll-smooth px-4 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={steps.map(s => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center">
              {steps.map((step, index) => (
                <RecipeStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={activeStepId === step.id}
                  isLast={index === steps.length - 1}
                  onToggleSettings={() => {
                    onSetActiveStep(activeStepId === step.id ? null : step.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
