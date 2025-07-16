import { MealSplitter } from '@/components/meal-splitter';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <MealSplitter />
    </main>
  );
}
