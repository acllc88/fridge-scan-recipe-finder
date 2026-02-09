import { ArrowRight, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-gradient-to-l from-red-700 via-red-600 to-green-700 text-white py-4 px-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h1 className="text-xl font-bold">شروط الاستخدام</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">شروط الاستخدام</h2>
            <p className="text-gray-500 mt-2">آخر تحديث: 2024</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">1. قبول الشروط</h3>
            <p className="text-gray-600 leading-relaxed">
              باستخدامك لتطبيق "المطبخ المغربي"، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام التطبيق.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">2. وصف الخدمة</h3>
            <p className="text-gray-600 leading-relaxed">
              يقدم التطبيق خدمة اقتراح الوصفات المغربية بناءً على المكونات المتوفرة لديك. يمكنك تصوير ثلاجتك أو اختيار المكونات يدوياً. كما يوفر التطبيق نصائح صحية تقديرية بناءً على ملفك الصحي.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">3. إخلاء المسؤولية الصحية</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 leading-relaxed font-medium">
                ⚠️ المعلومات الصحية والغذائية المقدمة في التطبيق هي تقديرية فقط ولا تُغني عن استشارة طبيب أو أخصائي تغذية. السعرات الحرارية والنصائح الصحية المعروضة هي تقديرات عامة وقد تختلف عن القيم الفعلية.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">4. حساب المستخدم</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span> أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span> يجب أن تكون المعلومات المقدمة صحيحة ودقيقة</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span> نحتفظ بحق تعليق أو إلغاء أي حساب يخالف الشروط</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">5. الملكية الفكرية</h3>
            <p className="text-gray-600 leading-relaxed">
              جميع المحتويات في التطبيق بما في ذلك الوصفات، التصميم، والشعارات هي ملكية فكرية لتطبيق "المطبخ المغربي" ومحمية بموجب قوانين حقوق النشر. الوصفات مستوحاة من التراث المغربي وهي ملك للتراث المغربي العريق.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">6. التعديلات</h3>
            <p className="text-gray-600 leading-relaxed">
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية. استمرارك في استخدام التطبيق بعد التعديل يعني قبولك للشروط الجديدة.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
