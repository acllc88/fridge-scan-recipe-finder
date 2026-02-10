import { Camera, Sparkles, UtensilsCrossed, Activity, Heart, Flame, Cookie } from 'lucide-react';
import { useHealth } from '../contexts/HealthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';

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
      {/* Header - Fixed at top */}
      <header className="bg-gradient-to-l from-red-700 via-red-600 to-green-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title - Right side (RTL) */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src="https://i.ibb.co/cSXCG569/aclogostudio-design-1561.png" 
                alt="المطبخ المغربي - شعار التطبيق"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg border-2 border-white/30 flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">المطبخ المغربي</h1>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">اكتشف وصفات من ثلاجتك</p>
              </div>
            </div>
            
            {/* User Menu - Left side (RTL) */}
            <div className="flex-shrink-0">
              <UserMenu onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto text-center w-full">
          {/* Hero Icon */}
          <div className="mb-6 sm:mb-8 relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl sm:text-6xl">🥘</span>
            </div>
            <div className="absolute top-0 right-1/4 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-sm sm:text-lg">🌿</span>
            </div>
            <div className="absolute bottom-0 left-1/4 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-lg sm:text-xl">🍋</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
            صوّر ثلاجتك،
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-600 to-orange-500"> اطبخ مغربي</span>
          </h2>
          
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            صور ما في ثلاجتك أو اختر المكونات يدوياً، وسنقترح عليك أشهى الوصفات المغربية التقليدية
          </p>

          {/* Health Profile Card - ONLY SHOW WHEN LOGGED IN */}
          {user && profile && (
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-emerald-200 mx-auto max-w-md">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="flex-1 text-right min-w-0">
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
                <button onClick={handleHealthClick} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold underline flex-shrink-0">تعديل</button>
              </div>
            </div>
          )}

          {/* Show "Add Health Profile" button - ONLY WHEN LOGGED IN BUT NO PROFILE */}
          {user && !profile && (
            <button onClick={handleHealthClick}
              className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>أضف ملفك الصحي للنصائح المخصصة</span>
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
            {/* Main Row - Scan Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button onClick={onStartScan}
                className="group flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-l from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                <span>صوّر ثلاجتي</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={onManualPick}
                className="flex items-center justify-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-orange-300">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>اختيار يدوي</span>
              </button>
            </div>
            
            {/* Sweets Scan Button */}
            <div className="flex justify-center">
              <button onClick={onSweetsMode}
                className="group flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-l from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>🍪 وصفات الحلويات المغربية 🍬</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm">صوّر وامسح</h3>
              <p className="text-gray-600 text-xs hidden sm:block">التقط صورة لثلاجتك</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm">اكتشاف ذكي</h3>
              <p className="text-gray-600 text-xs hidden sm:block">نتعرف على المكونات تلقائياً</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm">حلويات مغربية</h3>
              <p className="text-gray-600 text-xs hidden sm:block">شباكية، غريبة، كعب غزال...</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm">حساب السعرات</h3>
              <p className="text-gray-600 text-xs hidden sm:block">معرفة السعرات لكل وصفة</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Stats */}
      <footer className="bg-white/50 backdrop-blur border-t border-white/50 py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="flex justify-center gap-4 sm:gap-8 text-center mb-4 sm:mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">+100</div>
              <div className="text-xs text-gray-600">وصفة مغربية</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">+50</div>
              <div className="text-xs text-gray-600">مكون معروف</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">🍪</div>
              <div className="text-xs text-gray-600">حلويات تقليدية</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">🔥</div>
              <div className="text-xs text-gray-600">حساب السعرات</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 sm:gap-6 mb-4">
            <button onClick={() => onNavigate('privacy')} className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 hover:underline transition">
              سياسة الخصوصية
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={() => onNavigate('terms')} className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 hover:underline transition">
              شروط الاستخدام
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              صُنع بكل ❤️ بواسطة <span className="font-bold text-gray-800">يوسف الهندوز</span> 🇲🇦
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2026 المطبخ المغربي 🇲🇦 — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
