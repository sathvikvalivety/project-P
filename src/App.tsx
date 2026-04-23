import { AppLayout } from './components/layout/AppLayout';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ShortcutsPanel } from './components/shared/ShortcutsPanel';
import { OnboardingTour } from './components/shared/OnboardingTour';

function App() {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  return (
    <>
      <AppLayout />
      <ShortcutsPanel isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <OnboardingTour />
    </>
  );
}

export default App;
