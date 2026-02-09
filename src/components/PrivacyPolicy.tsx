import { ArrowRight, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-gradient-to-l from-red-700 via-red-600 to-green-700 text-white py-4 px-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold">سياسة الخصوصية</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">سياسة الخصوصية</h2>
            <p className="text-gray-500 mt-2">آخر تحديث: 2024</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📋 مقدمة</h3>
            <p className="text-gray-600 leading-relaxed">
              نحن في تطبيق "المطبخ المغربي" نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام تطبيقنا.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📊 البيانات التي نجمعها</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> البريد الإلكتروني عند إنشاء حساب</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> الملف الصحي (العمر، الوزن، الطول، الحالات الصحية) - اختياري</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> قائمة الوصفات المفضلة</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> قائمة التسوق</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> الصور الملتقطة للثلاجة (تبقى على جهازك فقط)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">🔒 كيف نحمي بياناتك</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> نستخدم Firebase من Google لتخزين البيانات بشكل آمن</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> بياناتك مشفرة أثناء النقل والتخزين</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> لا يمكن لأي مستخدم آخر الوصول لبياناتك</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> الصور لا تُرسل لأي خادم خارجي</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">🤝 مشاركة البيانات</h3>
            <p className="text-gray-600 leading-relaxed">
              لا نشارك بياناتك الشخصية مع أي طرف ثالث. بياناتك تُستخدم حصرياً لتحسين تجربتك في التطبيق وتقديم نصائح غذائية مخصصة لك.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">🗑️ حذف البيانات</h3>
            <p className="text-gray-600 leading-relaxed">
              يمكنك حذف حسابك وجميع بياناتك في أي وقت عبر التواصل معنا. سيتم حذف جميع بياناتك نهائياً من خوادمنا خلال 30 يوماً.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📧 تواصل معنا</h3>
            <p className="text-gray-600 leading-relaxed">
              لأي استفسارات حول الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
