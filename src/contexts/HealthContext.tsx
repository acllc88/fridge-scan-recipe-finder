import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface HealthProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  conditions: string[];
  allergies: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

interface HealthContextType {
  profile: HealthProfile | null;
  setProfile: (p: HealthProfile) => void;
  clearProfile: () => void;
  showProfileModal: boolean;
  setShowProfileModal: (v: boolean) => void;
  getDailyCalories: () => number;
  getHealthWarnings: (recipeCalories: number, recipeName: string, ingredients: string[]) => HealthWarning[];
  getHealthScore: (recipeCalories: number, ingredients: string[]) => number;
  getAgeGroup: () => string;
}

export interface HealthWarning {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  title: string;
  message: string;
}

const HealthContext = createContext<HealthContextType | null>(null);

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be inside HealthProvider');
  return ctx;
}

const HEALTH_CONDITIONS = {
  diabetes: {
    label: 'السكري',
    badIngredients: ['سكر', 'عسل', 'تمر', 'زبيب', 'مشمش مجفف', 'برقوق', 'قرفة سكر', 'شباكية', 'حلوى'],
    warnings: ['تجنب الوصفات العالية بالسكر', 'راقب كمية الكربوهيدرات'],
  },
  hypertension: {
    label: 'ضغط الدم المرتفع',
    badIngredients: ['ملح', 'زيتون مملح', 'حامض مصير', 'مخلل', 'صويا'],
    warnings: ['قلل من الملح', 'تجنب الأطعمة المملحة'],
  },
  cholesterol: {
    label: 'الكولسترول',
    badIngredients: ['زبدة', 'سمن', 'لحم دهني', 'جلد الدجاج', 'كريمة', 'جبن'],
    warnings: ['تجنب الدهون المشبعة', 'اختر اللحوم الخالية من الدهون'],
  },
  heart_disease: {
    label: 'أمراض القلب',
    badIngredients: ['ملح', 'زبدة', 'سمن', 'لحم أحمر', 'مقلي', 'زيت كثير'],
    warnings: ['قلل من الدهون المشبعة والملح', 'اختر الأسماك والخضروات'],
  },
  kidney: {
    label: 'أمراض الكلى',
    badIngredients: ['ملح', 'بروتين كثير', 'لحم أحمر', 'طماطم', 'بطاطس', 'موز', 'برتقال'],
    warnings: ['قلل من البروتين والبوتاسيوم', 'راقب كمية السوائل'],
  },
  gout: {
    label: 'النقرس',
    badIngredients: ['لحم أحمر', 'كبد', 'سردين', 'عدس', 'فول', 'حمص', 'فاصوليا'],
    warnings: ['تجنب اللحوم الحمراء والبقوليات', 'أكثر من شرب الماء'],
  },
  celiac: {
    label: 'حساسية الغلوتين',
    badIngredients: ['دقيق', 'خبز', 'كسكس', 'شعرية', 'معجنات', 'بسطيلة', 'ورقة بسطيلة', 'بغرير', 'مسمن', 'حرشة', 'فريك'],
    warnings: ['تجنب جميع منتجات القمح', 'استبدل بالأرز أو دقيق الذرة'],
  },
  lactose: {
    label: 'حساسية اللاكتوز',
    badIngredients: ['حليب', 'لبن', 'جبن', 'زبدة', 'كريمة', 'ياغورت'],
    warnings: ['تجنب منتجات الألبان', 'استبدل بحليب نباتي'],
  },
  obesity: {
    label: 'السمنة',
    badIngredients: ['سكر', 'زبدة', 'سمن', 'مقلي', 'عسل', 'لوز محمص'],
    warnings: ['اختر وصفات أقل من 400 سعرة', 'تجنب المقليات والحلويات'],
  },
  anemia: {
    label: 'فقر الدم',
    badIngredients: [],
    warnings: ['تناول الأطعمة الغنية بالحديد', 'اللحوم الحمراء والسبانخ مفيدة لك'],
  },
};

export { HEALTH_CONDITIONS };

export function HealthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<HealthProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user } = useAuth();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('healthProfile');
    if (saved) {
      try { setProfileState(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Sync with Firebase when logged in
  useEffect(() => {
    if (!user) return;
    const loadFromFirebase = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().healthProfile) {
          const fbProfile = snap.data().healthProfile;
          setProfileState(fbProfile);
          localStorage.setItem('healthProfile', JSON.stringify(fbProfile));
        }
      } catch {}
    };
    loadFromFirebase();
  }, [user]);

  const setProfile = async (p: HealthProfile) => {
    setProfileState(p);
    localStorage.setItem('healthProfile', JSON.stringify(p));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { healthProfile: p }, { merge: true });
      } catch {}
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('healthProfile');
  };

  const getDailyCalories = (): number => {
    if (!profile) return 2000;
    const { age, gender, weight, height, activityLevel, goal } = profile;
    
    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 400;

    // Age adjustments
    if (age < 18) tdee *= 1.1; // Growing teens need more
    if (age > 60) tdee *= 0.9; // Seniors need less

    return Math.round(tdee);
  };

  const getAgeGroup = (): string => {
    if (!profile) return '';
    const { age } = profile;
    if (age < 12) return 'طفل';
    if (age < 18) return 'مراهق';
    if (age < 30) return 'شاب';
    if (age < 50) return 'بالغ';
    if (age < 65) return 'كبير';
    return 'مسن';
  };

  const getHealthWarnings = (recipeCalories: number, _recipeName: string, ingredients: string[]): HealthWarning[] => {
    if (!profile) return [];
    const warnings: HealthWarning[] = [];
    const dailyCals = getDailyCalories();
    const mealCals = dailyCals / 3;

    // Calorie warnings based on age
    if (recipeCalories > mealCals * 1.5) {
      warnings.push({
        type: 'warning',
        icon: '⚠️',
        title: 'سعرات عالية',
        message: `هذه الوصفة تحتوي على ${recipeCalories} سعرة وهي أكثر من ${Math.round(mealCals)} سعرة الموصى بها لوجبة واحدة لشخص بعمر ${profile.age} سنة`,
      });
    } else if (recipeCalories <= mealCals) {
      warnings.push({
        type: 'success',
        icon: '✅',
        title: 'سعرات مناسبة',
        message: `هذه الوصفة مناسبة لاحتياجاتك اليومية (${dailyCals} سعرة/يوم، ~${Math.round(mealCals)} لكل وجبة)`,
      });
    }

    // Age-specific warnings
    if (profile.age < 12) {
      warnings.push({
        type: 'info',
        icon: '👶',
        title: 'نصيحة للأطفال',
        message: 'قلل حجم الحصة للنصف. تجنب التوابل الحارة والفلفل. أضف المزيد من الخضروات.',
      });
    } else if (profile.age < 18) {
      warnings.push({
        type: 'info',
        icon: '🧑',
        title: 'نصيحة للمراهقين',
        message: 'جسمك في مرحلة نمو ويحتاج بروتين وكالسيوم إضافي. أضف الحليب أو اللبن كمشروب جانبي.',
      });
    } else if (profile.age > 60) {
      warnings.push({
        type: 'info',
        icon: '👴',
        title: 'نصيحة لكبار السن',
        message: 'اطبخ الطعام لفترة أطول ليصبح أسهل في الهضم. قلل الملح والدهون. أضف المزيد من الخضروات المسلوقة.',
      });
    }

    // Health condition warnings
    const ingredientStr = ingredients.join(' ').toLowerCase();
    
    for (const condKey of profile.conditions) {
      const cond = HEALTH_CONDITIONS[condKey as keyof typeof HEALTH_CONDITIONS];
      if (!cond) continue;

      const foundBad = cond.badIngredients.filter(bi => ingredientStr.includes(bi));
      
      if (foundBad.length > 0) {
        warnings.push({
          type: 'danger',
          icon: '🚫',
          title: `تحذير - ${cond.label}`,
          message: `تحتوي على مكونات غير مناسبة: ${foundBad.join('، ')}. ${cond.warnings[0]}`,
        });
      } else {
        warnings.push({
          type: 'success',
          icon: '💚',
          title: `مناسبة - ${cond.label}`,
          message: `هذه الوصفة لا تحتوي على مكونات ضارة لحالتك الصحية`,
        });
      }
    }

    // Goal-based warnings
    if (profile.goal === 'lose' && recipeCalories > 400) {
      warnings.push({
        type: 'warning',
        icon: '🏋️',
        title: 'هدف إنقاص الوزن',
        message: `لإنقاص الوزن، حاول اختيار وصفات أقل من 400 سعرة. يمكنك تقليل الحصة أو إزالة الزيت/الزبدة.`,
      });
    }

    if (profile.goal === 'gain' && recipeCalories < 300) {
      warnings.push({
        type: 'info',
        icon: '💪',
        title: 'هدف زيادة الوزن',
        message: `لزيادة الوزن، أضف المزيد من البروتين والكربوهيدرات. يمكنك إضافة أرز أو خبز كطبق جانبي.`,
      });
    }

    return warnings;
  };

  const getHealthScore = (recipeCalories: number, ingredients: string[]): number => {
    if (!profile) return 100;
    let score = 100;
    const dailyCals = getDailyCalories();
    const mealCals = dailyCals / 3;
    const ingredientStr = ingredients.join(' ').toLowerCase();

    // Calorie score
    if (recipeCalories > mealCals * 2) score -= 30;
    else if (recipeCalories > mealCals * 1.5) score -= 15;

    // Health condition score
    for (const condKey of profile.conditions) {
      const cond = HEALTH_CONDITIONS[condKey as keyof typeof HEALTH_CONDITIONS];
      if (!cond) continue;
      const foundBad = cond.badIngredients.filter(bi => ingredientStr.includes(bi));
      score -= foundBad.length * 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  return (
    <HealthContext.Provider value={{
      profile,
      setProfile,
      clearProfile,
      showProfileModal,
      setShowProfileModal,
      getDailyCalories,
      getHealthWarnings,
      getHealthScore,
      getAgeGroup,
    }}>
      {children}
    </HealthContext.Provider>
  );
}
