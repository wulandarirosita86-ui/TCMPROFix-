import React, { useState, useRef, useEffect } from 'react';
import { 
  Calculator, Activity, Scale, Info, FileText, Download, Utensils, 
  Dumbbell, Droplets, Flame, HeartPulse, Sparkles, CheckCircle2, 
  Copy, Printer, FileSpreadsheet, Code2, ArrowRight, ShieldAlert,
  User, MapPin, Calendar, Heart, Zap, RefreshCw, Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TCMSyndromeBMI {
  id: string;
  name: string;
  pinyin: string;
  pathogenesis: string;
  symptoms: string[];
  tongue: string;
  pulse: string;
  principle: string;
  herbalFormula: string;
  herbs: string[];
  acupoints: string[];
  masterTungPoints: string[];
  dietAdvice: string;
  dietAvoid: string;
  teaRecommendation: string;
}

const TCM_BMI_SYNDROMES: Record<string, TCMSyndromeBMI> = {
  spleen_qi_damp: {
    id: 'spleen_qi_damp',
    name: 'Defisiensi Qi Limpa dengan Penumpukan Kelembaban',
    pinyin: 'Pí Qì Xū Shī Shèng (脾气虚湿盛)',
    pathogenesis: 'Ketidakmampuan Limpa mentransformasi cairan menyebabkan retensi kelembaban dan akumulasi lemak tubuh serta rasa lelah setelah makan.',
    symptoms: ['Kelelahan kronis', 'Badan terasa berat', 'Perut kembung setelah makan', 'Feses lembek/tidak berbentuk', 'Mudah mengantuk di siang hari', 'Edema ringan di tungkai bawah'],
    tongue: 'Lidah pucat, membesar/bengkak (swollen) dengan bekas gigi di tepi (teeth marks), lapisan sabur putih tebal dan lengket (greasy white coat).',
    pulse: 'Nadi Lemah (Xu / Weak) atau Licin-Licin (Hua / Slippery) pada posisi kanan Guan (Limpa).',
    principle: 'Jian Pi Yi Qi, Hua Shi Xiao Zhi (Menguatkan Limpa, Menambah Qi, Menghilangkan Kelembaban, Mengikis Lemak).',
    herbalFormula: 'Shen Ling Bai Zhu San (参苓白术散) atau Liu Jun Zi Tang (六君子汤) ditambah Cang Zhu & Chen Pi.',
    herbs: ['Dang Shen 10g', 'Bai Zhu 12g', 'Fu Ling 15g', 'Yi Yi Ren (Jali) 20g', 'Chen Pi 6g', 'Sha Ren 6g', 'Zhi Gan Cao 5g'],
    acupoints: ['SP3 (Taibai) - Yuan Source Limpa', 'SP6 (Sanyinjiao) - Tonifikasi Yin/Lembab', 'SP9 (Yinlingquan) - Pintu pembuangan kelembaban', 'ST36 (Zusanli) - Penguat Qi & Limpa Lambung', 'CV12 (Zhongwan) - Mu Depan Lambung', 'BL20 (Pishu) - Shu Belakang Limpa'],
    masterTungPoints: ['77.01 Zhengjin & 77.02 Zhengzong (Mengatasi beban punggung/tungkai berat)', 'Siming (Regulasi metabolisme cairan)'],
    dietAdvice: 'Konsumsi makanan hangat dan matang. Perbanyak Jali-jali (Yi Yi Ren), Ubi jalar rebus, Labu kuning, Daging ayam kampung tanpa lemak, Kayu manis, Jahe merah hangat.',
    dietAvoid: 'HINDARI: Makanan dingin/mentah (salad, es batu, jus buah asam dingin), susu sapi berlebih, santan kental, gorengan tepung berminyak.',
    teaRecommendation: 'Teh Jahe Hangat + Chen Pi (Kulit Jeruk Kering) + Seduhan Biji Jali-jali.'
  },
  phlegm_damp: {
    id: 'phlegm_damp',
    name: 'Penumpukan Dahak dan Kelembaban Keruh',
    pinyin: 'Tán Shī Zǔ Zhì (痰湿阻滞)',
    pathogenesis: 'Kelembaban yang bertahan lama terkondensasi menjadi Dahak (Tan), menyumbat meridian dan organ, memicu obesitas sentral serta penumpukan kolesterol/trigliserida.',
    symptoms: ['Obesitas sentral (lingkar pinggang besar)', 'Dada dan ulu hati terasa begah/sesak', 'Sering berdahak di tenggorokan', 'Kepala pusing terasa berat seperti terikat', 'Nafas pendek saat jalan cepat', 'Sendi terasa pegal'],
    tongue: 'Badan lidah bengkak, lapisan sabur sangat tebal, keruh, berminyak keputihan atau kekuningan di tengah lidah.',
    pulse: 'Nadi Licin dan Berisi (Hua Mai / Slippery & Full Pulse).',
    principle: 'Zao Shi Hua Tan, Li Qi Xiao Zhi (Mengeringkan Kelembaban, Mengubah Dahak, Melancarkan Qi, Mengikis Lemak).',
    herbalFormula: 'Er Chen Tang (二陈汤) digabung dengan Ping Wei San (平胃散) atau Bao He Wan (保和丸).',
    herbs: ['Ban Xia 9g', 'Ju Hong / Chen Pi 10g', 'Fu Ling 15g', 'Cang Zhu 10g', 'Hou Po 9g', 'Shan Zha (Hawthorn) 15g', 'He Ye (Daun Teratai) 10g'],
    acupoints: ['ST40 (Fenglong) - Titik utama transformasi dahak empiris', 'ST25 (Tianshu) - Mu Usus Besar, memecah lemak perut', 'CV9 (Shuifen) - Membagi cairan dan eliminasi edema', 'SP9 (Yinlingquan)', 'CV12 (Zhongwan)', 'GB34 (Yanglingquan)'],
    masterTungPoints: ['Simazhong, Simashang, Simaxia (Empiris pembersih racun/lemak meridian Yangming)', 'Qihuang (Regulasi Hati & Metabolisme)'],
    dietAdvice: 'Teh daun teratai (He Ye), Sup lobak putih bening, Jamur kuping hitam (Mu Er), Rumput laut (Hai Dai), Buah Hawthorn (Shan Zha), Kacang hijau rebus tanpa santan.',
    dietAvoid: 'HINDARI: Gorengan berulang, lemak hewani gajih/jeroan, keju, mentega, kue tart manis, mie instan, makanan ber-MSG tinggi.',
    teaRecommendation: 'Teh Hijau + Daun Teratai (He Ye) + Irisan Shan Zha (Hawthorn) kering.'
  },
  liver_qi_stomach_heat: {
    id: 'liver_qi_stomach_heat',
    name: 'Stagnasi Qi Hati Berubah Menjadi Panas Lambung',
    pinyin: 'Gān Qì Huà Huǒ, Wèi Rè Chī Shèng (肝郁化火, 胃热炽盛)',
    pathogenesis: 'Stres emosional dan pola hidup tegang memicu hiperaktivitas api Lambung (lapar terus menerus / emotional eating / bulimia craving).',
    symptoms: ['Nafsu makan berlebihan (selalu merasa lapar/ingin mengunyah)', 'Mudah tersinggung/stres memicu makan (stress eating)', 'Mulut terasa kering/pahit, nafas berbau panas', 'Sembelit/feses kering', 'Muka merah/mudah berjerawat', 'Asam lambung mudah naik'],
    tongue: 'Badan lidah merah dengan tepi lidah sangat merah, lapisan sabur kuning tebal dan kering.',
    pulse: 'Nadi Tegang Kawat dan Cepat (Xian Shu Mai / Wiry & Rapid Pulse).',
    principle: 'Shu Gan Xie Re, Qing Wei Jiang Huo (Meredakan Stagnasi Hati, Membersihkan Panas Lambung, Menurunkan Nafsu Makan Berlebih).',
    herbalFormula: 'Fang Feng Tong Sheng San (防风通圣散) atau Dan Zhi Xiao Yao San (丹栀逍遥散) dikombinasikan dengan Qing Wei San.',
    herbs: ['Chai Hu 9g', 'Huang Qin 9g', 'Shi Gao (Gypsum) 20g', 'Zhi Mu 10g', 'Shan Zha 12g', 'Jue Ming Zi (Cassia seed) 12g', 'Bo He 6g'],
    acupoints: ['LR3 (Taichong) - Meredakan stres Qi Hati', 'ST44 (Neiting) - Titik Ying-Spring membersihkan panas Lambung', 'LI11 (Quchi) - Membersihkan panas sistemik', 'ST25 (Tianshu)', 'LI4 (Hegu)', 'PC6 (Neiguan)'],
    masterTungPoints: ['11.17 Muxue (Sangat efektif menenangkan Hati dan mengontrol nafsu makan emosional)', 'Huantiao / Zishen'],
    dietAdvice: 'Sayuran hijau pahit (pare, selada air, mentimun), Lidah buaya, Teh krisan (Ju Hua), Biji selasih, Labu siam rebus, Tahu putih kukus.',
    dietAvoid: 'HINDARI: Makanan pedas menyengat (cabai, merica, durian), daging kambing/sapi berlemak, kopi berlebih, alkohol, makanan panggang/barbeque.',
    teaRecommendation: 'Seduhan Bunga Krisan (Ju Hua) + Biji Jue Ming Zi (Cassia) + Daun Mint segar.'
  },
  spleen_kidney_yang_deficiency: {
    id: 'spleen_kidney_yang_deficiency',
    name: 'Defisiensi Yang Limpa dan Ginjal (Metabolisme Sangat Lambat)',
    pinyin: 'Pí Shèn Yáng Xū (脾肾阳虚)',
    pathogenesis: 'Kekurangan api Yang menurunkan laju metabolisme basal secara drastis, tubuh menimbun cairan dingin dan lemak pasif meski makan sedikit.',
    symptoms: ['Sangat takut dingin (kaki dan tangan selalu dingin)', 'Pinggang dan lutut pegal linu dingin', 'Makan sedikit tapi berat badan mudah naik drastis', 'Wajah pucat dan sembab di pagi hari', 'Sering buang air kecil di malam hari, urin jernih', 'Kurang bersemangat/mudah lelah'],
    tongue: 'Badan lidah pucat kelabu kebiruan, basah berair (watery/slippery), lapisan sabur putih tipis basah.',
    pulse: 'Nadi Tenggelam, Lambat dan Lemah (Chen Chi Ruo Mai / Deep, Slow & Frail Pulse).',
    principle: 'Wen Bu Pi Shen, Hua Qi Xing Shui (Menghangatkan dan Menutrisi Yang Limpa-Ginjal, Melancarkan Qi dan Mengalirkan Air).',
    herbalFormula: 'Jin Gui Shen Qi Wan (金匮肾气丸) atau Zhen Wu Tang (真武汤) dimodifikasi.',
    herbs: ['Rou Gui 5g', 'Fu Zi (Pao) 6g', 'Bai Zhu 12g', 'Fu Ling 15g', 'Yin Yang Huo 10g', 'Huang Qi 20g', 'Shan Yao 15g'],
    acupoints: ['GV4 (Mingmen) - Titik Gerbang Kehidupan (Moxibustion)', 'CV4 (Guanyuan) - Penguat Yang Asal', 'BL23 (Shenshu) - Shu Ginjal', 'BL20 (Pishu) - Shu Limpa', 'KI3 (Taixi) - Yuan Source Ginjal', 'ST36 (Zusanli) - Moxa dianjurkan'],
    masterTungPoints: ['77.18 Shenguan (Titik Gerbang Ginjal Master Tung - luar biasa untuk Yang Xu)', 'Tongguan, Tongshan (77.08-77.09)'],
    dietAdvice: 'Makanan hangat berenergi: Sup iga herbal, Jahe merah, Lada hitam sedikit, Kayu manis, Daun bawang, Walnut (Kacang kenari), Biji wijen hitam, Beras merah hangat.',
    dietAvoid: 'HINDARI: SEMUA minuman es, makanan dingin dari kulkas, semangka/melon berlebih di malam hari, ruangan ber-AC terlalu dingin.',
    teaRecommendation: 'Seduhan Kayu Manis (Rou Gui) + Jahe Merah + Gula Aren Sedikit (hangat).'
  },
  yin_deficiency_empty_heat: {
    id: 'yin_deficiency_empty_heat',
    name: 'Defisiensi Yin dengan Panas Kosong (Kurus/Underweight atau Dysbiosis)',
    pinyin: 'Yīn Xū Nèi Rè (阴虚内热)',
    pathogenesis: 'Kekurangan cairan Yin tubuh membuat api internal membakar jaringan, menyebabkan berat badan sulit naik (kurus kering) atau mudah haus.',
    symptoms: ['Badan kurus sulit gemuk', 'Telapak tangan dan kaki terasa panas (Wu Xin Fan Re)', 'Berkeringat malam (night sweats)', 'Mulut dan tenggorokan sering kering', 'Tidur gelisah/insomnia ringan', 'Pipi sering memerah di sore hari'],
    tongue: 'Badan lidah merah kecil/kering, sabur lidah sangat tipis, mengelupas (peeled coat), atau lidah tanpa sabur (Geographic/Mirror tongue) dengan retakan halus.',
    pulse: 'Nadi Halus dan Cepat (Xi Shu Mai / Thready & Rapid Pulse).',
    principle: 'Zi Yin Qing Re, Sheng Jin Run Zao (Menutrisi Cairan Yin, Membersihkan Panas Kosong, Menghasilkan Cairan Tubuh).',
    herbalFormula: 'Zhi Bai Di Huang Wan (知柏地黄丸) atau Sha Shen Mai Dong Tang (沙参麦冬汤).',
    herbs: ['Bei Sha Shen 12g', 'Mai Dong 12g', 'Sheng Di Huang 15g', 'Yu Zhu 10g', 'Shan Yao 15g', 'Bai He (Lilium) 12g', 'Gou Qi Zi 10g'],
    acupoints: ['KI3 (Taixi) - Menutrisi Yin Ginjal', 'SP6 (Sanyinjiao) - Titik pertemuan 3 Yin Kaki', 'KI6 (Zhaohai) - Melembabkan tenggorokan dan Yin', 'LU7 (Lieque) - Membuka Yin Qiao Mai', 'CV4 (Guanyuan)', 'HT7 (Shenmen)'],
    masterTungPoints: ['Tianhuang, Dihuang, Renhuang (Tiga Kuning Bawah / Sanhuang Bawah)', 'Shui Jin, Shui Tong'],
    dietAdvice: 'Makanan berair penutrisi Yin: Sup jamur salju (Yin Er / Tremella), Buah pir rebus, Madu murni, Biji teratai (Lian Zi), Susu kedelai murni hangat, Labu air, Daging bebek kukus.',
    dietAvoid: 'HINDARI: Makanan pedas cabe/lada/bawang mentah, makanan gorengan kering bertepung, kopi pekat, begadang lewat tengah malam.',
    teaRecommendation: 'Seduhan Jamur Salju (Yin Er) + Biji Goji Berry (Gou Qi Zi) + Buah Pir.'
  }
};

export const BMIKomplitPanel: React.FC = () => {
  // Patient Profile & Anthropometry States
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [recordNumber, setRecordNumber] = useState<string>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState<number | ''>('');
  const [hip, setHip] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);
  const [bmiStandard, setBmiStandard] = useState<'asia' | 'who'>('asia');
  const [customSyndrome, setCustomSyndrome] = useState<string>('auto');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  
  // Clinic info from local storage
  const [clinicName, setClinicName] = useState<string>('KLINIK TCMPRO MACIOCIA');
  const [clinicAddress, setClinicAddress] = useState<string>('Pusat Layanan Akupunktur & Herbal Holistik');
  const [clinicPhone, setClinicPhone] = useState<string>('0812-XXXX-XXXX');

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate initial record number
    const randId = 'TCM-BMI-' + Math.floor(100000 + Math.random() * 900000);
    setRecordNumber(randId);

    try {
      const raw = localStorage.getItem('tcm_app_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.clinicName) setClinicName(parsed.clinicName);
        if (parsed.clinicAddress) setClinicAddress(parsed.clinicAddress);
        if (parsed.clinicPhone) setClinicPhone(parsed.clinicPhone);
      }
    } catch (e) {}
  }, []);

  // Calculation Engines
  const calculateBMI = (): number | null => {
    if (!weight || !height) return null;
    const heightInMeters = Number(height) / 100;
    if (heightInMeters <= 0) return null;
    return Number(weight) / (heightInMeters * heightInMeters);
  };

  const bmi = calculateBMI();

  // Categories based on selected standard
  const getBMICategory = (bmiVal: number) => {
    if (bmiStandard === 'who') {
      if (bmiVal < 16.0) return { label: 'Severe Underweight (Kurus Berat)', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', status: 'underweight_severe', scoreGrade: 'Danger' };
      if (bmiVal < 18.5) return { label: 'Underweight (Kurus Ringan)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', status: 'underweight', scoreGrade: 'Perhatian' };
      if (bmiVal < 25.0) return { label: 'Normal / Ideal (Berat Badan Sehat)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', status: 'normal', scoreGrade: 'Optimal' };
      if (bmiVal < 30.0) return { label: 'Overweight (Kelebihan Berat Badan)', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', status: 'overweight', scoreGrade: 'Beresiko' };
      if (bmiVal < 35.0) return { label: 'Obese Class I (Obesitas Derajat I)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', status: 'obese_1', scoreGrade: 'Tinggi' };
      if (bmiVal < 40.0) return { label: 'Obese Class II (Obesitas Derajat II)', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', status: 'obese_2', scoreGrade: 'Sangat Tinggi' };
      return { label: 'Obese Class III (Obesitas Ekstrem / Morbid)', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', status: 'obese_3', scoreGrade: 'Kritis' };
    } else {
      // Asia-Pacific standard (WHO Western Pacific Region - WPRO)
      if (bmiVal < 18.5) return { label: 'Underweight (Berat Badan Kurang)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', status: 'underweight', scoreGrade: 'Perhatian' };
      if (bmiVal < 23.0) return { label: 'Normal (Ideal Asia-Pasifik)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', status: 'normal', scoreGrade: 'Optimal' };
      if (bmiVal < 25.0) return { label: 'Overweight / At Risk (Beresiko)', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', status: 'overweight', scoreGrade: 'Beresiko' };
      if (bmiVal < 30.0) return { label: 'Obese Class I (Obesitas Derajat I)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', status: 'obese_1', scoreGrade: 'Tinggi' };
      return { label: 'Obese Class II (Obesitas Derajat II Berat)', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', status: 'obese_2', scoreGrade: 'Sangat Tinggi' };
    }
  };

  const category = bmi ? getBMICategory(bmi) : null;

  // Ideal Body Weight formulas
  const calculateBrocaIBW = (): number | null => {
    if (!height) return null;
    const h = Number(height);
    if (gender === 'male') {
      return (h - 100) - ((h - 100) * 0.10);
    } else {
      return (h - 100) - ((h - 100) * 0.15);
    }
  };

  const calculateDevineIBW = (): number | null => {
    if (!height) return null;
    const hInches = Number(height) / 2.54;
    const over5Feet = Math.max(0, hInches - 60);
    if (gender === 'male') {
      return 50 + 2.3 * over5Feet;
    } else {
      return 45.5 + 2.3 * over5Feet;
    }
  };

  const calculateNormalWeightRange = () => {
    if (!height) return null;
    const hM = Number(height) / 100;
    const minBMI = 18.5;
    const maxBMI = bmiStandard === 'asia' ? 22.9 : 24.9;
    return {
      min: minBMI * (hM * hM),
      max: maxBMI * (hM * hM)
    };
  };

  const brocaIBW = calculateBrocaIBW();
  const devineIBW = calculateDevineIBW();
  const normalRange = calculateNormalWeightRange();

  // Weight Difference target
  const getWeightTargetDiff = (): { diff: number; text: string; action: 'maintain' | 'lose' | 'gain' } | null => {
    if (!weight || !brocaIBW) return null;
    const currentW = Number(weight);
    const diff = currentW - brocaIBW;
    if (Math.abs(diff) < 1.0) {
      return { diff: 0, text: 'Berat badan sudah berada di titik ideal.', action: 'maintain' };
    }
    if (diff > 0) {
      return { diff: Math.abs(diff), text: `Perlu menurunkan ${Math.abs(diff).toFixed(1)} kg untuk mencapai berat ideal.`, action: 'lose' };
    } else {
      return { diff: Math.abs(diff), text: `Perlu menaikkan ${Math.abs(diff).toFixed(1)} kg untuk mencapai berat ideal.`, action: 'gain' };
    }
  };

  const weightTarget = getWeightTargetDiff();

  // BMR & TDEE Calculations
  // Mifflin-St Jeor (Standard Emas Medis)
  const calculateMifflinBMR = (): number | null => {
    if (!weight || !height || !age) return null;
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (gender === 'male') {
      return (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      return (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
  };

  // Harris-Benedict (Revisi Roza and Shizgal)
  const calculateHarrisBMR = (): number | null => {
    if (!weight || !height || !age) return null;
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (gender === 'male') {
      return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      return 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }
  };

  const bmrMifflin = calculateMifflinBMR();
  const bmrHarris = calculateHarrisBMR();
  const tdee = bmrMifflin ? bmrMifflin * activityLevel : null;

  // Calorie Target breakdown
  const calorieGoals = tdee ? {
    maintenance: Math.round(tdee),
    mildDeficit: Math.round(tdee - 300), // -0.3 kg / week
    standardDeficit: Math.round(tdee - 500), // -0.5 kg / week
    intenseDeficit: Math.max(1200, Math.round(tdee - 750)), // -0.75 kg / week (min 1200 kcal safe limit)
    mildSurplus: Math.round(tdee + 350) // +0.35 kg / week
  } : null;

  // Estimated Body Fat % (Deurenberg Formula)
  const calculateBodyFatPercentage = (): { fatPercent: number; category: string } | null => {
    if (!bmi || !age) return null;
    const isMale = gender === 'male' ? 1 : 0;
    // Formula: (1.20 × BMI) + (0.23 × Age) − (10.8 × gender) − 5.4 (where male=1, female=0)
    const fat = (1.20 * bmi) + (0.23 * Number(age)) - (10.8 * isMale) - 5.4;
    const clampedFat = Math.max(3, Math.min(60, fat));

    let cat = 'Normal';
    if (gender === 'male') {
      if (clampedFat < 6) cat = 'Esensial (Sangat Rendah)';
      else if (clampedFat <= 13) cat = 'Atletis';
      else if (clampedFat <= 17) cat = 'Fit / Bugar';
      else if (clampedFat <= 24) cat = 'Normal / Sehat';
      else cat = 'Tinggi / Obesitas';
    } else {
      if (clampedFat < 14) cat = 'Esensial (Sangat Rendah)';
      else if (clampedFat <= 20) cat = 'Atletis';
      else if (clampedFat <= 24) cat = 'Fit / Bugar';
      else if (clampedFat <= 31) cat = 'Normal / Sehat';
      else cat = 'Tinggi / Obesitas';
    }

    return { fatPercent: clampedFat, category: cat };
  };

  const bodyFat = calculateBodyFatPercentage();

  // Waist and Hip ratios
  const calculateWHR = (): { ratio: number; risk: string } | null => {
    if (!waist || !hip) return null;
    const r = Number(waist) / Number(hip);
    let risk = 'Normal';
    if (gender === 'male') {
      if (r > 0.90) risk = 'Tinggi (Resiko Obesitas Sentral/Kardiometabolik)';
    } else {
      if (r > 0.85) risk = 'Tinggi (Resiko Obesitas Sentral/Kardiometabolik)';
    }
    return { ratio: r, risk };
  };

  const calculateWHtR = (): { ratio: number; status: string } | null => {
    if (!waist || !height) return null;
    const r = Number(waist) / Number(height);
    let status = 'Ideal';
    if (r < 0.40) status = 'Terlalu Kurus';
    else if (r <= 0.49) status = 'Sehat / Proporsional';
    else if (r <= 0.59) status = 'Kelebihan Lemak Abdominal';
    else status = 'Resiko Penyakit Metabolik Sangat Tinggi';
    return { ratio: r, status };
  };

  const whrData = calculateWHR();
  const whtrData = calculateWHtR();

  // Water Requirement (ml / day)
  const calculateWaterIntake = (): { min: number; max: number; glasses: number } | null => {
    if (!weight) return null;
    const w = Number(weight);
    const minMl = w * 30;
    const maxMl = w * 35;
    return { min: minMl, max: maxMl, glasses: Math.round(minMl / 250) };
  };

  const waterIntake = calculateWaterIntake();

  // Determine Active TCM Syndrome
  const getSelectedSyndrome = (): TCMSyndromeBMI => {
    if (customSyndrome !== 'auto' && TCM_BMI_SYNDROMES[customSyndrome]) {
      return TCM_BMI_SYNDROMES[customSyndrome];
    }
    
    // Auto matching based on BMI
    if (!bmi) return TCM_BMI_SYNDROMES.spleen_qi_damp;
    if (bmi < 18.5) return TCM_BMI_SYNDROMES.yin_deficiency_empty_heat;
    if (bmi >= 30.0) return TCM_BMI_SYNDROMES.phlegm_damp;
    if (bmi >= 25.0) return TCM_BMI_SYNDROMES.spleen_qi_damp;
    return TCM_BMI_SYNDROMES.spleen_qi_damp;
  };

  const activeSyndrome = getSelectedSyndrome();

  // Export handlers
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExportingPDF(true);
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If height exceeds 1 page, split or add image
      if (pdfHeight > 297) {
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = 295;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      const patientNameSafe = name.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Pasien';
      pdf.save(`Laporan_Lengkap_BMI_TCM_${patientNameSafe}_${recordNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Terjadi kendala saat mencetak PDF. Silakan gunakan tombol Cetak Langsung / Print.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadExcelCSV = () => {
    if (!bmi) return;
    const patientName = name || 'Pasien';
    const dateStr = new Date().toLocaleDateString('id-ID');

    const csvRows = [
      ['LAPORAN REKAM DATA ANTROPOMETRI & CDSS TCM (TCMPRO)'],
      ['No. Rekam Medis', recordNumber],
      ['Tanggal Pemeriksaan', dateStr],
      ['Nama Klinik', clinicName],
      ['Alamat Klinik', clinicAddress],
      ['Telepon', clinicPhone],
      [''],
      ['DATA IDENTITAS PASIEN'],
      ['Nama Pasien', patientName],
      ['Alamat Pasien', address || '-'],
      ['No. HP/Telepon', phone || '-'],
      ['Gender', gender === 'male' ? 'Laki-Laki' : 'Perempuan'],
      ['Usia (Tahun)', age ? `${age} Tahun` : '-'],
      ['Tinggi Badan (cm)', height ? `${height} cm` : '-'],
      ['Berat Badan (kg)', weight ? `${weight} kg` : '-'],
      ['Lingkar Pinggang (cm)', waist ? `${waist} cm` : '-'],
      ['Lingkar Pinggul (cm)', hip ? `${hip} cm` : '-'],
      [''],
      ['HASIL ANALISIS BIOMETRIK MODERN'],
      ['Skor BMI (Body Mass Index)', bmi.toFixed(2)],
      ['Standar Klasifikasi', bmiStandard === 'asia' ? 'Asia-Pasifik (WPRO)' : 'WHO Global'],
      ['Kategori Status Gizi', category?.label || '-'],
      ['Berat Badan Ideal (Formula Broca)', brocaIBW ? `${brocaIBW.toFixed(1)} kg` : '-'],
      ['Berat Badan Ideal (Formula Devine)', devineIBW ? `${devineIBW.toFixed(1)} kg` : '-'],
      ['Rentang Berat Sehat Normal', normalRange ? `${normalRange.min.toFixed(1)} kg - ${normalRange.max.toFixed(1)} kg` : '-'],
      ['Target Selisih Berat Badan', weightTarget ? `${weightTarget.diff.toFixed(1)} kg (${weightTarget.action.toUpperCase()})` : '-'],
      ['BMR (Mifflin-St Jeor)', bmrMifflin ? `${bmrMifflin.toFixed(0)} kcal/hari` : '-'],
      ['BMR (Harris-Benedict)', bmrHarris ? `${bmrHarris.toFixed(0)} kcal/hari` : '-'],
      ['TDEE (Total Kebutuhan Kalori)', tdee ? `${tdee.toFixed(0)} kcal/hari` : '-'],
      ['Target Kalori Defisit (-500 kcal)', calorieGoals ? `${calorieGoals.standardDeficit} kcal/hari` : '-'],
      ['Target Kalori Surplus (+350 kcal)', calorieGoals ? `${calorieGoals.mildSurplus} kcal/hari` : '-'],
      ['Estimasi Lemak Tubuh (%)', bodyFat ? `${bodyFat.fatPercent.toFixed(1)}% (${bodyFat.category})` : '-'],
      ['Rasio Pinggang/Pinggul (WHR)', whrData ? `${whrData.ratio.toFixed(2)} (${whrData.risk})` : '-'],
      ['Rasio Pinggang/Tinggi (WHtR)', whtrData ? `${whtrData.ratio.toFixed(2)} (${whtrData.status})` : '-'],
      ['Kebutuhan Cairan / Air Putih', waterIntake ? `${(waterIntake.min / 1000).toFixed(1)} - ${(waterIntake.max / 1000).toFixed(1)} Liter/hari (${waterIntake.glasses} Gelas)` : '-'],
      [''],
      ['DIFERENSIASI SINDROM TCM (BIAN ZHENG) & TERAPI HOLISTIK'],
      ['Pola Sindrom TCM', `${activeSyndrome.name} (${activeSyndrome.pinyin})`],
      ['Patogenesis', activeSyndrome.pathogenesis],
      ['Manifestasi Lidah (She Xiang)', activeSyndrome.tongue],
      ['Manifestasi Nadi (Mai Xiang)', activeSyndrome.pulse],
      ['Prinsip Terapi (Zhi Ze)', activeSyndrome.principle],
      ['Resep Herbal Klasik', activeSyndrome.herbalFormula],
      ['Komposisi Herbal', activeSyndrome.herbs.join(' | ')],
      ['Titik Akupunktur 14 Meridian', activeSyndrome.acupoints.join(' | ')],
      ['Titik Master Tung', activeSyndrome.masterTungPoints.join(' | ')],
      ['Panduan Terapi Makanan (Shi Liao)', activeSyndrome.dietAdvice],
      ['Makanan Yang Harus Dipantang', activeSyndrome.dietAvoid],
      ['Rekomendasi Teh Herbal', activeSyndrome.teaRecommendation]
    ];

    const csvContent = "\uFEFF" + csvRows.map(e => e.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_BMI_TCM_${patientName.replace(/\s+/g, '_')}_${recordNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    if (!bmi) return;
    const exportObject = {
      recordNumber,
      timestamp: new Date().toISOString(),
      clinic: {
        name: clinicName,
        address: clinicAddress,
        phone: clinicPhone
      },
      patient: {
        name: name || 'Pasien',
        address,
        phone,
        gender,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        waist: waist ? Number(waist) : null,
        hip: hip ? Number(hip) : null,
        activityLevel
      },
      anthropometry: {
        bmi: Number(bmi.toFixed(2)),
        standard: bmiStandard,
        category: category?.label,
        status: category?.status,
        brocaIdealWeightKg: brocaIBW ? Number(brocaIBW.toFixed(1)) : null,
        devineIdealWeightKg: devineIBW ? Number(devineIBW.toFixed(1)) : null,
        normalWeightRangeKg: normalRange,
        weightTargetKg: weightTarget,
        bmrMifflinKcal: bmrMifflin ? Math.round(bmrMifflin) : null,
        bmrHarrisKcal: bmrHarris ? Math.round(bmrHarris) : null,
        tdeeKcal: tdee ? Math.round(tdee) : null,
        calorieGoals,
        bodyFatPercentage: bodyFat,
        whr: whrData,
        whtr: whtrData,
        hydration: waterIntake
      },
      tcmDifferentiation: activeSyndrome
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_BMI_TCM_${(name || 'Pasien').replace(/\s+/g, '_')}_${recordNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCleanSummaryText = () => {
    if (!bmi) return '';
    return `
========================================
📋 LAPORAN ANALISIS LENGKAP BMI & CDSS TCM
🏥 ${clinicName}
========================================
No. RM     : ${recordNumber}
Tgl        : ${new Date().toLocaleDateString('id-ID')}
Nama       : ${name || 'Pasien'}
Gender     : ${gender === 'male' ? 'Laki-Laki' : 'Perempuan'}
Usia       : ${age ? `${age} Tahun` : '-'}
TB / BB    : ${height} cm / ${weight} kg
${waist ? `Lingkar Pinggang : ${waist} cm` : ''}

📊 HASIL ANALISIS BIOMETRIK:
• Skor BMI      : ${bmi.toFixed(1)} kg/m² (${category?.label})
• Berat Ideal   : ${brocaIBW?.toFixed(1)} kg (Rentang Sehat: ${normalRange?.min.toFixed(1)} - ${normalRange?.max.toFixed(1)} kg)
• Target BB     : ${weightTarget?.text}
• BMR Basal     : ${bmrMifflin?.toFixed(0)} kcal/hari
• TDEE Harian   : ${tdee?.toFixed(0)} kcal/hari
• Target Defisit: ${calorieGoals?.standardDeficit} kcal/hari (turun 0.5 kg/minggu)
${bodyFat ? `• Estimasi Lemak: ${bodyFat.fatPercent.toFixed(1)}% (${bodyFat.category})` : ''}
• Kebutuhan Air : ${(waterIntake?.min ? waterIntake.min / 1000 : 2).toFixed(1)} Liter/hari (${waterIntake?.glasses || 8} Gelas)

🌿 DIFERENSIASI SINDROM TCM (BIAN ZHENG):
• Sindrom       : ${activeSyndrome.name}
• Prinsip Terapi: ${activeSyndrome.principle}
• Herbal Formula: ${activeSyndrome.herbalFormula}
• Titik Akupunktur Utama:
  ${activeSyndrome.acupoints.join('\n  ')}
• Titik Master Tung:
  ${activeSyndrome.masterTungPoints.join('\n  ')}

🥗 REKOMENDASI POLA MAKAN (SHI LIAO):
${activeSyndrome.dietAdvice}

🚫 PANTANGAN MAKANAN:
${activeSyndrome.dietAvoid}

🍵 TEH HERBAL HARIAN:
${activeSyndrome.teaRecommendation}
========================================
`.trim();
  };

  const handleDownloadTXT = () => {
    const text = getCleanSummaryText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ringkasan_BMI_TCM_${(name || 'Pasien').replace(/\s+/g, '_')}_${recordNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    const text = getCleanSummaryText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      alert("Gagal menyalin. Silakan coba lagi.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-200 text-xs font-black uppercase tracking-widest border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              CDSS Biometrik & Antropometri TCM
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Kalkulator BMI Komplit & Rekam Data Pasien
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl leading-relaxed">
              Analisis komprehensif Body Mass Index (Asia-Pasifik & WHO), BMR, TDEE, % Lemak Tubuh, Kebutuhan Kalori & Air, dilengkapi Diferensiasi Sindrom TCM, Titik Akupunktur & Resep Herbal.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-center">
              <span className="block text-[10px] text-teal-200 uppercase font-black">Standar</span>
              <span className="text-xs font-bold">{bmiStandard === 'asia' ? 'Asia-Pasifik' : 'WHO Global'}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-center">
              <span className="block text-[10px] text-teal-200 uppercase font-black">No. RM</span>
              <span className="text-xs font-mono font-bold text-amber-300">{recordNumber}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Input Form (Left) & Real-time Live Result (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input Data Pasien & Parameter Biometrik (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">1. Data Pasien & Antropometri</h2>
                    <p className="text-xs text-slate-400">Masukkan identitas dan ukuran tubuh</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setName('Pasien Contoh');
                    setAge(35);
                    setGender('female');
                    setHeight(160);
                    setWeight(68);
                    setWaist(84);
                    setHip(98);
                    setAddress('Jl. Sehat No. 12, Jakarta');
                    setPhone('081234567890');
                  }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-xl transition-all"
                  title="Isi contoh data cepat"
                >
                  Contoh Data
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap Pasien <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Ny. Siti Rahma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      No. Telepon / WA
                    </label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                      placeholder="0812xxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Alamat Singkat
                    </label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                      placeholder="Kota / Domisili"
                    />
                  </div>
                </div>

                {/* Gender & Age */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Jenis Kelamin
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                      <button 
                        type="button"
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${gender === 'male' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                        onClick={() => setGender('male')}
                      >
                        Pria
                      </button>
                      <button 
                        type="button"
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${gender === 'female' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
                        onClick={() => setGender('female')}
                      >
                        Wanita
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Usia (Tahun) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                      placeholder="35"
                    />
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Tinggi Badan (cm) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={height} 
                        onChange={e => setHeight(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-bold pr-12"
                        placeholder="165"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Berat Badan (kg) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={weight} 
                        onChange={e => setWeight(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-bold pr-12"
                        placeholder="65.5"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
                    </div>
                  </div>
                </div>

                {/* Waist & Hip Circumferences */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>L. Pinggang</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={waist} 
                        onChange={e => setWaist(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium pr-12"
                        placeholder="e.g. 80"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>L. Pinggul</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={hip} 
                        onChange={e => setHip(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium pr-12"
                        placeholder="e.g. 95"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
                    </div>
                  </div>
                </div>

                {/* Standar BMI Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Standar Klasifikasi BMI
                    </label>
                    <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                      {bmiStandard === 'asia' ? 'Asia-Pasifik (WPRO)' : 'WHO Internasional'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                      type="button"
                      className={`py-2 text-xs font-black rounded-xl transition-all ${bmiStandard === 'asia' ? 'bg-white text-teal-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                      onClick={() => setBmiStandard('asia')}
                    >
                      Asia-Pasifik (Lebih Ketat)
                    </button>
                    <button 
                      type="button"
                      className={`py-2 text-xs font-black rounded-xl transition-all ${bmiStandard === 'who' ? 'bg-white text-teal-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                      onClick={() => setBmiStandard('who')}
                    >
                      WHO Global (Kaukasia)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1 leading-snug">
                    <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    {bmiStandard === 'asia' 
                      ? 'Standar Asia-Pasifik mendefinisikan Normal pada BMI 18.5 - 22.9 karena resiko diabetes/kardiometabolik Asia muncul pada BMI lebih rendah.' 
                      : 'Standar WHO Global menetapkan Normal pada BMI 18.5 - 24.9.'}
                  </p>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Tingkat Aktivitas Fisik (Pengali TDEE)
                  </label>
                  <select 
                    value={activityLevel}
                    onChange={e => setActivityLevel(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-xs font-bold text-slate-800"
                  >
                    <option value={1.2}>Sedentary (Sangat Jarang / Bekerja di Meja - x1.2)</option>
                    <option value={1.375}>Ringan (Olahraga Ringan 1-3 hari/minggu - x1.375)</option>
                    <option value={1.55}>Sedang (Olahraga Moderat 3-5 hari/minggu - x1.55)</option>
                    <option value={1.725}>Tinggi / Aktif (Latihan Keras 6-7 hari/minggu - x1.725)</option>
                    <option value={1.9}>Sangat Aktif (Atlet / Pekerja Fisik Berat 2x sehari - x1.9)</option>
                  </select>
                </div>

                {/* TCM Syndrome Selector Override */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Diferensiasi Sindrom TCM
                    </label>
                  </div>
                  <select 
                    value={customSyndrome}
                    onChange={e => setCustomSyndrome(e.target.value)}
                    className="w-full p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-xs font-bold text-emerald-900"
                  >
                    <option value="auto">✨ Otomatis Berdasarkan Skor BMI & Profil</option>
                    <option value="spleen_qi_damp">Defisiensi Qi Limpa & Kelembaban (Pí Qì Xū Shī Shèng)</option>
                    <option value="phlegm_damp">Penumpukan Dahak-Kelembaban (Tán Shī Zǔ Zhì)</option>
                    <option value="liver_qi_stomach_heat">Stagnasi Hati & Panas Lambung / Nafsu Makan Berlebih</option>
                    <option value="spleen_kidney_yang_deficiency">Defisiensi Yang Limpa-Ginjal (Metabolisme Sangat Lambat)</option>
                    <option value="yin_deficiency_empty_heat">Defisiensi Yin & Panas Kosong (Kurus / Underweight)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Quick Export Panel in Sidebar */}
            {bmi && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-teal-400">
                    <Download className="w-4 h-4" /> Download & Export Lengkap
                  </h3>
                  <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800 font-bold">
                    Siap Unduh
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    type="button"
                    onClick={handleDownloadPDF} 
                    disabled={isExportingPDF}
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    {isExportingPDF ? 'Membuat PDF...' : 'Download PDF'}
                  </button>

                  <button 
                    type="button"
                    onClick={handleDownloadExcelCSV} 
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel / CSV
                  </button>

                  <button 
                    type="button"
                    onClick={handleDownloadJSON} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95"
                  >
                    <Code2 className="w-4 h-4" />
                    JSON Data
                  </button>

                  <button 
                    type="button"
                    onClick={handleDownloadTXT} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    File TXT
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <button 
                    type="button"
                    onClick={handleCopyToClipboard} 
                    className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Tersalin!' : 'Copy Ringkasan (WhatsApp)'}
                  </button>

                  <button 
                    type="button"
                    onClick={handlePrint} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-2xl border border-slate-700 transition-all"
                    title="Cetak Langsung (Browser Print)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Live Printable Report View (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {bmi ? (
              <div className="space-y-6">
                
                {/* Visual Printable Document Container */}
                <div 
                  ref={printRef} 
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 text-slate-800 print:shadow-none print:border-none print:p-0"
                >
                  
                  {/* Clinic Header / Letterhead */}
                  <div className="border-b-2 border-teal-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-800 text-white rounded-xl">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{clinicName}</h2>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{clinicAddress} • Telp: {clinicPhone}</p>
                    </div>

                    <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-2xl w-full md:w-auto border md:border-none border-slate-200">
                      <div className="text-xs font-mono font-bold text-teal-800">NO. RM: {recordNumber}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Patient Info Bar */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pasien</span>
                      <span className="font-black text-slate-800 text-sm">{name || 'Pasien Tanpa Nama'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Gender / Usia</span>
                      <span className="font-bold text-slate-700">{gender === 'male' ? 'Pria' : 'Wanita'}, {age ? `${age} Th` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tinggi / Berat</span>
                      <span className="font-bold text-slate-700">{height} cm / {weight} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Standar BMI</span>
                      <span className="font-bold text-teal-700">{bmiStandard === 'asia' ? 'Asia-Pasifik' : 'WHO Global'}</span>
                    </div>
                  </div>

                  {/* Big BMI Score & Visual Gauge */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white text-center relative overflow-hidden shadow-md">
                    <div className="relative z-10 space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-teal-300">
                        Body Mass Index (BMI)
                      </p>
                      
                      <div className="text-6xl md:text-7xl font-black tracking-tighter text-white">
                        {bmi.toFixed(1)}
                        <span className="text-lg font-medium text-teal-300 ml-2">kg/m²</span>
                      </div>

                      <div className="pt-2">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${category?.bg} ${category?.color} shadow-sm`}>
                          {category?.label}
                        </span>
                      </div>

                      {/* Visual BMI Scale Bar */}
                      <div className="pt-4 max-w-md mx-auto space-y-1">
                        <div className="h-3 w-full bg-slate-700/60 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                          <div className="h-full bg-blue-500 rounded-l-full" style={{ width: '25%' }} title="Underweight (<18.5)"></div>
                          <div className="h-full bg-emerald-500" style={{ width: bmiStandard === 'asia' ? '25%' : '30%' }} title="Normal"></div>
                          <div className="h-full bg-amber-500" style={{ width: bmiStandard === 'asia' ? '15%' : '20%' }} title="Overweight"></div>
                          <div className="h-full bg-orange-500" style={{ width: '20%' }} title="Obese I"></div>
                          <div className="h-full bg-rose-600 rounded-r-full" style={{ width: '15%' }} title="Obese II"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Kurus (&lt;18.5)</span>
                          <span>Normal ({bmiStandard === 'asia' ? '18.5-22.9' : '18.5-24.9'})</span>
                          <span>Obesitas (&ge;{bmiStandard === 'asia' ? '25' : '30'})</span>
                        </div>
                      </div>

                      {/* Target status phrase */}
                      {weightTarget && (
                        <p className="text-xs text-teal-200 font-medium pt-2">
                          🎯 {weightTarget.text} (Berat Ideal: <strong className="text-white font-bold">{brocaIBW?.toFixed(1)} kg</strong>)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 6 Key Anthropometry & Energy Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    
                    {/* Ideal Weight */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Scale className="w-4 h-4 text-teal-600" />
                        <span>Berat Ideal (IBW)</span>
                      </div>
                      <div className="text-xl font-black text-slate-800">
                        {brocaIBW?.toFixed(1)} <span className="text-xs font-medium text-slate-500">kg</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Rentang: {normalRange?.min.toFixed(1)} - {normalRange?.max.toFixed(1)} kg
                      </p>
                    </div>

                    {/* BMR (Basal Metabolic Rate) */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>BMR (Basal)</span>
                      </div>
                      <div className="text-xl font-black text-slate-800">
                        {bmrMifflin?.toFixed(0)} <span className="text-xs font-medium text-slate-500">kcal</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Energi minimal saat istirahat</p>
                    </div>

                    {/* TDEE (Total Daily Energy Expenditure) */}
                    <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold uppercase tracking-wider">
                        <Activity className="w-4 h-4 text-teal-600" />
                        <span>TDEE Harian</span>
                      </div>
                      <div className="text-xl font-black text-teal-900">
                        {tdee?.toFixed(0)} <span className="text-xs font-medium text-teal-700">kcal</span>
                      </div>
                      <p className="text-[10px] text-teal-700">Kebutuhan total harian</p>
                    </div>

                    {/* Target Defisit / Surplus Kalori */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Target Diet</span>
                      </div>
                      <div className="text-xl font-black text-slate-800">
                        {calorieGoals ? (bmi >= 23 ? calorieGoals.standardDeficit : calorieGoals.maintenance) : '-'} <span className="text-xs font-medium text-slate-500">kcal</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {bmi >= 23 ? 'Defisit -500 kcal (turun 0.5kg/mgg)' : 'Maintenance kalori seimbang'}
                      </p>
                    </div>

                    {/* Estimasi % Lemak Tubuh */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span>Estimasi Lemak</span>
                      </div>
                      <div className="text-xl font-black text-slate-800">
                        {bodyFat ? `${bodyFat.fatPercent.toFixed(1)}%` : '-'}
                      </div>
                      <p className="text-[10px] text-slate-500">{bodyFat?.category || 'Deurenberg Formula'}</p>
                    </div>

                    {/* Kebutuhan Hidrasi / Air Putih */}
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase tracking-wider">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <span>Kebutuhan Air</span>
                      </div>
                      <div className="text-xl font-black text-blue-900">
                        {waterIntake ? (waterIntake.min / 1000).toFixed(1) : '-'} <span className="text-xs font-medium text-blue-700">Liter</span>
                      </div>
                      <p className="text-[10px] text-blue-700">Setara {waterIntake?.glasses || 8} gelas air putih/hari</p>
                    </div>

                  </div>

                  {/* Optional Waist & Hip Ratios (if entered) */}
                  {(whrData || whtrData) && (
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {whrData && (
                        <div>
                          <span className="font-black text-amber-900 block">Rasio Pinggang/Pinggul (WHR): {whrData.ratio.toFixed(2)}</span>
                          <span className="text-amber-700 text-[11px]">{whrData.risk}</span>
                        </div>
                      )}
                      {whtrData && (
                        <div>
                          <span className="font-black text-amber-900 block">Rasio Pinggang/Tinggi (WHtR): {whtrData.ratio.toFixed(2)}</span>
                          <span className="text-amber-700 text-[11px]">{whtrData.status}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CDSS TCM HOLISTIC SECTION (Maciocia Model) */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        Diferensiasi Sindrom TCM & Protokol Terapi Klinis
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Maciocia TCM
                      </span>
                    </div>

                    {/* Syndrome Banner */}
                    <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-black text-emerald-950 text-base">{activeSyndrome.name}</h4>
                        <span className="text-xs font-mono text-emerald-700 font-bold">{activeSyndrome.pinyin}</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {activeSyndrome.pathogenesis}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs border-t border-emerald-200/60">
                        <div>
                          <span className="font-bold text-emerald-900">👅 Manifestasi Lidah:</span>
                          <p className="text-emerald-800 text-[11px]">{activeSyndrome.tongue}</p>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-900">💓 Manifestasi Nadi:</span>
                          <p className="text-emerald-800 text-[11px]">{activeSyndrome.pulse}</p>
                        </div>
                      </div>

                      <div className="pt-2 text-xs">
                        <span className="font-black text-emerald-950 uppercase tracking-wider block text-[10px]">Prinsip Terapi (Zhi Ze):</span>
                        <span className="font-bold text-emerald-800">{activeSyndrome.principle}</span>
                      </div>
                    </div>

                    {/* Herbal Formula & Composition */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-purple-600" />
                        Resep Herbal Klasik & Modifikasi
                      </h4>
                      <p className="text-sm font-bold text-purple-900">
                        {activeSyndrome.herbalFormula}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeSyndrome.herbs.map((h, i) => (
                          <span key={i} className="text-[11px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Acupoints 14 Meridian & Master Tung */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-teal-600" />
                          Titik Akupunktur 14 Meridian
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {activeSyndrome.acupoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-teal-600 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          Titik Master Tung (Metabolisme)
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {activeSyndrome.masterTungPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dietetics, Pantangan & Teh Herbal */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-600" />
                        Terapi Nutrisi & Diet Alami (Shi Liao)
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                          <span className="font-bold text-emerald-900 block mb-1">✅ Makanan Yang Disarankan:</span>
                          <p className="text-emerald-800 leading-relaxed">{activeSyndrome.dietAdvice}</p>
                        </div>

                        <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                          <span className="font-bold text-rose-900 block mb-1">❌ Pantangan Makanan:</span>
                          <p className="text-rose-800 leading-relaxed">{activeSyndrome.dietAvoid}</p>
                        </div>

                        <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                          <span className="font-bold text-amber-900 block mb-1">🍵 Rekomendasi Seduhan / Teh Herbal:</span>
                          <p className="text-amber-800 leading-relaxed">{activeSyndrome.teaRecommendation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor / Practitioner Signature Footer in Print */}
                    <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                      <div>
                        <p className="font-bold text-slate-800">{clinicName}</p>
                        <p className="text-[10px]">Dokumen Rekam Medis Sah TCMPRO</p>
                      </div>
                      <div className="text-center w-44">
                        <p className="text-[10px] text-slate-400 mb-12">Terapis / Konsultan TCM,</p>
                        <div className="border-b border-slate-400 w-full"></div>
                        <p className="text-[10px] text-slate-600 mt-1">( Tanda Tangan & Nama Terang )</p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Bottom Action Export Bar */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-800">Unduh Laporan Lengkap Pasien</h4>
                    <p className="text-xs text-slate-400">Pilih format unduhan data sesuai kebutuhan klinis</p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button 
                      type="button"
                      onClick={handleDownloadPDF} 
                      disabled={isExportingPDF}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      {isExportingPDF ? 'Membuat PDF...' : 'Unduh PDF'}
                    </button>

                    <button 
                      type="button"
                      onClick={handleDownloadExcelCSV} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Unduh Excel / CSV
                    </button>

                    <button 
                      type="button"
                      onClick={handleDownloadJSON} 
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black py-2.5 px-3.5 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Code2 className="w-4 h-4" />
                      JSON
                    </button>

                    <button 
                      type="button"
                      onClick={handleDownloadTXT} 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-2.5 px-3.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 border border-slate-200"
                    >
                      <FileText className="w-4 h-4" />
                      TXT
                    </button>

                    <button 
                      type="button"
                      onClick={handleCopyToClipboard} 
                      className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                    >
                      {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Tersalin!' : 'Copy Ringkasan'}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center border border-teal-100 shadow-inner">
                  <Scale className="w-10 h-10" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-lg font-black text-slate-800">Menunggu Data Pasien</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Silakan isi Tinggi Badan, Berat Badan, Usia, dan Gender pada formulir di sebelah kiri untuk mengkalkulasi laporan lengkap & mengunduh hasilnya.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default BMIKomplitPanel;
