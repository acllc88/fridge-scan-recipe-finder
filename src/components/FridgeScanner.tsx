import { useState } from 'react';
import { Search, X, Camera, ChefHat, ArrowRight, Cookie } from 'lucide-react';
import { ingredientsList, allIngredients } from '../data/recipes';

interface FridgeScannerProps {
  initialIngredients: string[];
  onFindRecipes: (ingredients: string[]) => void;
  onBack: () => void;
  onOpenCamera: () => void;
  sweetsMode?: boolean;
}

// Sweets-specific ingredients organized by category
const sweetsIngredientsList: { [key: string]: string[] } = {
  'المكونات الأساسية 🌾': ['طحين', 'سميد', 'نشا', 'خميرة', 'بيكنج باودر'],
  'المحليات 🍯': ['سكر', 'سكر ناعم', 'عسل', 'شراب السكر', 'دبس التمر'],
  'الدهون 🧈': ['زبدة', 'سمن', 'زيت نباتي', 'زيت الزيتون'],
  'المكسرات 🥜': ['لوز', 'جوز', 'فول سوداني', 'جوز الهند', 'كاجو', 'فستق'],
  'البذور والفواكه المجففة 🌰': ['سمسم', 'تمر', 'زبيب', 'تين مجفف', 'مشمش مجفف'],
  'البيض والحليب 🥛': ['بيض', 'حليب', 'كريمة', 'جبن كريمي'],
  'النكهات والتوابل 🌸': ['ماء زهر', 'ماء ورد', 'فانيلا', 'قرفة', 'زعفران', 'يانسون', 'حبة حلوة', 'مستكة'],
  'الشوكولاتة والكاكاو 🍫': ['كاكاو', 'شوكولاتة داكنة', 'شوكولاتة بيضاء', 'نوتيلا'],
};

const allSweetsIngredients = Object.values(sweetsIngredientsList).flat();

export function FridgeScanner({ initialIngredients, onFindRecipes, onBack, onOpenCamera, sweetsMode = false }: FridgeScannerProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialIngredients);
  const [searchQuery, setSearchQuery] = useState('');

  const currentIngredientsList = sweetsMode ? sweetsIngredientsList : ingredientsList;
  const currentAllIngredients = sweetsMode ? allSweetsIngredients : allIngredients;

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const clearAll = () => {
    setSelectedIngredients([]);
  };

  const filteredCategories = Object.entries(currentIngredientsList).map(([category, ingredients]) => ({
    category,
    ingredients: (ingredients as string[]).filter((ing: string) =>
      searchQuery === '' || ing.includes(searchQuery)
    )
  })).filter(cat => cat.ingredients.length > 0);

  const filteredAllIngredients = currentAllIngredients.filter((ing: string) =>
    ing.includes(searchQuery)
  );

  const headerGradient = sweetsMode 
    ? 'bg-gradient-to-l from-pink-600 via-purple-600 to-pink-700'
    : 'bg-gradient-to-l from-red-700 via-red-600 to-green-700';

  const buttonGradient = sweetsMode
    ? 'bg-gradient-to-l from-pink-500 to-purple-600'
    : 'bg-gradient-to-l from-red-600 to-orange-500';

  const selectedButtonGradient = sweetsMode
    ? 'bg-gradient-to-l from-pink-500 to-purple-500 text-white shadow-md'
    : 'bg-gradient-to-l from-red-500 to-orange-500 text-white shadow-md';

  const tagColor = sweetsMode
    ? 'bg-pink-100 text-pink-700'
    : 'bg-orange-100 text-orange-700';

  const accentColor = sweetsMode ? 'pink' : 'orange';

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
            {sweetsMode && <Cookie className="w-6 h-6" />}
            {sweetsMode ? 'اختر مكونات الحلويات 🍪' : 'اختر المكونات'}
          </h1>
          <button onClick={onOpenCamera} className="p-2 hover:bg-white/20 rounded-full transition">
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Camera Banner */}
      <div className={`${sweetsMode ? 'bg-gradient-to-l from-pink-500 to-purple-500' : 'bg-gradient-to-l from-blue-500 to-blue-600'} text-white py-3 px-6`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span>{sweetsMode ? 'صور مكونات الحلويات بدل الاختيار' : 'صور ثلاجتك بدل الاختيار اليدوي'}</span>
          </div>
          <button onClick={onOpenCamera} className={`bg-white ${sweetsMode ? 'text-pink-600' : 'text-blue-600'} px-4 py-1 rounded-full font-bold text-sm hover:bg-gray-50 transition`}>
            صور الآن
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={sweetsMode ? 'ابحث عن مكون حلويات...' : 'ابحث عن مكون...'}
            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${accentColor}-400 focus:outline-none text-lg`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-6 pb-32">
          {filteredCategories.map(({ category, ingredients }) => (
            <div key={category} className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient: string) => (
                  <button
                    key={ingredient}
                    onClick={() => toggleIngredient(ingredient)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedIngredients.includes(ingredient)
                        ? selectedButtonGradient
                        : `bg-gray-100 text-gray-700 hover:bg-${accentColor}-100`
                    }`}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {searchQuery && filteredAllIngredients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>لم يتم العثور على "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t-2 border-gray-100 shadow-2xl p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`${sweetsMode ? 'bg-pink-500' : 'bg-orange-500'} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold`}>
                {selectedIngredients.length}
              </span>
              <span className="text-gray-600">مكون مختار</span>
            </div>
            {selectedIngredients.length > 0 && (
              <button onClick={clearAll} className="text-red-500 text-sm font-medium">
                مسح الكل
              </button>
            )}
          </div>
          
          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 max-h-16 overflow-y-auto">
              {selectedIngredients.slice(0, 8).map(ing => (
                <span key={ing} className={`${tagColor} px-2 py-1 rounded text-xs`}>
                  {ing}
                </span>
              ))}
              {selectedIngredients.length > 8 && (
                <span className="text-gray-500 text-xs py-1">+{selectedIngredients.length - 8} أخرى</span>
              )}
            </div>
          )}

          <button
            onClick={() => onFindRecipes(selectedIngredients)}
            disabled={selectedIngredients.length === 0}
            className={`w-full flex items-center justify-center gap-3 ${buttonGradient} text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {sweetsMode ? <Cookie className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
            <span>{sweetsMode ? 'ابحث عن حلويات مغربية 🍪' : 'ابحث عن وصفات مغربية'}</span>
            <span>🇲🇦</span>
          </button>
        </div>
      </div>
    </div>
  );
}
