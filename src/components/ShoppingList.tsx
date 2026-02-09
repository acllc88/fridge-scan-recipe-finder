import { ArrowRight, Trash2, ShoppingCart, Check, Share2, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';

interface ShoppingListProps {
  onBack: () => void;
}

export function ShoppingList({ onBack }: ShoppingListProps) {
  const { userData, removeFromShoppingList, clearShoppingList } = useUserData();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const items = userData.shoppingList;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleShare = async () => {
    const text = `🛒 قائمة التسوق للوصفات المغربية:\n\n${items.map(item => `• ${item}`).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'قائمة التسوق', text });
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('تم نسخ القائمة!');
    }
  };

  const uncheckedItems = items.filter(item => !checkedItems.includes(item));
  const checkedItemsList = items.filter(item => checkedItems.includes(item));

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-l from-amber-600 to-orange-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            قائمة التسوق
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Not Logged In */}
        {!user ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <LogIn className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">سجل دخولك أولاً</h2>
            <p className="text-gray-500 mb-6">تحتاج لتسجيل الدخول لحفظ وعرض قائمة التسوق</p>
            <button onClick={openAuthModal}
              className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg flex items-center gap-2 mx-auto">
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">القائمة فارغة</h2>
            <p className="text-gray-500 mb-6">أضف المكونات الناقصة من الوصفات إلى قائمة التسوق</p>
            <button onClick={onBack}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
              تصفح الوصفات
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              <button onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
                مشاركة القائمة
              </button>
              <button onClick={clearShoppingList}
                className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-200 transition-colors">
                <Trash2 className="w-5 h-5" />
                مسح الكل
              </button>
            </div>

            <div className="bg-gradient-to-l from-amber-100 to-orange-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">إجمالي المكونات</p>
                  <p className="text-2xl font-bold text-amber-800">{items.length} مكون</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-green-700">تم شراؤها</p>
                  <p className="text-2xl font-bold text-green-600">{checkedItems.length}</p>
                </div>
              </div>
              {checkedItems.length > 0 && (
                <div className="mt-3 bg-white/50 rounded-xl p-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${(checkedItems.length / items.length) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {Math.round((checkedItems.length / items.length) * 100)}% مكتمل
                  </p>
                </div>
              )}
            </div>

            {uncheckedItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  للشراء ({uncheckedItems.length})
                </h3>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {uncheckedItems.map((item, index) => (
                    <div key={item} className={`flex items-center gap-3 p-4 ${index !== uncheckedItems.length - 1 ? 'border-b' : ''}`}>
                      <button onClick={() => toggleItem(item)}
                        className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center hover:bg-amber-50 transition-colors">
                      </button>
                      <span className="flex-1 text-lg">{item}</span>
                      <button onClick={() => removeFromShoppingList(item)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {checkedItemsList.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  تم شراؤها ({checkedItemsList.length})
                </h3>
                <div className="bg-green-50 rounded-2xl overflow-hidden">
                  {checkedItemsList.map((item, index) => (
                    <div key={item} className={`flex items-center gap-3 p-4 ${index !== checkedItemsList.length - 1 ? 'border-b border-green-100' : ''}`}>
                      <button onClick={() => toggleItem(item)}
                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-lg text-gray-500 line-through">{item}</span>
                      <button onClick={() => removeFromShoppingList(item)}
                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-white rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-800 text-sm">
                💡 نصيحة: اضغط على الدائرة بجانب كل مكون لتحديده كـ "تم شراؤه"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
