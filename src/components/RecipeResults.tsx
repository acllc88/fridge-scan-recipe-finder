import { ChefHat, ArrowRight, RotateCcw, Edit3, ShoppingCart, Cookie } from 'lucide-react';
import { Recipe } from '../data/recipes';
import RecipeCard from './RecipeCard';
import { useUserData } from '../contexts/UserDataContext';

interface MatchedRecipe {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

interface RecipeResultsProps {
  matchedRecipes: MatchedRecipe[];
  selectedIngredients: string[];
  scannedImage: string | null;
  onViewRecipe: (recipe: Recipe) => void;
  onBack: () => void;
  onRescan: () => void;
  onEditIngredients: () => void;
  onOpenShoppingList: () => void;
  scanMode?: 'general' | 'sweets';
}

export function RecipeResults({
  matchedRecipes,
  selectedIngredients,
  scannedImage,
  onViewRecipe,
  onBack,
  onRescan,
  onEditIngredients,
  onOpenShoppingList,
  scanMode = 'general'
}: RecipeResultsProps) {
  const { userData } = useUserData();
  const shoppingListCount = userData.shoppingList.length;
  
  const isSweetsMode = scanMode === 'sweets';
  
  // Filter recipes based on scan mode
  const filteredRecipes = isSweetsMode 
    ? matchedRecipes.filter(r => r.recipe.category === 'حلويات' || r.recipe.category === 'مشروبات')
    : matchedRecipes;
  
  const perfectMatches = filteredRecipes.filter(r => r.matchPercentage === 100);
  const almostMatches = filteredRecipes.filter(r => r.matchPercentage >= 70 && r.matchPercentage < 100);
  const partialMatches = filteredRecipes.filter(r => r.matchPercentage >= 25 && r.matchPercentage < 70);

  const headerGradient = isSweetsMode 
    ? 'bg-gradient-to-l from-pink-600 via-purple-600 to-pink-700'
    : 'bg-gradient-to-l from-red-700 via-red-600 to-green-700';

  const summaryGradient = isSweetsMode
    ? 'bg-gradient-to-l from-pink-500 to-purple-600'
    : 'bg-gradient-to-l from-green-600 to-emerald-600';

  const tagColor = isSweetsMode
    ? 'bg-pink-100 text-pink-700'
    : 'bg-orange-100 text-orange-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className={`${headerGradient} text-white py-4 px-6 shadow-lg sticky top-0 z-20`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {isSweetsMode && <Cookie className="w-6 h-6" />}
            {isSweetsMode ? 'الحلويات المغربية 🍪' : 'الوصفات المغربية'}
          </h1>
          <button 
            onClick={onOpenShoppingList}
            className="relative p-2 hover:bg-white/20 rounded-full transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {shoppingListCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 text-red-800 text-xs font-bold rounded-full flex items-center justify-center">
                {shoppingListCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Sweets Mode Banner */}
        {isSweetsMode && (
          <div className="bg-gradient-to-l from-pink-100 to-purple-100 border-2 border-pink-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-3xl">🍪</span>
            <div>
              <h3 className="font-bold text-pink-800">وضع الحلويات المغربية</h3>
              <p className="text-sm text-pink-600">نعرض فقط وصفات الحلويات التقليدية</p>
            </div>
          </div>
        )}

        {/* Scanned Image & Ingredients */}
        {scannedImage && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative h-48">
              <img src={scannedImage} alt="صورة ممسوحة" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 right-4 left-4">
                <p className="text-white font-bold">
                  {isSweetsMode ? '🍪 مكونات الحلويات الممسوحة' : 'الصورة الممسوحة'}
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-2">المكونات المكتشفة ({selectedIngredients.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ing, i) => (
                  <span key={i} className={`${tagColor} px-3 py-1 rounded-full text-sm`}>
                    {ing}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={onRescan}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة المسح
                </button>
                <button
                  onClick={onEditIngredients}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  تعديل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Scanned Image - Just selected ingredients */}
        {!scannedImage && selectedIngredients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <p className="text-gray-600 text-sm mb-2">المكونات المختارة ({selectedIngredients.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ing, i) => (
                <span key={i} className={`${tagColor} px-3 py-1 rounded-full text-sm`}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className={`${summaryGradient} text-white rounded-2xl p-6 mb-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            {isSweetsMode ? <Cookie className="w-8 h-8" /> : <ChefHat className="w-8 h-8" />}
            <h2 className="text-2xl font-bold">
              وجدنا {filteredRecipes.length} {isSweetsMode ? 'حلوى' : 'وصفة'}
            </h2>
          </div>
          <p className={isSweetsMode ? 'text-pink-100' : 'text-green-100'}>
            {perfectMatches.length > 0 && `${perfectMatches.length} ${isSweetsMode ? 'حلوى مكتملة' : 'وصفة مكتملة'} • `}
            {almostMatches.length > 0 && `${almostMatches.length} قريبة • `}
            {partialMatches.length > 0 && `${partialMatches.length} جزئية`}
          </p>
        </div>

        {/* Shopping List Banner */}
        {shoppingListCount > 0 && (
          <button
            onClick={onOpenShoppingList}
            className="w-full bg-gradient-to-l from-blue-500 to-indigo-500 text-white rounded-2xl p-4 mb-6 shadow-lg flex items-center justify-between hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <div className="text-right">
                <p className="font-bold">قائمة التسوق</p>
                <p className="text-sm text-blue-100">{shoppingListCount} مكون للشراء</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{isSweetsMode ? '🍪' : '😕'}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isSweetsMode ? 'لم نجد حلويات مطابقة' : 'لم نجد وصفات مطابقة'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSweetsMode ? 'جرب إضافة مكونات مثل: طحين، سكر، لوز، عسل' : 'جرب إضافة المزيد من المكونات'}
            </p>
            <button
              onClick={onEditIngredients}
              className={`${isSweetsMode ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-6 py-3 rounded-xl font-bold transition`}
            >
              تعديل المكونات
            </button>
          </div>
        )}

        {/* Perfect Matches */}
        {perfectMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{isSweetsMode ? '🍪' : '🎯'}</span>
              <h3 className="text-xl font-bold text-gray-800">تطابق كامل</h3>
              <span className={`${isSweetsMode ? 'bg-pink-100 text-pink-700' : 'bg-green-100 text-green-700'} px-2 py-1 rounded-full text-sm`}>{perfectMatches.length}</span>
            </div>
            <div className="grid gap-4">
              {perfectMatches.map(({ recipe, matchPercentage, missingIngredients }) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  matchPercentage={matchPercentage}
                  missingIngredients={missingIngredients}
                  onViewRecipe={onViewRecipe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Almost Matches */}
        {almostMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{isSweetsMode ? '🍬' : '👍'}</span>
              <h3 className="text-xl font-bold text-gray-800">قريب جداً</h3>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm">{almostMatches.length}</span>
            </div>
            <div className="grid gap-4">
              {almostMatches.map(({ recipe, matchPercentage, missingIngredients }) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  matchPercentage={matchPercentage}
                  missingIngredients={missingIngredients}
                  onViewRecipe={onViewRecipe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Partial Matches */}
        {partialMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{isSweetsMode ? '🧁' : '🔍'}</span>
              <h3 className="text-xl font-bold text-gray-800">يستحق التجربة</h3>
              <span className={`${tagColor} px-2 py-1 rounded-full text-sm`}>{partialMatches.length}</span>
            </div>
            <div className="grid gap-4">
              {partialMatches.map(({ recipe, matchPercentage, missingIngredients }) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  matchPercentage={matchPercentage}
                  missingIngredients={missingIngredients}
                  onViewRecipe={onViewRecipe}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
