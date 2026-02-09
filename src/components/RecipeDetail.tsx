import { Clock, Users, ArrowRight, Check, X, ShoppingCart, Plus, Heart, Flame, Activity, AlertTriangle, Shield } from 'lucide-react';
import { Recipe } from '../data/recipes';
import { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { useHealth } from '../contexts/HealthContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';

interface RecipeDetailProps {
  recipe: Recipe;
  selectedIngredients: string[];
  onBack: () => void;
}

export function RecipeDetail({ recipe, selectedIngredients, onBack }: RecipeDetailProps) {
  const { userData, addToShoppingList, toggleFavorite, isFavorite } = useUserData();
  const { profile, getDailyCalories, getHealthWarnings, getHealthScore, setShowProfileModal } = useHealth();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const hasIngredient = (ingredient: string) => {
    return selectedIngredients.some(selected =>
      selected.toLowerCase().includes(ingredient.toLowerCase()) ||
      ingredient.toLowerCase().includes(selected.toLowerCase())
    );
  };

  const isInShoppingList = (ingredient: string) => userData.shoppingList.includes(ingredient);
  const missingIngredients = recipe.ingredients.filter(ing => !hasIngredient(ing));
  const newMissingIngredients = missingIngredients.filter(ing => !isInShoppingList(ing));
  const availableCount = recipe.ingredients.filter(hasIngredient).length;
  const matchPercentage = Math.round((availableCount / recipe.ingredients.length) * 100);
  const isFav = isFavorite(recipe.id);
  const dailyCals = getDailyCalories();
  const mealCals = Math.round(dailyCals / 3);
  const healthWarnings = getHealthWarnings(recipe.calories, recipe.name, recipe.ingredients);
  const healthScore = getHealthScore(recipe.calories, recipe.ingredients);

  const handleAddAllMissing = () => {
    if (!user) { openAuthModal(); return; }
    if (newMissingIngredients.length > 0) {
      addToShoppingList(newMissingIngredients);
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);
    }
  };

  const handleAddSingle = (ingredient: string) => {
    if (!user) { openAuthModal(); return; }
    if (!isInShoppingList(ingredient)) addToShoppingList([ingredient]);
  };

  const handleToggleFavorite = () => {
    if (!user) { openAuthModal(); return; }
    toggleFavorite(recipe.id);
  };

  const getCalorieLabel = () => {
    if (recipe.calories < 250) return { label: 'خفيف', color: 'text-green-600', barColor: 'bg-green-500' };
    if (recipe.calories < 400) return { label: 'معتدل', color: 'text-yellow-600', barColor: 'bg-yellow-500' };
    if (recipe.calories < 600) return { label: 'متوسط', color: 'text-orange-600', barColor: 'bg-orange-500' };
    return { label: 'غني', color: 'text-red-600', barColor: 'bg-red-500' };
  };
  const calorieInfo = getCalorieLabel();

  const getAgeExplanation = () => {
    if (!profile) return '';
    const pct = Math.round((recipe.calories / dailyCals) * 100);
    if (profile.age < 12) return `الأطفال بعمر ${profile.age} سنوات يحتاجون حوالي ${dailyCals} سعرة يومياً للنمو السليم. هذه الوصفة تمثل ${pct}% من احتياجاتك اليومية. الأطفال يحتاجون بروتين وكالسيوم أكثر لبناء العظام والعضلات.`;
    if (profile.age < 18) return `في سن المراهقة (${profile.age} سنة)، جسمك ينمو بسرعة ويحتاج حوالي ${dailyCals} سعرة يومياً. هذه الوصفة تمثل ${pct}%. ركز على البروتين والحديد والكالسيوم.`;
    if (profile.age < 30) return `في عمر ${profile.age} سنة، جسمك يحتاج حوالي ${dailyCals} سعرة يومياً. هذه الوصفة تمثل ${pct}%. في هذا العمر الأيض نشيط ويمكنك الاستمتاع بالطعام مع الحفاظ على النشاط البدني.`;
    if (profile.age < 50) return `في عمر ${profile.age} سنة، يبدأ الأيض بالتباطؤ تدريجياً. تحتاج حوالي ${dailyCals} سعرة يومياً. هذه الوصفة تمثل ${pct}%. انتبه لكمية الدهون والسكر.`;
    if (profile.age < 65) return `في عمر ${profile.age} سنة، الجسم يحتاج سعرات أقل (حوالي ${dailyCals}/يوم) لكن تغذية أفضل. هذه الوصفة تمثل ${pct}%. ركز على الألياف والكالسيوم وفيتامين د.`;
    return `في عمر ${profile.age} سنة، الجسم يحتاج حوالي ${dailyCals} سعرة يومياً. هذه الوصفة تمثل ${pct}%. اطبخ الطعام جيداً وقلل من الملح والدهون. الخضروات المسلوقة والشوربات مثالية.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header Image */}
      <div className="relative h-72 md:h-96">
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <button onClick={onBack} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition shadow-lg z-10">
          <ArrowRight className="w-6 h-6" />
        </button>

        <button onClick={handleToggleFavorite}
          className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl transition-all transform hover:scale-105 ${isFav ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-white/90 backdrop-blur-md text-gray-600 hover:text-red-500'}`}>
          <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
          <span className="font-bold text-sm">{isFav ? 'في المفضلة ❤️' : 'أضف للمفضلة'}</span>
        </button>

        <div className="absolute bottom-6 right-6 left-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm">{recipe.difficulty}</span>
            <span className="bg-gradient-to-l from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">{matchPercentage}% متوفر</span>
            <span className="bg-orange-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Flame className="w-4 h-4" />{recipe.calories} سعرة
            </span>
            {profile && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${healthScore >= 80 ? 'bg-green-500/90 text-white' : healthScore >= 50 ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                <Shield className="w-4 h-4" />{healthScore}% صحي
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{recipe.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Quick Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 grid grid-cols-4 gap-2">
          <div className="text-center">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">وقت الطهي</p>
            <p className="font-bold text-gray-800 text-sm">{recipe.cookTime}</p>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">الأشخاص</p>
            <p className="font-bold text-gray-800 text-sm">{recipe.servings}</p>
          </div>
          <div className="text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">السعرات</p>
            <p className="font-bold text-orange-600 text-sm">{recipe.calories}</p>
          </div>
          <div className="text-center">
            <span className="text-xl">🇲🇦</span>
            <p className="text-gray-500 text-xs">المطبخ</p>
            <p className="font-bold text-gray-800 text-sm">مغربي</p>
          </div>
        </div>

        {/* HEALTH ASSESSMENT */}
        {profile ? (
          <div className={`rounded-2xl shadow-lg p-5 mb-6 border-2 ${healthScore >= 80 ? 'bg-green-50 border-green-200' : healthScore >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4 ${healthScore >= 80 ? 'bg-green-100 border-green-300 text-green-700' : healthScore >= 50 ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-red-100 border-red-300 text-red-700'}`}>
                {healthScore}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">التقييم الصحي لهذه الوصفة</h2>
                <p className={`text-sm font-semibold ${healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {healthScore >= 80 ? 'مناسبة لصحتك ✅' : healthScore >= 50 ? 'مقبولة بحذر ⚠️' : 'غير مناسبة لصحتك ❌'}
                </p>
              </div>
            </div>

            <div className="bg-white/60 rounded-xl p-3 mb-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white px-3 py-1 rounded-full font-medium">👤 {profile.age} سنة</span>
              <span className="bg-white px-3 py-1 rounded-full font-medium">{profile.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}</span>
              <span className="bg-white px-3 py-1 rounded-full font-medium">⚖️ {profile.weight} كغ</span>
              <span className="bg-white px-3 py-1 rounded-full font-medium">🔥 {dailyCals} سعرة/يوم</span>
              <span className="bg-white px-3 py-1 rounded-full font-medium">🍽️ ~{mealCals} سعرة/وجبة</span>
            </div>

            <div className="space-y-3">
              {healthWarnings.map((w, i) => (
                <div key={i} className={`rounded-xl p-4 flex items-start gap-3 ${w.type === 'danger' ? 'bg-red-100 border border-red-200' : w.type === 'warning' ? 'bg-amber-100 border border-amber-200' : w.type === 'success' ? 'bg-green-100 border border-green-200' : 'bg-blue-100 border border-blue-200'}`}>
                  <span className="text-2xl flex-shrink-0">{w.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{w.title}</p>
                    <p className="text-sm mt-1 leading-relaxed">{w.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-white/70 rounded-xl p-4">
              <p className="text-sm font-bold mb-2">📊 مقارنة السعرات باحتياجاتك</p>
              <div className="flex justify-between text-xs mb-1">
                <span>هذه الوصفة: {recipe.calories} سعرة</span>
                <span>المطلوب للوجبة: {mealCals} سعرة</span>
              </div>
              <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden relative">
                <div className={`h-full rounded-full ${recipe.calories <= mealCals ? 'bg-green-500' : recipe.calories <= mealCals * 1.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((recipe.calories / (mealCals * 2)) * 100, 100)}%` }} />
                <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-gray-600" style={{ left: '50%' }} />
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">
                {recipe.calories <= mealCals ? `✅ أقل من الحد الموصى به بـ ${mealCals - recipe.calories} سعرة` : `⚠️ أكثر من الحد الموصى به بـ ${recipe.calories - mealCals} سعرة`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-l from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 shadow-lg text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">هل هذه الوصفة مناسبة لصحتك؟</h3>
                <p className="text-sm text-white/80 mt-1">أضف معلوماتك الصحية لنعطيك نصائح مخصصة حسب عمرك وحالتك</p>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="mt-4 w-full bg-white text-emerald-700 py-3 rounded-xl font-bold hover:bg-emerald-50 transition flex items-center justify-center gap-2">
              <Activity className="w-5 h-5" />
              أضف ملفك الصحي الآن
            </button>
          </div>
        )}

        {/* NUTRITION SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border-2 border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            القيمة الغذائية التقديرية
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border border-orange-100">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600">{recipe.calories}</p>
              <p className="text-sm text-gray-500">سعرة / للشخص</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{recipe.calories * recipe.servings}</p>
              <p className="text-sm text-gray-500">سعرة / الوصفة كاملة</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">مستوى السعرات</span>
              <span className={`text-sm font-bold ${calorieInfo.color} px-3 py-1 rounded-full bg-white`}>{calorieInfo.label}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${calorieInfo.barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.min((recipe.calories / 800) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0</span><span>200</span><span>400</span><span>600</span><span>800+</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center bg-red-50 rounded-lg p-3">
              <p className="text-lg font-bold text-red-600">{Math.round(recipe.calories * 0.3 / 4)}g</p>
              <p className="text-xs text-gray-500">بروتين</p>
            </div>
            <div className="text-center bg-yellow-50 rounded-lg p-3">
              <p className="text-lg font-bold text-yellow-600">{Math.round(recipe.calories * 0.45 / 4)}g</p>
              <p className="text-xs text-gray-500">كربوهيدرات</p>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-3">
              <p className="text-lg font-bold text-purple-600">{Math.round(recipe.calories * 0.25 / 9)}g</p>
              <p className="text-xs text-gray-500">دهون</p>
            </div>
          </div>
          {profile && (
            <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                لماذا هذه السعرات مهمة لعمرك؟
              </p>
              <p className="text-sm text-emerald-700 mt-2 leading-relaxed">{getAgeExplanation()}</p>
            </div>
          )}
        </div>

        {/* Shopping List */}
        {missingIngredients.length > 0 && (
          <div className="bg-gradient-to-l from-blue-500 to-indigo-500 rounded-2xl p-4 mb-6 shadow-lg text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                <div>
                  <p className="font-bold">ينقصك {missingIngredients.length} مكون</p>
                  <p className="text-sm text-blue-100">{newMissingIngredients.length > 0 ? `${newMissingIngredients.length} غير موجود في قائمة التسوق` : 'كلها موجودة في قائمة التسوق ✓'}</p>
                </div>
              </div>
              {newMissingIngredients.length > 0 && (
                <button onClick={handleAddAllMissing} className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-50 transition flex items-center gap-2">
                  <Plus className="w-5 h-5" />أضف الكل
                </button>
              )}
            </div>
            {showAddedMessage && (
              <div className="mt-3 bg-green-500 text-white px-4 py-2 rounded-xl text-center animate-pulse">✓ تمت الإضافة إلى قائمة التسوق!</div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">عن الوصفة</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{recipe.description}</p>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">المكونات</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{availableCount}/{recipe.ingredients.length} متوفر</span>
          </div>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              const available = hasIngredient(ingredient);
              const inCart = isInShoppingList(ingredient);
              return (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${available ? 'bg-green-50 border border-green-100' : inCart ? 'bg-blue-50 border border-blue-100' : 'bg-red-50 border border-red-100'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${available ? 'bg-green-500' : inCart ? 'bg-blue-500' : 'bg-red-400'}`}>
                    {available ? <Check className="w-4 h-4 text-white" /> : inCart ? <ShoppingCart className="w-3.5 h-3.5 text-white" /> : <X className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`font-medium flex-1 ${available ? 'text-green-800' : inCart ? 'text-blue-800' : 'text-red-800'}`}>{ingredient}</span>
                  {!available && !inCart && (
                    <button onClick={() => handleAddSingle(ingredient)} className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-blue-600 transition flex items-center gap-1 font-medium">
                      <Plus className="w-3 h-3" />أضف للتسوق
                    </button>
                  )}
                  {!available && inCart && (
                    <span className="text-blue-500 text-xs flex items-center gap-1"><ShoppingCart className="w-3 h-3" />في قائمة التسوق</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">👨‍🍳</span>
            طريقة التحضير
          </h2>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4 group">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition ring-4 ring-emerald-50">{index + 1}</div>
                  {index !== recipe.instructions.length - 1 && <div className="w-0.5 flex-grow bg-emerald-100 my-2" />}
                </div>
                <div className="flex-grow pb-2">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 group-hover:border-emerald-200 group-hover:bg-emerald-50/30 transition">
                    <p className="text-gray-800 leading-8">{instruction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100 shadow-lg">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              أسرار نجاح الوصفة
            </h2>
            <div className="space-y-3">
              {recipe.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/80 p-4 rounded-xl border border-amber-100">
                  <span className="mt-1.5 w-2 h-2 bg-amber-500 rounded-full ring-4 ring-amber-100 flex-shrink-0" />
                  <p className="text-gray-800 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onBack} className="w-full bg-gradient-to-l from-red-600 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mb-8">
          العودة للوصفات
        </button>
      </div>
    </div>
  );
}
