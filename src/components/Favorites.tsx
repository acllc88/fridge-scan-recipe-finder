import { ArrowRight, Heart, LogIn } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { recipes, Recipe } from '../data/recipes';
import RecipeCard from './RecipeCard';

interface FavoritesProps {
  onBack: () => void;
  onViewRecipe: (recipe: Recipe) => void;
}

export default function Favorites({ onBack, onViewRecipe }: FavoritesProps) {
  const { userData } = useUserData();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  
  const favoriteRecipes = recipes.filter(recipe => 
    userData.favoriteRecipes.includes(recipe.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-gradient-to-l from-red-700 via-red-600 to-green-700 text-white py-4 px-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-current" />
            <h1 className="text-xl font-bold">وصفاتي المفضلة</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Not Logged In */}
        {!user ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">سجل دخولك أولاً</h2>
            <p className="text-gray-600 mb-8">تحتاج لتسجيل الدخول لحفظ وعرض وصفاتك المفضلة</p>
            <button onClick={openAuthModal}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2 mx-auto">
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد وصفات مفضلة بعد</h2>
            <p className="text-gray-600 mb-8">قم بالضغط على رمز القلب ❤️ في الوصفات لإضافتها هنا</p>
            <button onClick={onBack}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg">
              استكشف الوصفات
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-gray-500 text-sm">{favoriteRecipes.length} وصفة محفوظة</p>
            {favoriteRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewRecipe={onViewRecipe}
                matchPercentage={100}
                missingIngredients={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
