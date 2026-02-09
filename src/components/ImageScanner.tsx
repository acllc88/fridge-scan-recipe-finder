import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RotateCcw, Check, Plus, Search, ArrowRight, Cookie } from 'lucide-react';
import { allIngredients } from '../data/recipes';

interface ImageScannerProps {
  onScanComplete: (ingredients: string[], imageUrl: string) => void;
  onBack: () => void;
  onGoToManual: () => void;
  sweetsMode?: boolean;
}

type ScanStep = 'choose' | 'camera' | 'scanning' | 'results';

// Sweets-specific ingredients
const sweetsIngredients = [
  'طحين', 'سكر', 'عسل', 'لوز', 'جوز', 'سمسم', 'زبدة', 'بيض', 
  'قرفة', 'ماء زهر', 'ماء ورد', 'زيت', 'خميرة', 'سميد', 
  'تمر', 'زبيب', 'جوز الهند', 'فول سوداني', 'كاكاو', 'حليب',
  'كريمة', 'فانيلا', 'زعفران', 'يانسون', 'حبة حلوة'
];

export function ImageScanner({ onScanComplete, onBack, onGoToManual, sweetsMode = false }: ImageScannerProps) {
  const [step, setStep] = useState<ScanStep>('choose');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const ingredientsList = sweetsMode ? sweetsIngredients : allIngredients;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep('camera');
    } catch (error) {
      console.error('خطأ في الوصول للكاميرا:', error);
      alert('لا يمكن الوصول للكاميرا. يرجى السماح بالوصول أو رفع صورة بدلاً من ذلك.');
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const analyzeImageColors = useCallback((imageData: ImageData): string[] => {
    const detected: Set<string> = new Set();
    const { data, width, height } = imageData;
    
    const colorCounts: { [key: string]: number } = {
      red: 0, green: 0, yellow: 0, orange: 0, brown: 0,
      white: 0, beige: 0, purple: 0, pink: 0, black: 0, golden: 0
    };

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 150 && g < 100 && b < 100) colorCounts.red++;
      else if (g > 150 && r < 100 && b < 100) colorCounts.green++;
      else if (r > 200 && g > 200 && b < 100) colorCounts.yellow++;
      else if (r > 200 && g > 100 && g < 180 && b < 100) colorCounts.orange++;
      else if (r > 100 && r < 180 && g > 60 && g < 140 && b > 30 && b < 100) colorCounts.brown++;
      else if (r > 200 && g > 200 && b > 200) colorCounts.white++;
      else if (r > 180 && g > 160 && b > 140 && r > g && g > b) colorCounts.beige++;
      else if (r > 100 && b > 100 && g < 100) colorCounts.purple++;
      else if (r > 200 && g > 150 && b > 150 && r > g && r > b) colorCounts.pink++;
      else if (r < 50 && g < 50 && b < 50) colorCounts.black++;
      else if (r > 180 && g > 140 && g < 180 && b < 100) colorCounts.golden++;
    }

    const totalPixels = (width * height) / 16;
    const threshold = totalPixels * 0.02;

    if (sweetsMode) {
      // Detect sweets ingredients
      if (colorCounts.white > threshold * 2) {
        detected.add('طحين');
        detected.add('سكر');
      }
      if (colorCounts.brown > threshold) {
        detected.add('قرفة');
        detected.add('تمر');
      }
      if (colorCounts.beige > threshold) {
        detected.add('لوز');
        detected.add('سمسم');
      }
      if (colorCounts.golden > threshold) {
        detected.add('عسل');
        detected.add('زبدة');
      }
      if (colorCounts.yellow > threshold) {
        detected.add('بيض');
      }
      // Always add common sweets ingredients
      detected.add('ماء زهر');
      detected.add('زيت');
    } else {
      // Regular fridge ingredients
      if (colorCounts.red > threshold) {
        detected.add('طماطم');
        if (colorCounts.red > threshold * 2) detected.add('فلفل حلو');
      }
      if (colorCounts.green > threshold) {
        detected.add('كزبرة');
        detected.add('بقدونس');
        if (colorCounts.green > threshold * 1.5) detected.add('كوسة');
      }
      if (colorCounts.yellow > threshold) {
        detected.add('ليمون مصير');
        detected.add('بصل');
      }
      if (colorCounts.orange > threshold) {
        detected.add('جزر');
      }
      if (colorCounts.brown > threshold) {
        detected.add('بصل');
        detected.add('بطاطس');
      }
      if (colorCounts.white > threshold * 2) {
        detected.add('ثوم');
        detected.add('بيض');
      }
      if (colorCounts.purple > threshold) {
        detected.add('باذنجان');
      }
      if (colorCounts.beige > threshold || colorCounts.pink > threshold) {
        detected.add('دجاج');
      }
      if (colorCounts.black > threshold * 0.5) {
        detected.add('زيتون');
      }
      if (detected.size > 2) {
        detected.add('كمون');
        detected.add('بابريكا');
        detected.add('زيت زيتون');
      }
    }

    return Array.from(detected);
  }, [sweetsMode]);

  const simulateScan = useCallback(async (imageUrl: string) => {
    setStep('scanning');
    setScanProgress(0);
    
    const statuses = sweetsMode ? [
      'جاري تحليل الصورة...',
      'البحث عن الطحين والسكر...',
      'اكتشاف المكسرات...',
      'التعرف على التوابل الحلوة...',
      'تجميع مكونات الحلويات...'
    ] : [
      'جاري تحليل الصورة...',
      'البحث عن الخضروات...',
      'التعرف على البروتينات...',
      'اكتشاف التوابل...',
      'تجميع النتائج...'
    ];

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setScanProgress(i);
      setScanStatus(statuses[Math.floor(i / 25)] || statuses[statuses.length - 1]);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const detected = analyzeImageColors(imageData);
        if (sweetsMode) {
          setDetectedIngredients(detected.length > 0 ? detected : ['طحين', 'سكر', 'بيض', 'زبدة', 'لوز', 'عسل', 'قرفة', 'ماء زهر']);
        } else {
          setDetectedIngredients(detected.length > 0 ? detected : ['طماطم', 'بصل', 'ثوم', 'زيت زيتون', 'كزبرة']);
        }
      } else {
        if (sweetsMode) {
          setDetectedIngredients(['طحين', 'سكر', 'بيض', 'زبدة', 'لوز', 'عسل', 'قرفة', 'ماء زهر']);
        } else {
          setDetectedIngredients(['طماطم', 'بصل', 'ثوم', 'زيت زيتون', 'كزبرة', 'دجاج', 'كمون', 'بابريكا']);
        }
      }
      setStep('results');
    };
    img.onerror = () => {
      if (sweetsMode) {
        setDetectedIngredients(['طحين', 'سكر', 'بيض', 'زبدة', 'لوز', 'عسل', 'قرفة', 'ماء زهر', 'سمسم']);
      } else {
        setDetectedIngredients(['طماطم', 'بصل', 'ثوم', 'زيت زيتون', 'كزبرة', 'دجاج', 'كمون', 'بابريكا']);
      }
      setStep('results');
    };
    img.src = imageUrl;
  }, [analyzeImageColors, sweetsMode]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);
        stopCamera();
        simulateScan(imageUrl);
      }
    }
  }, [stopCamera, simulateScan]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCapturedImage(imageUrl);
        simulateScan(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [simulateScan]);

  const removeIngredient = (ingredient: string) => {
    setDetectedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const addIngredient = (ingredient: string) => {
    if (!detectedIngredients.includes(ingredient)) {
      setDetectedIngredients(prev => [...prev, ingredient]);
    }
    setShowAddIngredient(false);
    setSearchQuery('');
  };

  const handleFindRecipes = () => {
    if (capturedImage) {
      onScanComplete(detectedIngredients, capturedImage);
    }
  };

  const handleRescan = () => {
    setCapturedImage(null);
    setDetectedIngredients([]);
    setStep('choose');
  };

  const filteredIngredients = ingredientsList.filter(
    ing => ing.includes(searchQuery) && !detectedIngredients.includes(ing)
  );

  const headerGradient = sweetsMode 
    ? 'bg-gradient-to-l from-pink-600 via-purple-600 to-pink-700'
    : 'bg-gradient-to-l from-red-700 via-red-600 to-green-700';

  const buttonGradient = sweetsMode
    ? 'bg-gradient-to-l from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
    : 'bg-gradient-to-l from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600';

  const tagGradient = sweetsMode
    ? 'from-pink-100 to-purple-100 text-pink-800'
    : 'from-orange-100 to-amber-100 text-orange-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className={`${headerGradient} text-white py-4 px-6 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {sweetsMode && <Cookie className="w-6 h-6" />}
            {sweetsMode ? 'ماسح مكونات الحلويات 🍪' : 'ماسح الثلاجة'}
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {/* Choose Method */}
        {step === 'choose' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 ${sweetsMode ? 'bg-gradient-to-br from-pink-400 to-purple-500' : 'bg-gradient-to-br from-orange-400 to-red-500'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                {sweetsMode ? (
                  <span className="text-5xl">🍪</span>
                ) : (
                  <Camera className="w-12 h-12 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {sweetsMode ? 'صوّر مكونات الحلويات' : 'صوّر ما عندك'}
              </h2>
              <p className="text-gray-600 mt-2">
                {sweetsMode 
                  ? 'التقط صورة للمكونات (طحين، سكر، لوز...) لاقتراح حلويات مغربية'
                  : 'التقط صورة لثلاجتك أو ارفع صورة من جهازك'
                }
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={startCamera}
                className={`flex items-center justify-center gap-3 ${buttonGradient} text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
              >
                <Camera className="w-6 h-6" />
                <span>فتح الكاميرا</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 bg-white text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-orange-300"
              >
                <Upload className="w-6 h-6" />
                <span>رفع صورة</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="text-center">
              <button
                onClick={onGoToManual}
                className={`${sweetsMode ? 'text-pink-600 hover:text-pink-700' : 'text-orange-600 hover:text-orange-700'} font-medium`}
              >
                أو اختر المكونات يدوياً ←
              </button>
            </div>

            {/* Quick select sweets ingredients */}
            {sweetsMode && (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-3">🍬 مكونات الحلويات الشائعة:</h3>
                <div className="flex flex-wrap gap-2">
                  {['طحين', 'سكر', 'لوز', 'عسل', 'بيض', 'زبدة', 'سمسم', 'قرفة'].map((ing) => (
                    <span key={ing} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera View */}
        {step === 'camera' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-[4/3] object-cover bg-black"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 ${sweetsMode ? 'border-pink-400/70' : 'border-white/70'} rounded-tr-lg`}></div>
                <div className={`absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 ${sweetsMode ? 'border-pink-400/70' : 'border-white/70'} rounded-tl-lg`}></div>
                <div className={`absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 ${sweetsMode ? 'border-pink-400/70' : 'border-white/70'} rounded-br-lg`}></div>
                <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 ${sweetsMode ? 'border-pink-400/70' : 'border-white/70'} rounded-bl-lg`}></div>
              </div>
              <div className="absolute bottom-8 right-1/2 translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {sweetsMode ? 'صوّر مكونات الحلويات 🍪' : 'وجّه الكاميرا نحو ثلاجتك 📸'}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { stopCamera(); setStep('choose'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold"
              >
                <X className="w-5 h-5" />
                إلغاء
              </button>
              <button
                onClick={capturePhoto}
                className={`flex-1 flex items-center justify-center gap-2 ${buttonGradient} text-white py-3 px-6 rounded-xl font-bold shadow-lg`}
              >
                <Camera className="w-5 h-5" />
                التقاط
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Scanning Animation */}
        {step === 'scanning' && capturedImage && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={capturedImage} alt="صورة ملتقطة" className="w-full aspect-[4/3] object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${sweetsMode ? 'via-pink-500/20' : 'via-orange-500/20'} to-transparent animate-pulse`}></div>
              <div 
                className={`absolute top-0 right-0 left-0 h-1 ${sweetsMode ? 'bg-gradient-to-l from-pink-500 to-purple-500' : 'bg-gradient-to-l from-red-500 to-orange-500'}`}
                style={{ 
                  top: `${scanProgress}%`,
                  boxShadow: sweetsMode ? '0 0 20px rgba(219, 39, 119, 0.8)' : '0 0 20px rgba(234, 88, 12, 0.8)'
                }}
              ></div>
              <div className={`absolute top-4 right-4 w-8 h-8 border-2 ${sweetsMode ? 'border-pink-500' : 'border-orange-500'} rounded animate-pulse`}></div>
              <div className={`absolute top-4 left-4 w-8 h-8 border-2 ${sweetsMode ? 'border-pink-500' : 'border-orange-500'} rounded animate-pulse`}></div>
              <div className={`absolute bottom-4 right-4 w-8 h-8 border-2 ${sweetsMode ? 'border-pink-500' : 'border-orange-500'} rounded animate-pulse`}></div>
              <div className={`absolute bottom-4 left-4 w-8 h-8 border-2 ${sweetsMode ? 'border-pink-500' : 'border-orange-500'} rounded animate-pulse`}></div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">{scanStatus}</span>
                <span className={`font-bold ${sweetsMode ? 'text-pink-600' : 'text-orange-600'}`}>{scanProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${sweetsMode ? 'bg-gradient-to-l from-pink-500 to-purple-500' : 'bg-gradient-to-l from-red-500 to-orange-500'} transition-all duration-100 rounded-full`}
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && capturedImage && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img src={capturedImage} alt="صورة ملتقطة" className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-6 h-6 text-green-400" />
                  <span className="font-bold">تم اكتشاف {detectedIngredients.length} مكون {sweetsMode ? '🍪' : ''}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  {sweetsMode ? '🍬 مكونات الحلويات المكتشفة' : 'المكونات المكتشفة'}
                </h3>
                <button
                  onClick={() => setShowAddIngredient(!showAddIngredient)}
                  className={`flex items-center gap-1 ${sweetsMode ? 'text-pink-600 hover:text-pink-700' : 'text-orange-600 hover:text-orange-700'} font-medium text-sm`}
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
              </div>

              {showAddIngredient && (
                <div className="mb-4 space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={sweetsMode ? 'ابحث عن مكون حلويات...' : 'ابحث عن مكون...'}
                      className={`w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-xl focus:${sweetsMode ? 'border-pink-400' : 'border-orange-400'} focus:outline-none`}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredIngredients.slice(0, 10).map((ing: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => addIngredient(ing)}
                        className={`w-full text-right px-3 py-2 rounded-lg ${sweetsMode ? 'hover:bg-pink-50' : 'hover:bg-orange-50'} text-gray-700`}
                      >
                        {ing}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {detectedIngredients.map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className={`group relative bg-gradient-to-l ${tagGradient} px-4 py-2 rounded-full font-medium flex items-center gap-2`}
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <button
                onClick={handleFindRecipes}
                disabled={detectedIngredients.length === 0}
                className={`flex items-center justify-center gap-3 ${buttonGradient} text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sweetsMode ? <Cookie className="w-6 h-6" /> : <span>🇲🇦</span>}
                <span>{sweetsMode ? 'ابحث عن وصفات حلويات مغربية 🍪' : 'ابحث عن وصفات مغربية'}</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleRescan}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-xl font-bold border-2 border-gray-200 hover:border-orange-300"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة المسح
                </button>
                <button
                  onClick={onGoToManual}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-xl font-bold border-2 border-gray-200 hover:border-orange-300"
                >
                  تعديل يدوي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
