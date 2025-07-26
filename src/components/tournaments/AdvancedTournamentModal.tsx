import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Calendar, Users, DollarSign, Settings, Image, Globe, 
  MessageSquare, Languages, CreditCard, Gift, Copy, Zap, MapPin,
  Shield, Eye, Clock, Award, Gamepad2, Target, Flag
} from 'lucide-react';

interface PrizeDistribution {
  position: number;
  percentage: number;
  amount: number;
}

interface TranslationAPI {
  text: string;
  detected_language: string;
  confidence: number;
}

interface AdvancedTournamentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdvancedTournamentModal: React.FC<AdvancedTournamentModalProps> = ({ isOpen: propIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Information (Bilingual)
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    
    // Tournament Settings
    type: 'single_elimination',
    format: '1v1',
    gameMode: 'classic',
    region: 'middle_east',
    resources: '10k',
    timezone: 'Asia/Riyadh',
    
    // Participants
    maxParticipants: 64,
    minParticipants: 8,
    
    // Prize and Payment
    prizePool: 0,
    prizeCurrency: 'USD',
    entryFee: 0,
    entryCurrency: 'USD',
    paymentMethod: 'free',
    prizeDistribution: 'default',
    customPrizes: [] as PrizeDistribution[],
    
    // Dates
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationDeadline: '',
    
    // Rules (Bilingual)
    rules: '',
    rulesEn: '',
    requirements: '',
    requirementsEn: '',
    
    // Maps and Game Settings
    allowedMaps: [] as string[],
    customMaps: '',
    
    // Privacy and Settings
    isPrivate: false,
    requireApproval: true,
    allowSpectators: true,
    enableStreaming: false,
    autoTranslate: true,
    isFeatured: false,
    
    // Contact Information
    contactInfo: {
      discord: '',
      telegram: '',
      email: '',
      phone: ''
    },
    
    // Streaming and Media
    streamUrl: '',
    streamPlatform: 'youtube',
    image: null as File | null,
    banner: null as File | null,
    
    // Sponsors
    sponsors: [] as Array<{name: string, logo: string, url: string}>,
    
    // Advanced Settings
    minRank: '',
    maxRank: '',
    rankVerification: false,
    teamSettings: {
      requireTeam: false,
      maxTeamSize: 1,
      allowSubstitutes: false
    },
    
    // Broadcasting
    broadcastSettings: {
      recordMatches: false,
      allowSpectatorChat: true,
      commentators: [] as string[]
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prizePreview, setPrizePreview] = useState<PrizeDistribution[]>([]);

  // Configuration Data
  const tournamentTypes = [
    { id: 'single_elimination', name: 'إقصاء مباشر', nameEn: 'Single Elimination', description: 'الخاسر يخرج نهائياً', icon: '🏆' },
    { id: 'double_elimination', name: 'إقصاء مزدوج', nameEn: 'Double Elimination', description: 'فرصة ثانية للخاسرين', icon: '🎯' },
    { id: 'round_robin', name: 'دوري', nameEn: 'Round Robin', description: 'الكل يلعب ضد الكل', icon: '🔄' },
    { id: 'swiss', name: 'نظام سويسري', nameEn: 'Swiss System', description: 'مباريات متوازنة', icon: '⚖️' },
    { id: 'ladder', name: 'سلم', nameEn: 'Ladder', description: 'تسلق الترتيب', icon: '📈' }
  ];

  const gameFormats = [
    { id: '1v1', name: 'فردي (1v1)', nameEn: '1v1 Individual', description: 'مباراة فردية', icon: '⚔️' },
    { id: '2v2', name: 'ثنائي (2v2)', nameEn: '2v2 Teams', description: 'فريق من لاعبين', icon: '👥' },
    { id: '3v3', name: 'ثلاثي (3v3)', nameEn: '3v3 Teams', description: 'فريق من 3 لاعبين', icon: '👫' },
    { id: '4v4', name: 'رباعي (4v4)', nameEn: '4v4 Teams', description: 'فريق من 4 لاعبين', icon: '👨‍👩‍👧‍👦' },
    { id: 'clan_war', name: 'حرب الكلانات', nameEn: 'Clan War', description: 'منافسة بين الكلانات', icon: '🏰' },
    { id: 'team', name: 'فريق مخصص', nameEn: 'Custom Team', description: 'حدد حجم الفريق', icon: '🏘️' }
  ];

  const currencies = [
    { id: 'USD', name: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$' },
    { id: 'SAR', name: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س' },
    { id: 'AED', name: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ' },
    { id: 'EGP', name: 'جنيه مصري', nameEn: 'Egyptian Pound', symbol: 'ج.م' },
    { id: 'EUR', name: 'يورو', nameEn: 'Euro', symbol: '€' }
  ];

  const paymentMethods = [
    { id: 'free', name: 'مجاني', nameEn: 'Free', description: 'بدون رسوم دخول', icon: '🆓' },
    { id: 'paypal', name: 'PayPal', nameEn: 'PayPal', description: 'الدفع عبر PayPal', icon: '💳' },
    { id: 'bank_transfer', name: 'تحويل بنكي', nameEn: 'Bank Transfer', description: 'تحويل مباشر', icon: '🏦' },
    { id: 'crypto', name: 'عملة رقمية', nameEn: 'Cryptocurrency', description: 'Bitcoin, Ethereum', icon: '₿' },
    { id: 'mobile_payment', name: 'دفع محمول', nameEn: 'Mobile Payment', description: 'STC Pay, Mada', icon: '📱' }
  ];

  const prizeDistributions = [
    { id: 'winner_takes_all', name: 'الفائز يأخذ كل شيء', nameEn: 'Winner Takes All', description: '100% للأول' },
    { id: 'default', name: 'توزيع تقليدي', nameEn: 'Traditional Split', description: '60% للأول، 40% للثاني' },
    { id: 'top_3', name: 'أفضل 3', nameEn: 'Top 3', description: '50%, 30%, 20%' },
    { id: 'top_5', name: 'أفضل 5', nameEn: 'Top 5', description: '40%, 25%, 15%, 10%, 10%' },
    { id: 'custom', name: 'مخصص', nameEn: 'Custom', description: 'تحديد يدوي' }
  ];

  const availableMaps = [
    'Tournament Desert', 'Desert Fury', 'Winter Wolf', 'Tournament Island', 
    'Urban Combat', 'Mountain Pass', 'Scorched Earth', 'Green Pastures',
    'Industrial Zone', 'Coastal Assault', 'Valley of Death', 'Battle Arena',
    'Strategic Plains', 'War Zone', 'Combat Valley', 'Championship Field'
  ];

  const resourceOptions = [
    { value: '5k', label: '5,000 موارد', labelEn: '5k Resources' },
    { value: '10k', label: '10,000 موارد', labelEn: '10k Resources' },
    { value: '20k', label: '20,000 موارد', labelEn: '20k Resources' },
    { value: '50k', label: '50,000 موارد', labelEn: '50k Resources' },
    { value: 'unlimited', label: 'موارد غير محدودة', labelEn: 'Unlimited Resources' }
  ];

  const regions = [
    { value: 'global', label: 'عالمي', labelEn: 'Global' },
    { value: 'middle_east', label: 'الشرق الأوسط', labelEn: 'Middle East' },
    { value: 'north_africa', label: 'شمال أفريقيا', labelEn: 'North Africa' },
    { value: 'europe', label: 'أوروبا', labelEn: 'Europe' },
    { value: 'asia', label: 'آسيا', labelEn: 'Asia' },
    { value: 'americas', label: 'الأمريكتين', labelEn: 'Americas' }
  ];

  const timezones = [
    { id: 'Asia/Riyadh', name: 'الرياض (UTC+3)', nameEn: 'Riyadh (UTC+3)' },
    { id: 'Asia/Dubai', name: 'دبي (UTC+4)', nameEn: 'Dubai (UTC+4)' },
    { id: 'Africa/Cairo', name: 'القاهرة (UTC+2)', nameEn: 'Cairo (UTC+2)' },
    { id: 'Europe/London', name: 'لندن (UTC+0)', nameEn: 'London (UTC+0)' },
    { id: 'America/New_York', name: 'نيويورك (UTC-5)', nameEn: 'New York (UTC-5)' },
    { id: 'UTC', name: 'توقيت عالمي', nameEn: 'UTC Time' }
  ];

  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      setCurrentStep(1);
      resetForm();
    };

    window.addEventListener('openAdvancedTournamentModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openAdvancedTournamentModal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    if (formData.prizePool > 0) {
      calculatePrizeDistribution();
    }
  }, [formData.prizePool, formData.prizeDistribution, formData.maxParticipants]);

  const resetForm = () => {
    setFormData({
      name: '', nameEn: '', description: '', descriptionEn: '',
      type: 'single_elimination', format: '1v1', gameMode: 'classic',
      region: 'middle_east', resources: '10k', timezone: 'Asia/Riyadh',
      maxParticipants: 64, minParticipants: 8,
      prizePool: 0, prizeCurrency: 'USD', entryFee: 0, entryCurrency: 'USD',
      paymentMethod: 'free', prizeDistribution: 'default', customPrizes: [],
      startDate: '', endDate: '', registrationStart: '', registrationDeadline: '',
      rules: '', rulesEn: '', requirements: '', requirementsEn: '',
      allowedMaps: [], customMaps: '',
      isPrivate: false, requireApproval: true, allowSpectators: true,
      enableStreaming: false, autoTranslate: true, isFeatured: false,
      contactInfo: { discord: '', telegram: '', email: '', phone: '' },
      streamUrl: '', streamPlatform: 'youtube', image: null, banner: null,
      sponsors: [], minRank: '', maxRank: '', rankVerification: false,
      teamSettings: { requireTeam: false, maxTeamSize: 1, allowSubstitutes: false },
      broadcastSettings: { recordMatches: false, allowSpectatorChat: true, commentators: [] }
    });
    setErrors({});
    setPrizePreview([]);
    setAgreementChecked(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    resetForm();
    if (onClose) onClose();
  };

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  // Mock Translation API
  const translateText = async (text: string, targetLang: string): Promise<TranslationAPI> => {
    setTranslateLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockTranslations: Record<string, Record<string, string>> = {
      'ar': {
        'Grand Tournament': 'البطولة الكبرى',
        'This is a competitive tournament': 'هذه بطولة تنافسية',
        'Tournament rules and regulations': 'قوانين ولوائح البطولة',
        'No cheating allowed': 'ممنوع الغش',
        'Respect all players': 'احترام جميع اللاعبين'
      },
      'en': {
        'البطولة الكبرى': 'Grand Tournament',
        'هذه بطولة تنافسية': 'This is a competitive tournament',
        'قوانين ولوائح البطولة': 'Tournament rules and regulations',
        'ممنوع الغش': 'No cheating allowed',
        'احترام جميع اللاعبين': 'Respect all players'
      }
    };
    
    const result = mockTranslations[targetLang]?.[text] || `[Auto-translated: ${text}]`;
    
    setTranslateLoading(false);
    return {
      text: result,
      detected_language: targetLang === 'ar' ? 'en' : 'ar',
      confidence: 0.95
    };
  };

  const handleAutoTranslate = async (field: string, targetField: string) => {
    const sourceText = formData[field as keyof typeof formData] as string;
    if (!sourceText.trim()) {
      alert('يرجى إدخال النص المراد ترجمته أولاً');
      return;
    }
    
    try {
      const targetLang = targetField.includes('En') ? 'en' : 'ar';
      const translation = await translateText(sourceText, targetLang);
      setFormData(prev => ({ ...prev, [targetField]: translation.text }));
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
      toast.textContent = 'تم الترجمة بنجاح!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
    } catch (error) {
      console.error('Translation error:', error);
      alert('حدث خطأ أثناء الترجمة');
    }
  };

  const calculatePrizeDistribution = () => {
    const totalPrize = formData.prizePool;
    let distribution: PrizeDistribution[] = [];
    
    switch (formData.prizeDistribution) {
      case 'winner_takes_all':
        distribution = [{ position: 1, percentage: 100, amount: totalPrize }];
        break;
      case 'top_3':
        distribution = [
          { position: 1, percentage: 50, amount: totalPrize * 0.5 },
          { position: 2, percentage: 30, amount: totalPrize * 0.3 },
          { position: 3, percentage: 20, amount: totalPrize * 0.2 }
        ];
        break;
      case 'top_5':
        distribution = [
          { position: 1, percentage: 40, amount: totalPrize * 0.4 },
          { position: 2, percentage: 25, amount: totalPrize * 0.25 },
          { position: 3, percentage: 15, amount: totalPrize * 0.15 },
          { position: 4, percentage: 10, amount: totalPrize * 0.1 },
          { position: 5, percentage: 10, amount: totalPrize * 0.1 }
        ];
        break;
      default: // default
        distribution = [
          { position: 1, percentage: 60, amount: totalPrize * 0.6 },
          { position: 2, percentage: 40, amount: totalPrize * 0.4 }
        ];
    }
    
    setPrizePreview(distribution);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.name.trim()) newErrors.name = 'اسم البطولة مطلوب';
        if (!formData.description.trim()) newErrors.description = 'وصف البطولة مطلوب';
        if (!formData.startDate) newErrors.startDate = 'تاريخ البداية مطلوب';
        if (!formData.registrationDeadline) newErrors.registrationDeadline = 'موعد انتهاء التسجيل مطلوب';
        
        // Date validation
        if (formData.startDate && formData.endDate) {
          if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
          }
        }
        if (formData.registrationDeadline && formData.startDate) {
          if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
            newErrors.registrationDeadline = 'موعد انتهاء التسجيل يجب أن يكون قبل بداية البطولة';
          }
        }
        break;
      
      case 2: // Tournament Settings
        if (formData.maxParticipants < 4) newErrors.maxParticipants = 'الحد الأدنى 4 مشاركين';
        if (formData.maxParticipants > 1024) newErrors.maxParticipants = 'الحد الأقصى 1024 مشارك';
        if (formData.minParticipants > formData.maxParticipants) {
          newErrors.minParticipants = 'الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى';
        }
        break;
      
      case 3: // Prize and Payment
        if (formData.prizePool < 0) newErrors.prizePool = 'لا يمكن أن تكون الجائزة سالبة';
        if (formData.entryFee < 0) newErrors.entryFee = 'لا يمكن أن تكون رسوم الدخول سالبة';
        if (formData.paymentMethod !== 'free' && formData.entryFee === 0) {
          newErrors.entryFee = 'رسوم الدخول مطلوبة عند اختيار طريقة دفع';
        }
        break;
      
      case 4: // Rules & Maps
        if (!formData.rules.trim()) newErrors.rules = 'قوانين البطولة مطلوبة';
        if (formData.allowedMaps.length === 0) newErrors.maps = 'يجب اختيار خريطة واحدة على الأقل';
        break;
        
      case 5: // Advanced Settings - No strict validation needed
        break;
        
      case 6: // Final Review
        if (!formData.contactInfo.discord && !formData.contactInfo.telegram && !formData.contactInfo.email) {
          newErrors.contactInfo = 'يجب توفير طريقة تواصل واحدة على الأقل';
        }
        if (!agreementChecked) {
          newErrors.agreement = 'يجب الموافقة على الشروط والأحكام';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('zh_love_user') || '{}');
    if (!user.id) {
      alert('يرجى تسجيل الدخول أولاً لإنشاء بطولة');
      return;
    }

    setLoading(true);
    
    try {
      const tournamentData = {
        id: Date.now(),
        ...formData,
        participants: 0,
        organizerId: user.id,
        organizerName: user.username,
        status: 'pending_approval',
        adminStatus: 'pending', // أضيف هذا للمراجعة الإدارية
        featured: formData.isFeatured,
        createdAt: new Date().toISOString(),
        prizePreview: prizePreview,
        // Convert File objects to URLs for demo purposes
        imageUrl: formData.image ? URL.createObjectURL(formData.image) : null,
        bannerUrl: formData.banner ? URL.createObjectURL(formData.banner) : null
      };

      // Save to localStorage for demo purposes
      const existingTournaments = JSON.parse(localStorage.getItem('user_tournaments') || '[]');
      existingTournaments.push(tournamentData);
      localStorage.setItem('user_tournaments', JSON.stringify(existingTournaments));

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
      toast.innerHTML = `
        <div class="flex items-center space-x-2 rtl:space-x-reverse">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>تم إنشاء البطولة بنجاح! في انتظار موافقة الإدارة.</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 5000);

      handleClose();
      
      // Refresh tournaments page if we're on it
      if (window.location.pathname.includes('tournaments')) {
        setTimeout(() => window.location.reload(), 1000);
      }
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('حدث خطأ أثناء إنشاء البطولة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">إنشاء بطولة متقدمة</h2>
            {formData.autoTranslate && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-400">
                <Languages className="w-4 h-4" />
                <span className="text-xs">ترجمة تلقائية</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="text-sm text-gray-400">الخطوة {currentStep} من 6</span>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>المعلومات الأساسية</span>
            <span>إعدادات البطولة</span>
            <span>الجوائز والدفع</span>
            <span>القوانين والخرائط</span>
            <span>الإعدادات المتقدمة</span>
            <span>المراجعة النهائية</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">المعلومات الأساسية</h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={formData.autoTranslate}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoTranslate: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">ترجمة آلية</span>
                  </label>
                  <Languages className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* Tournament Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    صورة البطولة
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image')}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="Tournament preview"
                          className="w-32 h-20 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                          className="mt-1 text-xs text-red-400 hover:text-red-300"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    الحد الأقصى: 5 ميجابايت (PNG, JPG, WEBP)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    بانر البطولة (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                    {formData.banner && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(formData.banner)}
                          alt="Banner preview"
                          className="w-32 h-16 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, banner: null }))}
                          className="mt-1 text-xs text-red-400 hover:text-red-300"
                        >
                          إزالة البانر
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    للعرض في الرأس (نسبة 16:9 مُفضلة)
                  </p>
                </div>
              </div>
              
              {/* Tournament Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    اسم البطولة (عربي) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="مثال: بطولة ZH-Love الكبرى 2024"
                    />
                    {formData.autoTranslate && (
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('name', 'nameEn')}
                        disabled={translateLoading}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        {translateLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    اسم البطولة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Example: ZH-Love Grand Championship 2024"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    وصف البطولة (عربي) *
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="اكتب وصفاً شاملاً للبطولة..."
                    />
                    {formData.autoTranslate && (
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('description', 'descriptionEn')}
                        disabled={translateLoading}
                        className="absolute left-2 top-2 p-2 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        {translateLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    وصف البطولة (إنجليزي)
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Write a comprehensive tournament description..."
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    تاريخ بداية البطولة *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    تاريخ نهاية البطولة
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    موعد انتهاء التسجيل *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.registrationDeadline && <p className="mt-1 text-sm text-red-400">{errors.registrationDeadline}</p>}
                </div>
              </div>

              {/* Timezone and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">المنطقة الزمنية</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">المنطقة</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {translateLoading && (
                <div className="flex items-center justify-center p-4 bg-blue-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-400 animate-spin mr-2" />
                  <span className="text-blue-300">جاري الترجمة الآلية...</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Tournament Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Settings className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">إعدادات البطولة</h3>
              </div>
              
              {/* Tournament Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">نوع البطولة</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentTypes.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: format.id }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.type === format.id
                          ? 'border-green-500 bg-green-900/20 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <h4 className="font-medium mb-1">{format.name}</h4>
                      <p className="text-sm opacity-75">{format.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">صيغة اللعب</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameFormats.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, format: format.id }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.format === format.id
                          ? 'border-green-500 bg-green-900/20 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <h4 className="font-medium mb-1">{format.name}</h4>
                      <p className="text-sm opacity-75">{format.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الحد الأدنى للمشاركين
                  </label>
                  <input
                    type="number"
                    value={formData.minParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, minParticipants: parseInt(e.target.value) || 8 }))}
                    min="2"
                    max="64"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.minParticipants && <p className="mt-1 text-sm text-red-400">{errors.minParticipants}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    عدد المشاركين الأقصى *
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 64 }))}
                    min="4"
                    max="1024"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.maxParticipants && <p className="mt-1 text-sm text-red-400">{errors.maxParticipants}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مقدار الموارد</label>
                  <select
                    value={formData.resources}
                    onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {resourceOptions.map((resource) => (
                      <option key={resource.value} value={resource.value}>
                        {resource.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Game Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">نمط اللعبة</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['classic', 'tournament', 'ranked', 'custom'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gameMode: mode }))}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.gameMode === mode
                          ? 'border-green-500 bg-green-900/20 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-1">
                          {mode === 'classic' ? '🎮' : mode === 'tournament' ? '🏆' : mode === 'ranked' ? '⭐' : '⚙️'}
                        </div>
                        <div className="text-sm">
                          {mode === 'classic' ? 'كلاسيكي' : mode === 'tournament' ? 'بطولة' : mode === 'ranked' ? 'مرتب' : 'مخصص'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">إعدادات الخصوصية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">بطولة خاصة</div>
                      <div className="text-sm text-gray-400">بدعوة فقط</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">تتطلب موافقة</div>
                      <div className="text-sm text-gray-400">المشاركات تحتاج موافقة المنظم</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.allowSpectators}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowSpectators: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">السماح بالمتفرجين</div>
                      <div className="text-sm text-gray-400">يمكن للآخرين مشاهدة البطولة</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.enableStreaming}
                      onChange={(e) => setFormData(prev => ({ ...prev, enableStreaming: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">تفعيل البث</div>
                      <div className="text-sm text-gray-400">بث مباشر للمباريات</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Prize and Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <DollarSign className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">الجوائز والدفع</h3>
              </div>
              
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">طريقة الدفع</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.paymentMethod === method.id
                          ? 'border-green-500 bg-green-900/20 text-green-300'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <h4 className="font-medium mb-1">{method.name}</h4>
                      <p className="text-sm opacity-75">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Entry Fee & Currency */}
              {formData.paymentMethod !== 'free' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رسوم الاشتراك *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.entryFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, entryFee: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.entryFee && <p className="mt-1 text-sm text-red-400">{errors.entryFee}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">عملة رسوم الاشتراك</label>
                    <select
                      value={formData.entryCurrency}
                      onChange={(e) => setFormData(prev => ({ ...prev, entryCurrency: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Prize Pool */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    مجموع الجوائز
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.prizePool}
                      onChange={(e) => setFormData(prev => ({ ...prev, prizePool: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                    <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.prizePool && <p className="mt-1 text-sm text-red-400">{errors.prizePool}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">عملة الجائزة</label>
                  <select
                    value={formData.prizeCurrency}
                    onChange={(e) => setFormData(prev => ({ ...prev, prizeCurrency: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prize Distribution */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">توزيع الجوائز</label>
                <select
                  value={formData.prizeDistribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, prizeDistribution: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {prizeDistributions.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} - {dist.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prize Preview */}
              {formData.prizePool > 0 && prizePreview.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-400" />
                    معاينة توزيع الجوائز
                  </h4>
                  <div className="space-y-3">
                    {prizePreview.map((prize, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-green-600'
                          }`}>
                            {prize.position}
                          </div>
                          <span className="text-white">
                            {prize.position === 1 ? 'المركز الأول' : 
                             prize.position === 2 ? 'المركز الثاني' : 
                             prize.position === 3 ? 'المركز الثالث' : 
                             `المركز ${prize.position}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-gray-400">%{prize.percentage}</span>
                          <span className="text-yellow-400 font-bold">
                            {currencies.find(c => c.id === formData.prizeCurrency)?.symbol}{prize.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Rules & Maps */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">القوانين والخرائط</h3>
              </div>
              
              {/* Tournament Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    قوانين البطولة (عربي) *
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.rules}
                      onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="اكتب قوانين البطولة بالتفصيل..."
                    />
                    {formData.autoTranslate && (
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('rules', 'rulesEn')}
                        disabled={translateLoading}
                        className="absolute left-3 top-3 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        {translateLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {errors.rules && <p className="mt-1 text-sm text-red-400">{errors.rules}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    قوانين البطولة (إنجليزي)
                  </label>
                  <textarea
                    value={formData.rulesEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, rulesEn: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Enter tournament rules and conditions in English"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    متطلبات المشاركة (عربي)
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="مثال: مستوى أدنى 50، عدم استخدام الغش..."
                    />
                    {formData.autoTranslate && (
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('requirements', 'requirementsEn')}
                        disabled={translateLoading}
                        className="absolute left-3 top-3 text-gray-400 hover:text-green-400 transition-colors"
                      >
                        {translateLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    متطلبات المشاركة (إنجليزي)
                  </label>
                  <textarea
                    value={formData.requirementsEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirementsEn: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Example: Minimum level 50, no cheating..."
                  />
                </div>
              </div>

              {/* Maps Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  الخرائط المسموحة *
                </label>
                
                {/* Available Maps */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {availableMaps.map(map => (
                    <button
                      key={map}
                      type="button"
                      onClick={() => {
                        if (formData.allowedMaps.includes(map)) {
                          setFormData(prev => ({ ...prev, allowedMaps: prev.allowedMaps.filter(m => m !== map) }));
                        } else {
                          setFormData(prev => ({ ...prev, allowedMaps: [...prev.allowedMaps, map] }));
                        }
                      }}
                      className={`p-3 rounded-lg text-sm transition-colors ${
                        formData.allowedMaps.includes(map)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {map}
                    </button>
                  ))}
                </div>

                {/* Custom Map Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customMaps}
                    onChange={(e) => setFormData(prev => ({ ...prev, customMaps: e.target.value }))}
                    placeholder="أضف خريطة مخصصة"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.customMaps.trim()) {
                        setFormData(prev => ({ 
                          ...prev, 
                          allowedMaps: [...prev.allowedMaps, prev.customMaps.trim()],
                          customMaps: ''
                        }));
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    إضافة
                  </button>
                </div>

                {/* Selected Maps */}
                {formData.allowedMaps.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">الخرائط المختارة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.allowedMaps.map(map => (
                        <span
                          key={map}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                        >
                          {map}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, allowedMaps: prev.allowedMaps.filter(m => m !== map) }))}
                            className="ml-2 text-white hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {errors.maps && <p className="mt-1 text-sm text-red-400">{errors.maps}</p>}
              </div>
            </div>
          )}

          {/* Step 5: Advanced Settings */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">الإعدادات المتقدمة</h3>
              </div>

              {/* Rank Requirements */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">متطلبات الرتبة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الحد الأدنى للرتبة</label>
                    <input
                      type="text"
                      value={formData.minRank}
                      onChange={(e) => setFormData(prev => ({ ...prev, minRank: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="مثال: برونز، فضي..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الحد الأقصى للرتبة</label>
                    <input
                      type="text"
                      value={formData.maxRank}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxRank: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="مثال: ذهبي، ألماس..."
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg w-full">
                      <input
                        type="checkbox"
                        checked={formData.rankVerification}
                        onChange={(e) => setFormData(prev => ({ ...prev, rankVerification: e.target.checked }))}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <div className="font-medium text-white">التحقق من الرتبة</div>
                        <div className="text-sm text-gray-400">مطالبة بإثبات الرتبة</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Team Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">إعدادات الفريق</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.teamSettings.requireTeam}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        teamSettings: { ...prev.teamSettings, requireTeam: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">يتطلب فريق</div>
                      <div className="text-sm text-gray-400">تسجيل جماعي مطلوب</div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">حجم الفريق الأقصى</label>
                    <input
                      type="number"
                      value={formData.teamSettings.maxTeamSize}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        teamSettings: { ...prev.teamSettings, maxTeamSize: parseInt(e.target.value) || 1 }
                      }))}
                      min="1"
                      max="8"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.teamSettings.allowSubstitutes}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        teamSettings: { ...prev.teamSettings, allowSubstitutes: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">السماح بالبدلاء</div>
                      <div className="text-sm text-gray-400">إمكانية استبدال اللاعبين</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Broadcasting Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">إعدادات البث</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.broadcastSettings.recordMatches}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        broadcastSettings: { ...prev.broadcastSettings, recordMatches: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">تسجيل المباريات</div>
                      <div className="text-sm text-gray-400">حفظ تسجيلات المباريات</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.broadcastSettings.allowSpectatorChat}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        broadcastSettings: { ...prev.broadcastSettings, allowSpectatorChat: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-white">دردشة المتفرجين</div>
                      <div className="text-sm text-gray-400">السماح بالتعليقات</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Featured Tournament */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <label className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <div className="font-medium text-yellow-300 flex items-center">
                      <Flag className="w-4 h-4 mr-2" />
                      بطولة مميزة
                    </div>
                    <div className="text-sm text-yellow-400">
                      عرض البطولة في القسم المميز (يتطلب موافقة الإدارة)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Final Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <Eye className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">المراجعة النهائية</h3>
              </div>
              
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">معلومات التواصل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                    <input
                      type="url"
                      value={formData.contactInfo.discord}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, discord: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://discord.gg/your-server"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telegram</label>
                    <input
                      type="url"
                      value={formData.contactInfo.telegram}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, telegram: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://t.me/your-channel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="tournament@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الهاتف</label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+966 XX XXX XXXX"
                    />
                  </div>
                </div>
                {errors.contactInfo && <p className="mt-1 text-sm text-red-400">{errors.contactInfo}</p>}
              </div>

              {/* Agreement */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 mt-1"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-300">
                    أوافق على <a href="#" className="text-blue-400 hover:text-blue-300">شروط الاستخدام</a> و
                    <a href="#" className="text-blue-400 hover:text-blue-300">سياسة الخصوصية</a>. 
                    أؤكد أن جميع المعلومات المقدمة صحيحة وأنني مسؤول عن إدارة هذه البطولة بشكل عادل ومهني.
                    البطولة ستخضع لمراجعة الإدارة قبل النشر.
                  </label>
                </div>
                {errors.agreement && <p className="mt-1 text-sm text-red-400">{errors.agreement}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              السابق
            </button>
            
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                التالي
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    <span>إنشاء البطولة المتقدمة</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTournamentModal; 