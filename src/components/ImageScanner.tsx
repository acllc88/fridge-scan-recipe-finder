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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const ingredientsList = sweetsMode ? sweetsIngredients : allIngredients;

  // Stop camera and release all tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    setCameraReady(false);
  }, []);

  // Start camera with multiple fallback strategies
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);
    setStep('camera');

    // Small delay to ensure video element is mounted
    await new Promise(resolve => setTimeout(resolve, 300));

    const constraints = [
      // Try 1: Rear camera with ideal resolution
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      // Try 2: Rear camera simple
      { video: { facingMode: 'environment' }, audio: false },
      // Try 3: Any camera with resolution
      { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      // Try 4: Any camera at all
      { video: true, audio: false },
    ];

    let stream: MediaStream | null = null;

    for (const constraint of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (stream) break;
      } catch (err) {
        console.log('Constraint failed, trying next:', err);
        continue;
      }
    }

    if (!stream) {
      setCameraError('لا يمكن الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا في إعدادات المتصفح.');
      return;
    }

    streamRef.current = stream;

    if (videoRef.current) {
      const video = videoRef.current;
      
      // Remove old source
      video.srcObject = null;
      
      // Set new stream
      video.srcObject = stream;
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.muted = true;
      
      // Wait for metadata then play
      video.onloadedmetadata = () => {
        video.play()
          .then(() => {
            setCameraReady(true);
            setCameraError(null);
          })
          .catch((err) => {
            console.error('Video play failed:', err);
            // Try playing on user interaction
            setCameraReady(true);
          });
      };

      video.onerror = () => {
        setCameraError('حدث خطأ أثناء تشغيل الكاميرا. حاول مرة أخرى.');
      };

      // Fallback: if metadata doesn't load in 3 seconds
      setTimeout(() => {
        if (!cameraReady && videoRef.current && streamRef.current) {
          videoRef.current.play().catch(() => {});
          setCameraReady(true);
        }
      }, 3000);
    }
  }, [cameraReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
      if (colorCounts.white > threshold * 2) { detected.add('طحين'); detected.add('سكر'); }
      if (colorCounts.brown > threshold) { detected.add('قرفة'); detected.add('تمر'); }
      if (colorCounts.beige > threshold) { detected.add('لوز'); detected.add('سمسم'); }
      if (colorCounts.golden > threshold) { detected.add('عسل'); detected.add('زبدة'); }
      if (colorCounts.yellow > threshold) { detected.add('بيض'); }
      detected.add('ماء زهر');
      detected.add('زيت');
    } else {
      if (colorCounts.red > threshold) {
        detected.add('طماطم');
        if (colorCounts.red > threshold * 2) detected.add('فلفل حلو');
      }
      if (colorCounts.green > threshold) {
        detected.add('كزبرة');
        detected.add('بقدونس');
        if (colorCounts.green > threshold * 1.5) detected.add('كوسة');
      }
      if (colorCounts.yellow > threshold) { detected.add('ليمون مصير'); detected.add('بصل'); }
      if (colorCounts.orange > threshold) { detected.add('جزر'); }
      if (colorCounts.brown > threshold) { detected.add('بصل'); detected.add('بطاطس'); }
      if (colorCounts.white > threshold * 2) { detected.add('ثوم'); detected.add('بيض'); }
      if (colorCounts.purple > threshold) { detected.add('باذنجان'); }
      if (colorCounts.beige > threshold || colorCounts.pink > threshold) { detected.add('دجاج'); }
      if (colorCounts.black > threshold * 0.5) { detected.add('زيتون'); }
      if (detected.size > 2) { detected.add('كمون'); detected.add('بابريكا'); detected.add('زيت زيتون'); }
    }

    return Array.from(detected);
  }, [sweetsMode]);

  const simulateScan = useCallback(async (imageUrl: string) => {
    setStep('scanning');
    setScanProgress(0);

    const statuses = sweetsMode ? [
      'جاري تحليل الصورة... 🔍',
      'البحث عن الطحين والسكر... 🌾',
      'اكتشاف المكسرات... 🥜',
      'التعرف على التوابل الحلوة... 🌸',
      'تجميع مكونات الحلويات... 🍪'
    ] : [
      'جاري تحليل الصورة... 🔍',
      'البحث عن الخضروات... 🥬',
      'التعرف على البروتينات... 🍗',
      'اكتشاف التوابل... 🌿',
      'تجميع النتائج... ✅'
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
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Use actual video dimensions
    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    
    canvas.width = vw;
    canvas.height = vh;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, vw, vh);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageUrl);
      stopCamera();
      simulateScan(imageUrl);
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
    setCameraError(null);
    setCameraReady(false);
    setStep('choose');
  };

  const handleBack = () => {
    stopCamera();
    onBack();
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
          <button onClick={handleBack} className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowRight className="w-6 h-6" />
            <span>رجوع</span>
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {sweetsMode && <Cookie className="w-6 h-6" />}
            {sweetsMode ? 'ماسح مكونات الحلويات 🍪' : 'ماسح الثلاجة 📸'}
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Step 1: Choose Method */}
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
                  : 'التقط صورة لثلاجتك أو ارفع صورة من جهازك'}
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={startCamera}
                className={`flex items-center justify-center gap-3 ${buttonGradient} text-white py-5 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95`}
              >
                <Camera className="w-7 h-7" />
                <span>📸 فتح الكاميرا</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 bg-white text-gray-700 py-5 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-orange-300 active:scale-95"
              >
                <Upload className="w-7 h-7" />
                <span>📁 رفع صورة من الجهاز</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="text-center">
              <button
                onClick={onGoToManual}
                className={`${sweetsMode ? 'text-pink-600 hover:text-pink-700' : 'text-orange-600 hover:text-orange-700'} font-medium text-lg`}
              >
                ✋ أو اختر المكونات يدوياً
              </button>
            </div>

            {sweetsMode && (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-3">🍬 مكونات الحلويات الشائعة:</h3>
                <div className="flex flex-wrap gap-2">
                  {['طحين', 'سكر', 'لوز', 'عسل', 'بيض', 'زبدة', 'سمسم', 'قرفة'].map((ing) => (
                    <span key={ing} className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Camera View */}
        {step === 'camera' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ minHeight: '300px' }}>
              {/* Loading state */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                  <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
                  <p className="text-white text-lg font-bold">جاري تشغيل الكاميرا... 📸</p>
                  <p className="text-gray-400 text-sm mt-2">يرجى السماح بالوصول للكاميرا</p>
                </div>
              )}

              {/* Error state */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 p-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-white text-lg font-bold text-center mb-2">⚠️ خطأ في الكاميرا</p>
                  <p className="text-gray-400 text-sm text-center mb-6">{cameraError}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { stopCamera(); startCamera(); }}
                      className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      🔄 إعادة المحاولة
                    </button>
                    <button
                      onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
                      className="bg-white text-gray-800 px-6 py-3 rounded-xl font-bold"
                    >
                      📁 رفع صورة
                    </button>
                  </div>
                </div>
              )}

              {/* Video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 'auto', minHeight: '300px', objectFit: 'cover', display: 'block' }}
              />

              {/* Camera guides overlay */}
              {cameraReady && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className={`absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 ${sweetsMode ? 'border-pink-400' : 'border-green-400'} rounded-tr-lg`}></div>
                  <div className={`absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 ${sweetsMode ? 'border-pink-400' : 'border-green-400'} rounded-tl-lg`}></div>
                  <div className={`absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 ${sweetsMode ? 'border-pink-400' : 'border-green-400'} rounded-br-lg`}></div>
                  <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 ${sweetsMode ? 'border-pink-400' : 'border-green-400'} rounded-bl-lg`}></div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {sweetsMode ? '🍪 صوّر مكونات الحلويات' : '📸 وجّه الكاميرا نحو ثلاجتك'}
                  </div>
                </div>
              )}
            </div>

            {/* Camera action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => { stopCamera(); setStep('choose'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg active:scale-95 transition"
              >
                <X className="w-6 h-6" />
                إلغاء
              </button>
              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className={`flex-1 flex items-center justify-center gap-2 ${buttonGradient} text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-50`}
              >
                <Camera className="w-6 h-6" />
                📸 التقاط
              </button>
            </div>

            {/* Also allow file upload from camera view */}
            <button
              onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
              className="w-full text-center text-orange-600 font-medium py-2"
            >
              📁 أو ارفع صورة من الجهاز
            </button>

            <canvas ref={canvasRef} className="hidden" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Step 3: Scanning Animation */}
        {step === 'scanning' && capturedImage && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={capturedImage} alt="صورة ملتقطة للمسح" className="w-full aspect-[4/3] object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${sweetsMode ? 'via-pink-500/20' : 'via-orange-500/20'} to-transparent animate-pulse`}></div>
              <div
                className={`absolute right-0 left-0 h-1 ${sweetsMode ? 'bg-gradient-to-l from-pink-500 to-purple-500' : 'bg-gradient-to-l from-red-500 to-orange-500'}`}
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
                <span className="text-gray-600 font-medium">{scanStatus}</span>
                <span className={`font-bold text-lg ${sweetsMode ? 'text-pink-600' : 'text-orange-600'}`}>{scanProgress}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sweetsMode ? 'bg-gradient-to-l from-pink-500 to-purple-500' : 'bg-gradient-to-l from-red-500 to-orange-500'} transition-all duration-100 rounded-full`}
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && capturedImage && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img src={capturedImage} alt="صورة ملتقطة - نتائج المسح" className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-6 h-6 text-green-400" />
                  <span className="font-bold text-lg">✅ تم اكتشاف {detectedIngredients.length} مكون {sweetsMode ? '🍪' : ''}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  {sweetsMode ? '🍬 مكونات الحلويات المكتشفة' : '🥕 المكونات المكتشفة'}
                </h3>
                <button
                  onClick={() => setShowAddIngredient(!showAddIngredient)}
                  className={`flex items-center gap-1 ${sweetsMode ? 'text-pink-600 hover:text-pink-700' : 'text-orange-600 hover:text-orange-700'} font-medium`}
                >
                  <Plus className="w-5 h-5" />
                  إضافة مكون
                </button>
              </div>

              {showAddIngredient && (
                <div className="mb-4 space-y-2 border-2 border-gray-100 rounded-xl p-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={sweetsMode ? 'ابحث عن مكون حلويات...' : 'ابحث عن مكون...'}
                      className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none text-lg"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredIngredients.slice(0, 15).map((ing: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => addIngredient(ing)}
                        className={`w-full text-right px-4 py-3 rounded-lg ${sweetsMode ? 'hover:bg-pink-50' : 'hover:bg-orange-50'} text-gray-700 font-medium transition`}
                      >
                        + {ing}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {detectedIngredients.map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className={`group relative bg-gradient-to-l ${tagGradient} px-4 py-2.5 rounded-full font-medium flex items-center gap-2 text-base`}
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition"
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
                className={`flex items-center justify-center gap-3 ${buttonGradient} text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
              >
                {sweetsMode ? <Cookie className="w-7 h-7" /> : <span className="text-2xl">🇲🇦</span>}
                <span>{sweetsMode ? 'ابحث عن وصفات حلويات مغربية 🍪' : 'ابحث عن وصفات مغربية 🍲'}</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleRescan}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-4 px-4 rounded-xl font-bold border-2 border-gray-200 hover:border-orange-300 active:scale-95 transition"
                >
                  <RotateCcw className="w-5 h-5" />
                  🔄 إعادة المسح
                </button>
                <button
                  onClick={onGoToManual}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-4 px-4 rounded-xl font-bold border-2 border-gray-200 hover:border-orange-300 active:scale-95 transition"
                >
                  ✋ تعديل يدوي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
