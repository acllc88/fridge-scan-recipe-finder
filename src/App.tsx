import { useState } from 'react';
import { Hero } from './components/Hero';
import { ImageScanner } from './components/ImageScanner';
import { FridgeScanner } from './components/FridgeScanner';
import { RecipeResults } from './components/RecipeResults';
import { RecipeDetail } from './components/RecipeDetail';
import { ShoppingList } from './components/ShoppingList';
import Favorites from './components/Favorites';
import HealthProfileModal from './components/HealthProfileModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { findMatchingRecipes, Recipe } from './data/recipes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { HealthProvider } from './contexts/HealthContext';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { useAuthModal } from './contexts/AuthModalContext';

type View = 'home' | 'scanner' | 'manual' | 'results' | 'detail' | 'shopping' | 'favorites' | 'privacy' | 'terms' | 'sweets-scanner' | 'sweets-manual';
type ScanMode = 'general' | 'sweets';

function MainApp() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('general');
  const { isOpen, closeAuthModal, openAuthModal } = useAuthModal();
  const { user } = useAuth();

  const matchedRecipes = findMatchingRecipes(selectedIngredients);

  const handleScanComplete = (ingredients: string[], imageUrl: string) => {
    setSelectedIngredients(ingredients);
    setScannedImage(imageUrl);
    setCurrentView('results');
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
  };

  const handleBack = () => {
    if (currentView === 'detail') setCurrentView('results');
    else if (currentView === 'results') { setScannedImage(null); setCurrentView('home'); }
    else if (currentView === 'sweets-scanner' || currentView === 'sweets-manual') { setCurrentView('home'); setScanMode('general'); }
    else setCurrentView('home');
  };

  const handleFindRecipes = (ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    setScannedImage(null);
    setCurrentView('results');
  };

  const handleNavigate = (view: 'favorites' | 'shopping' | 'privacy' | 'terms') => {
    setCurrentView(view as View);
  };

  const handleSweetsMode = () => {
    if (!user) { openAuthModal(); return; }
    setScanMode('sweets');
    setCurrentView('sweets-scanner');
  };

  const handleStartScan = () => {
    if (!user) { openAuthModal(); return; }
    setScanMode('general');
    setCurrentView('scanner');
  };

  const handleManualPick = () => {
    if (!user) { openAuthModal(); return; }
    setScanMode('general');
    setCurrentView('manual');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
      {/* User Menu - always visible */}
      {currentView !== 'privacy' && currentView !== 'terms' && (
        <div className="absolute top-4 left-4 sm:left-6 z-40">
          <UserMenu onNavigate={handleNavigate} />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} />
      
      {/* Health Profile Modal */}
      <HealthProfileModal />

      {currentView === 'home' && (
        <Hero 
          onStartScan={handleStartScan} 
          onManualPick={handleManualPick}
          onSweetsMode={handleSweetsMode}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'scanner' && (
        <ImageScanner
          onScanComplete={handleScanComplete}
          onBack={handleBack}
          onGoToManual={() => setCurrentView('manual')}
        />
      )}

      {currentView === 'sweets-scanner' && (
        <ImageScanner
          onScanComplete={handleScanComplete}
          onBack={handleBack}
          onGoToManual={() => setCurrentView('sweets-manual')}
          sweetsMode={true}
        />
      )}
      
      {currentView === 'manual' && (
        <FridgeScanner
          initialIngredients={selectedIngredients}
          onFindRecipes={handleFindRecipes}
          onBack={handleBack}
          onOpenCamera={() => setCurrentView('scanner')}
        />
      )}

      {currentView === 'sweets-manual' && (
        <FridgeScanner
          initialIngredients={selectedIngredients}
          onFindRecipes={handleFindRecipes}
          onBack={handleBack}
          onOpenCamera={() => setCurrentView('sweets-scanner')}
          sweetsMode={true}
        />
      )}
      
      {currentView === 'results' && (
        <RecipeResults
          matchedRecipes={matchedRecipes}
          selectedIngredients={selectedIngredients}
          scannedImage={scannedImage}
          onViewRecipe={handleViewRecipe}
          onBack={handleBack}
          onRescan={() => setCurrentView(scanMode === 'sweets' ? 'sweets-scanner' : 'scanner')}
          onEditIngredients={() => setCurrentView(scanMode === 'sweets' ? 'sweets-manual' : 'manual')}
          onOpenShoppingList={() => setCurrentView('shopping')}
          scanMode={scanMode}
        />
      )}
      
      {currentView === 'detail' && selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          selectedIngredients={selectedIngredients}
          onBack={handleBack}
        />
      )}

      {currentView === 'shopping' && (
        <ShoppingList onBack={handleBack} />
      )}

      {currentView === 'favorites' && (
        <Favorites onBack={handleBack} onViewRecipe={handleViewRecipe} />
      )}

      {currentView === 'privacy' && (
        <PrivacyPolicy onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'terms' && (
        <TermsOfService onBack={() => setCurrentView('home')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <HealthProvider>
          <MainApp />
        </HealthProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}
