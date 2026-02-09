import { Camera, Sparkles, UtensilsCrossed, Activity, Heart, Flame, Cookie } from 'lucide-react';
import { useHealth } from '../contexts/HealthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';

interface HeroProps {
  onStartScan: () => void;
  onManualPick: () => void;
  onSweetsMode: () => void;
  onNavigate: (view: 'favorites' | 'shopping' | 'privacy' | 'terms') => void;
}

export function Hero({ onStartScan, onManualPick, onSweetsMode, onNavigate }: HeroProps) {
  const { profile, setShowProfileModal, getDailyCalories } = useHealth();
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  const handleHealthClick = () => {
    if (!user) { openAuthModal(); return; }
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-l from-red-700 via-red-600 to-green-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/cSXCG569/aclogostudio-design-1561.png" 
              alt="المطبخ المغربي - شعار التطبيق"
              className="w-14 h-14 rounded-full shadow-lg border-2 border-white/30"
            />
            <div>
              <h1 className="text-2xl font-bold">المطبخ المغربي</h1>
              <p className="text-sm text-white/80">اكتشف وصفات من ثلاجتك</p>
            </div>
          </div>
          <div className="w-8 h-8"></div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-6xl">🥘</span>
            </div>
            <div className="absolute top-0 right-1/4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-lg">🌿</span>
            </div>
            <div className="absolute bottom-0 left-1/4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xl">🍋</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            صوّر ثلاجتك،
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-600 to-orange-500"> اطبخ مغربي</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            صور ما في ثلاجتك أو اختر المكونات يدوياً، وسنقترح عليك أشهى الوصفات المغربية التقليدية
          </p>

          {/* Health Profile Card */}
          {profile ? (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-emerald-200 mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-800 text-sm">ملفك الصحي نشط ✅</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{profile.age} سنة</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{profile.weight} كغ</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />{getDailyCalories()} سعرة/يوم
                    </span>
                    {profile.conditions.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{profile.conditions.length} حالة صحية</span>
                    )}
                  </div>
                </div>
                <button onClick={handleHealthClick} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold underline">تعديل</button>
              </div>
            </div>
          ) : (
            <button onClick={handleHealthClick}
              className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-6 flex items-center gap-3 mx-auto">
              <Activity className="w-5 h-5" />
              <span>أضف ملفك الصحي للنصائح المخصصة</span>
              <Heart className="w-5 h-5" />
            </button>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 justify-center mb-8">
            {/* Main Row - Scan Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onStartScan}
                className="group flex items-center justify-center gap-3 bg-gradient-to-l from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Camera className="w-6 h-6 group-hover:animate-pulse" />
                <span>صوّر ثلاجتي</span>
                <Sparkles className="w-5 h-5" />
              </button>
              <button onClick={onManualPick}
                className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-orange-300">
                <UtensilsCrossed className="w-6 h-6" />
                <span>اختيار يدوي</span>
              </button>
            </div>
            
            {/* Sweets Scan Button */}
            <div className="flex justify-center">
              <button onClick={onSweetsMode}
                className="group flex items-center justify-center gap-3 bg-gradient-to-l from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Cookie className="w-6 h-6" />
                <span>🍪 وصفات الحلويات المغربية 🍬</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm">صوّر وامسح</h3>
              <p className="text-gray-600 text-xs">التقط صورة لثلاجتك</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm">اكتشاف ذكي</h3>
              <p className="text-gray-600 text-xs">نتعرف على المكونات تلقائياً</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Cookie className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm">حلويات مغربية</h3>
              <p className="text-gray-600 text-xs">شباكية، غريبة، كعب غزال...</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm">حساب السعرات</h3>
              <p className="text-gray-600 text-xs">معرفة السعرات لكل وصفة</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Stats */}
      <footer className="bg-white/50 backdrop-blur border-t border-white/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="flex justify-center gap-8 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-orange-600">+100</div>
              <div className="text-xs text-gray-600">وصفة مغربية</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+50</div>
              <div className="text-xs text-gray-600">مكون معروف</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">🍪</div>
              <div className="text-xs text-gray-600">حلويات تقليدية</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">🔥</div>
              <div className="text-xs text-gray-600">حساب السعرات</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-6 mb-4">
            <button onClick={() => onNavigate('privacy')} className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition">
              سياسة الخصوصية
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={() => onNavigate('terms')} className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition">
              شروط الاستخدام
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">
              صُنع بكل ❤️ بواسطة <span className="font-bold text-gray-800">يوسف الهندوز</span> 🇲🇦
            </p>
            <p className="text-sm text-gray-500">
              © 2026 المطبخ المغربي 🇲🇦 — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
