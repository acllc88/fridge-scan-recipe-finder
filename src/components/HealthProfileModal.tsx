import { useState, useEffect } from 'react';
import { X, Heart, Activity, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useHealth, HEALTH_CONDITIONS, HealthProfile } from '../contexts/HealthContext';

export default function HealthProfileModal() {
  const { profile, setProfile, showProfileModal, setShowProfileModal, isLoading } = useHealth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = 4;

  // Form state - initialize from profile or defaults
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<HealthProfile['activityLevel']>('moderate');
  const [goal, setGoal] = useState<HealthProfile['goal']>('maintain');

  // Update form when profile loads from Firebase
  useEffect(() => {
    if (profile) {
      console.log('📋 Loading profile into form:', profile);
      setAge(profile.age || 30);
      setGender(profile.gender || 'male');
      setWeight(profile.weight || 70);
      setHeight(profile.height || 170);
      setConditions(profile.conditions || []);
      setAllergies(profile.allergies || []);
      setActivityLevel(profile.activityLevel || 'moderate');
      setGoal(profile.goal || 'maintain');
    }
  }, [profile]);

  // Reset to step 1 when modal opens
  useEffect(() => {
    if (showProfileModal) {
      setStep(1);
    }
  }, [showProfileModal]);

  if (!showProfileModal) return null;

  const toggleCondition = (c: string) => {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleAllergy = (a: string) => {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setProfile({ age, gender, weight, height, conditions, allergies, activityLevel, goal });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const allergyOptions = [
    { id: 'nuts', label: 'المكسرات', icon: '🥜' },
    { id: 'seafood', label: 'المأكولات البحرية', icon: '🦐' },
    { id: 'eggs', label: 'البيض', icon: '🥚' },
    { id: 'milk', label: 'الحليب', icon: '🥛' },
    { id: 'wheat', label: 'القمح', icon: '🌾' },
    { id: 'soy', label: 'الصويا', icon: '🫘' },
    { id: 'honey', label: 'العسل', icon: '🍯' },
    { id: 'spicy', label: 'الحار', icon: '🌶️' },
  ];

  const activityOptions = [
    { id: 'sedentary', label: 'خامل', desc: 'عمل مكتبي، بدون رياضة', icon: '🪑' },
    { id: 'light', label: 'خفيف', desc: 'مشي خفيف 1-3 أيام/أسبوع', icon: '🚶' },
    { id: 'moderate', label: 'معتدل', desc: 'رياضة 3-5 أيام/أسبوع', icon: '🏃' },
    { id: 'active', label: 'نشيط', desc: 'رياضة 6-7 أيام/أسبوع', icon: '🏋️' },
    { id: 'very_active', label: 'نشيط جداً', desc: 'تدريب مكثف يومياً', icon: '⚡' },
  ];

  const goalOptions = [
    { id: 'lose', label: 'إنقاص الوزن', desc: 'تقليل السعرات الحرارية', icon: '📉', color: 'bg-blue-100 border-blue-400 text-blue-800' },
    { id: 'maintain', label: 'الحفاظ على الوزن', desc: 'سعرات متوازنة', icon: '⚖️', color: 'bg-green-100 border-green-400 text-green-800' },
    { id: 'gain', label: 'زيادة الوزن', desc: 'زيادة السعرات والبروتين', icon: '📈', color: 'bg-orange-100 border-orange-400 text-orange-800' },
  ];

  // Show loading state while fetching profile from Firebase
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">جاري تحميل ملفك الصحي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-600 to-teal-700 p-5 text-white relative">
          <button onClick={() => setShowProfileModal(false)} className="absolute top-4 left-4 p-1 hover:bg-white/20 rounded-full transition">
            <X size={22} />
          </button>
          <div className="flex items-center gap-3 justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">ملفك الصحي</h2>
              <p className="text-sm text-white/80">لنصائح غذائية مخصصة لك</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
          <p className="text-center text-xs text-white/70 mt-2">الخطوة {step} من {totalSteps}</p>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 text-center">المعلومات الأساسية</h3>
              
              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الجنس</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setGender('male')} className={`p-4 rounded-xl border-2 text-center transition-all ${gender === 'male' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-3xl block mb-1">👨</span>
                    <span className="font-semibold text-gray-800">ذكر</span>
                  </button>
                  <button onClick={() => setGender('female')} className={`p-4 rounded-xl border-2 text-center transition-all ${gender === 'female' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-3xl block mb-1">👩</span>
                    <span className="font-semibold text-gray-800">أنثى</span>
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">العمر: <span className="text-emerald-600 text-lg">{age}</span> سنة</label>
                <input type="range" min="5" max="100" value={age} onChange={e => setAge(+e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الوزن (كغ)</label>
                  <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} min={20} max={250}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-lg font-bold focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الطول (سم)</label>
                  <input type="number" value={height} onChange={e => setHeight(+e.target.value)} min={100} max={250}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-lg font-bold focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              {/* BMI Display */}
              {weight > 0 && height > 0 && (
                <div className="bg-gradient-to-l from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">مؤشر كتلة الجسم (BMI)</p>
                  <p className={`text-2xl font-bold ${
                    (weight / ((height/100) ** 2)) < 18.5 ? 'text-blue-500' :
                    (weight / ((height/100) ** 2)) < 25 ? 'text-green-500' :
                    (weight / ((height/100) ** 2)) < 30 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {(weight / ((height/100) ** 2)).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(weight / ((height/100) ** 2)) < 18.5 ? 'نقص في الوزن' :
                     (weight / ((height/100) ** 2)) < 25 ? 'وزن طبيعي ✅' :
                     (weight / ((height/100) ** 2)) < 30 ? 'وزن زائد' : 'سمنة'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Health Conditions */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 text-center">الحالات الصحية</h3>
              <p className="text-sm text-gray-500 text-center">اختر الحالات الصحية التي تعاني منها (إن وجدت)</p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(HEALTH_CONDITIONS).map(([key, val]) => (
                  <button key={key} onClick={() => toggleCondition(key)}
                    className={`p-3 rounded-xl border-2 text-right transition-all ${
                      conditions.includes(key) ? 'border-red-400 bg-red-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        conditions.includes(key) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                      }`}>
                        {conditions.includes(key) && <Check size={14} className="text-white" />}
                      </div>
                      <span className="font-semibold text-sm text-gray-800">{val.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Allergies */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-800 mb-3">الحساسيات الغذائية</h4>
                <div className="grid grid-cols-2 gap-3">
                  {allergyOptions.map(a => (
                    <button key={a.id} onClick={() => toggleAllergy(a.id)}
                      className={`p-3 rounded-xl border-2 text-right transition-all ${
                        allergies.includes(a.id) ? 'border-orange-400 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{a.icon}</span>
                        <span className="font-semibold text-sm text-gray-800">{a.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Activity & Goal */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 text-center">النشاط والهدف</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">مستوى النشاط البدني</label>
                <div className="space-y-2">
                  {activityOptions.map(a => (
                    <button key={a.id} onClick={() => setActivityLevel(a.id as HealthProfile['activityLevel'])}
                      className={`w-full p-3 rounded-xl border-2 text-right transition-all flex items-center gap-3 ${
                        activityLevel === a.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{a.label}</p>
                        <p className="text-xs text-gray-500">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">هدفك</label>
                <div className="grid grid-cols-3 gap-3">
                  {goalOptions.map(g => (
                    <button key={g.id} onClick={() => setGoal(g.id as HealthProfile['goal'])}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        goal === g.id ? g.color + ' shadow-md border-2' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <span className="text-2xl block mb-1">{g.icon}</span>
                      <span className="font-semibold text-xs text-gray-800">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 text-center">ملخص ملفك الصحي</h3>
              
              <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">الجنس</span>
                  <span className="font-bold">{gender === 'male' ? '👨 ذكر' : '👩 أنثى'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">العمر</span>
                  <span className="font-bold">{age} سنة</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">الوزن / الطول</span>
                  <span className="font-bold">{weight} كغ / {height} سم</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">مؤشر كتلة الجسم</span>
                  <span className="font-bold">{(weight / ((height/100) ** 2)).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">مستوى النشاط</span>
                  <span className="font-bold">{activityOptions.find(a => a.id === activityLevel)?.icon} {activityOptions.find(a => a.id === activityLevel)?.label}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-gray-600">الهدف</span>
                  <span className="font-bold">{goalOptions.find(g => g.id === goal)?.icon} {goalOptions.find(g => g.id === goal)?.label}</span>
                </div>
              </div>

              {conditions.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="font-bold text-red-800 mb-2">⚠️ الحالات الصحية:</p>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                      <span key={c} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {HEALTH_CONDITIONS[c as keyof typeof HEALTH_CONDITIONS]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Calories Recommendation */}
              <div className="bg-gradient-to-l from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">السعرات اليومية الموصى بها</p>
                <div className="flex items-center justify-center gap-2">
                  <Activity className="text-orange-500" size={24} />
                  <span className="text-3xl font-bold text-orange-600">
                    {(() => {
                      let bmr: number;
                      if (gender === 'male') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                      else bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                      const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
                      let tdee = bmr * (mult[activityLevel] || 1.55);
                      if (goal === 'lose') tdee -= 500;
                      if (goal === 'gain') tdee += 400;
                      if (age < 18) tdee *= 1.1;
                      if (age > 60) tdee *= 0.9;
                      return Math.round(tdee);
                    })()}
                  </span>
                  <span className="text-gray-600">سعرة/يوم</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">~{(() => {
                  let bmr: number;
                  if (gender === 'male') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                  else bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                  const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
                  let tdee = bmr * (mult[activityLevel] || 1.55);
                  if (goal === 'lose') tdee -= 500;
                  if (goal === 'gain') tdee += 400;
                  if (age < 18) tdee *= 1.1;
                  if (age > 60) tdee *= 0.9;
                  return Math.round(tdee / 3);
                })()} سعرة لكل وجبة (3 وجبات)</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition">
              <ChevronRight size={18} />
              السابق
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition">
              التالي
              <ChevronLeft size={18} />
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50">
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check size={18} />
                  حفظ الملف الصحي
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
