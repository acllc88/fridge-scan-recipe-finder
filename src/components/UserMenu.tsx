import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, ShoppingCart, ChevronDown, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useHealth } from '../contexts/HealthContext';
import { useAuthModal } from '../contexts/AuthModalContext';

interface UserMenuProps {
  onNavigate: (view: 'favorites' | 'shopping' | 'privacy' | 'terms') => void;
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { user, logout } = useAuth();
  const { userData } = useUserData();
  const { profile, setShowProfileModal } = useHealth();
  const { openAuthModal } = useAuthModal();
  const shoppingList = userData.shoppingList;
  const favorites = userData.favoriteRecipes;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // NOT LOGGED IN - Simple login button
  if (!user) {
    return (
      <button onClick={openAuthModal}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-xl transition font-bold text-sm border border-white/30">
        <User size={16} />
        <span className="hidden sm:inline">تسجيل الدخول</span>
        <span className="sm:hidden">دخول</span>
      </button>
    );
  }

  // LOGGED IN - Full menu
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-xl transition font-bold text-sm border border-white/30">
        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block max-w-[100px] truncate text-white">{user.email?.split('@')[0]}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
        {(shoppingList.length > 0 || favorites.length > 0) && (
          <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {shoppingList.length + favorites.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* User Info Header */}
          <div className="p-3 bg-gradient-to-l from-emerald-50 to-teal-50 border-b">
            <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
            {profile && (
              <p className="text-xs text-emerald-600 mt-1">
                🩺 {profile.age} سنة • {profile.gender === 'male' ? 'ذكر' : 'أنثى'} • {profile.weight} كغ
              </p>
            )}
          </div>
          
          {/* Health Profile */}
          <button onClick={() => { setShowProfileModal(true); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition text-right border-b">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-800">ملفي الصحي</p>
              <p className="text-xs text-gray-500 truncate">{profile ? `${profile.conditions.length} حالة صحية` : 'إعداد الملف الصحي'}</p>
            </div>
            {profile && <span className="text-emerald-500 text-sm font-bold flex-shrink-0">✅</span>}
          </button>

          {/* Favorites */}
          <button onClick={() => { onNavigate('favorites'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-right border-b">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-800">وصفاتي المفضلة</p>
              <p className="text-xs text-gray-500">{favorites.length} وصفة</p>
            </div>
            {favorites.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">{favorites.length}</span>
            )}
          </button>

          {/* Shopping List */}
          <button onClick={() => { onNavigate('shopping'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition text-right border-b">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-800">قائمة التسوق</p>
              <p className="text-xs text-gray-500">{shoppingList.length} عنصر</p>
            </div>
            {shoppingList.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">{shoppingList.length}</span>
            )}
          </button>

          {/* Logout */}
          <button onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-right">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogOut size={18} className="text-gray-500" />
            </div>
            <span className="font-bold text-sm text-gray-600">تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
