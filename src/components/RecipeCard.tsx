import { Clock, Users, Flame, Heart, Shield } from 'lucide-react';
import { Recipe } from '../data/recipes';
import { useUserData } from '../contexts/UserDataContext';
import { useHealth } from '../contexts/HealthContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';

interface RecipeCardProps {
  recipe: Recipe;
  matchPercentage: number;
  missingIngredients: string[];
  onViewRecipe: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, matchPercentage, missingIngredients, onViewRecipe }: RecipeCardProps) {
  const { toggleFavorite, isFavorite } = useUserData();
  const { profile, getHealthScore } = useHealth();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const isFav = isFavorite(recipe.id);
  const healthScore = profile ? getHealthScore(recipe.calories, recipe.ingredients) : null;

  const getMatchColor = () => {
    if (matchPercentage >= 80) return 'from-green-500 to-emerald-500';
    if (matchPercentage >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-orange-500 to-red-500';
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    toggleFavorite(recipe.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden" onClick={() => onViewRecipe(recipe)}>
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Favorite Button - Top Left corner */}
        <button onClick={handleFavorite}
          className={`absolute top-3 left-3 z-10 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 ${isFav ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500'}`}>
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Match Badge - Top Right */}
        <div className={`absolute top-3 right-3 bg-gradient-to-l ${getMatchColor()} text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
          {matchPercentage}%
        </div>

        {/* Calories Badge on Image */}
        <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
          <Flame className="w-3.5 h-3.5" />
          {recipe.calories} سعرة
        </div>

        {/* Health Score Badge */}
        {healthScore !== null && (
          <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md backdrop-blur-sm ${
            healthScore >= 80 ? 'bg-green-500/90 text-white' : healthScore >= 50 ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            {healthScore >= 80 ? 'مناسب' : healthScore >= 50 ? 'حذر' : 'غير مناسب'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col" onClick={() => onViewRecipe(recipe)}>
        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{recipe.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{recipe.description}</p>
        
        {/* Info Row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.cookTime}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{recipe.servings}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">{recipe.difficulty}</span>
        </div>

        {/* Missing Ingredients */}
        {missingIngredients.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-red-500 font-semibold mb-1">ينقصك {missingIngredients.length} مكون:</p>
            <p className="text-xs text-gray-400 line-clamp-1">{missingIngredients.slice(0, 3).join('، ')}{missingIngredients.length > 3 ? '...' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
