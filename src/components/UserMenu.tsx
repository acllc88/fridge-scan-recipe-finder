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

  if (!user) {
    return (
      <div className="flex gap-2">
        <button onClick={openAuthModal}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2.5 rounded-xl shadow-lg hover:bg-white transition font-bold text-sm">
          <User size={16} />
          تسجيل الدخول
        </button>
        <button onClick={() => {
          if (!user) { openAuthModal(); return; }
          setShowProfileModal(true);
        }}
          className="flex items-center gap-2 bg-emerald-500/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl shadow-lg hover:bg-emerald-600 transition font-bold text-sm">
          <Activity size={16} />
          {profile ? '🩺' : 'صحتي'}
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2.5 rounded-xl shadow-lg hover:bg-white transition font-bold text-sm">
        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{user.email}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
        {(shoppingList.length > 0 || favorites.length > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {shoppingList.length + favorites.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-sm font-bold text-gray-800">{user.email}</p>
            {profile && (
              <p className="text-xs text-emerald-600 mt-1">
                🩺 {profile.age} سنة • {profile.gender === 'male' ? 'ذكر' : 'أنثى'} • {profile.weight} كغ
              </p>
            )}
          </div>
          
          <button onClick={() => { setShowProfileModal(true); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition text-right border-b">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">ملفي الصحي</p>
              <p className="text-xs text-gray-500">{profile ? `${profile.conditions.length} حالة صحية` : 'إعداد الملف الصحي'}</p>
            </div>
            {profile && <span className="text-emerald-500 text-xs font-bold">✅</span>}
          </button>

          <button onClick={() => { onNavigate('favorites'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-right border-b">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">وصفاتي المفضلة</p>
              <p className="text-xs text-gray-500">{favorites.length} وصفة</p>
            </div>
            {favorites.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{favorites.length}</span>
            )}
          </button>

          <button onClick={() => { onNavigate('shopping'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition text-right border-b">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">قائمة التسوق</p>
              <p className="text-xs text-gray-500">{shoppingList.length} عنصر</p>
            </div>
            {shoppingList.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{shoppingList.length}</span>
            )}
          </button>

          <button onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-right">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <LogOut size={18} className="text-gray-500" />
            </div>
            <span className="font-bold text-sm text-gray-600">تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
