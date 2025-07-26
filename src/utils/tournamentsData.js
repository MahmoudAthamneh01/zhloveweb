// Tournament Data - Real approved tournaments
export const tournaments = [
  {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    name: 'بطولة الجنرالات الكبرى 2024',
    name_en: 'Grand Generals Championship 2024',
    description: 'البطولة الأكبر في الشرق الأوسط للعبة الجنرالات زيرو ساعة مع أقوى اللاعبين العرب',
    description_en: 'The biggest tournament in the Middle East for Command & Conquer: Generals Zero Hour with the strongest Arab players',
    image: '/images/tournaments/grand-championship-2024.jpg',
    banner: '/images/tournaments/grand-championship-2024-banner.jpg',
    type: 'single_elimination',
    format: '1v1',
    gameMode: 'zero_hour',
    region: 'middle_east',
    resources: '10k',
    maxParticipants: 128,
    participants: 89,
    prizePool: 2500.00,
    prizeCurrency: 'USD',
    entryFee: 15.00,
    entryCurrency: 'USD',
    registrationStart: '2024-02-01T00:00:00Z',
    registrationEnd: '2024-02-28T23:59:59Z',
    startDate: '2024-03-01T18:00:00Z',
    endDate: '2024-03-15T22:00:00Z',
    status: 'registration_open',
    visibility: 'public',
    featured: true,
    featuredPriority: 1,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love',
      telegram: 'https://t.me/zh_love',
      email: 'tournaments@zh-love.com'
    },
    rules: 'قوانين البطولة الرسمية مع حظر التكتيكات غير العادلة والغش',
    rulesEn: 'Official tournament rules with prohibition of unfair tactics and cheating',
    maps: ['Tournament Desert', 'Tournament Island', 'Tournament City', 'Scorched Earth', 'Winter Wolf'],
    streamUrl: 'https://youtube.com/live/zh-love-grand-championship',
    discordUrl: 'https://discord.gg/zh-love-tournament',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z'
  },
  {
    id: 2,
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    name: 'تحدي الكلانات الأسبوعي',
    name_en: 'Weekly Clan Challenge',
    description: 'مسابقة أسبوعية بين الكلانات العربية لتحديد الكلان الأقوى',
    description_en: 'Weekly competition between Arab clans to determine the strongest clan',
    image: '/images/tournaments/weekly-clan-challenge.jpg',
    banner: '/images/tournaments/weekly-clan-challenge-banner.jpg',
    type: 'round_robin',
    format: 'clan_war',
    gameMode: 'classic',
    region: 'middle_east',
    resources: '20k',
    maxParticipants: 20,
    participants: 16,
    prizePool: 500.00,
    prizeCurrency: 'USD',
    entryFee: 0.00,
    entryCurrency: 'USD',
    registrationStart: '2024-02-19T00:00:00Z',
    registrationEnd: '2024-02-25T12:00:00Z',
    startDate: '2024-02-26T19:00:00Z',
    endDate: '2024-02-28T21:00:00Z',
    status: 'in_progress',
    visibility: 'public',
    featured: true,
    featuredPriority: 2,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love-clans',
      telegram: 'https://t.me/zh_love_clans'
    },
    rules: 'قوانين حرب الكلانات مع نظام النقاط والتصنيف',
    rulesEn: 'Clan war rules with points system and ranking',
    maps: ['Clan War Arena', 'Battle Desert', 'City Combat', 'Industrial Zone'],
    streamUrl: 'https://youtube.com/live/zh-love-clan-wars',
    discordUrl: 'https://discord.gg/zh-love-clans',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-02-15T14:00:00Z',
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2024-02-26T20:15:00Z'
  },
  {
    id: 3,
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    name: 'كأس الشرق الأوسط',
    name_en: 'Middle East Cup',
    description: 'كأس مميزة للاعبين من منطقة الشرق الأوسط وشمال أفريقيا',
    description_en: 'Special cup for players from Middle East and North Africa region',
    image: '/images/tournaments/middle-east-cup.jpg',
    banner: '/images/tournaments/middle-east-cup-banner.jpg',
    type: 'double_elimination',
    format: '1v1',
    gameMode: 'generals_challenge',
    region: 'middle_east',
    resources: '10k',
    maxParticipants: 64,
    participants: 64,
    prizePool: 1200.00,
    prizeCurrency: 'USD',
    entryFee: 8.00,
    entryCurrency: 'USD',
    registrationStart: '2024-01-15T00:00:00Z',
    registrationEnd: '2024-02-05T23:59:59Z',
    startDate: '2024-02-06T18:00:00Z',
    endDate: '2024-02-20T22:00:00Z',
    status: 'completed',
    visibility: 'public',
    featured: true,
    featuredPriority: 3,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love',
      email: 'middle-east-cup@zh-love.com'
    },
    rules: 'قوانين كأس الشرق الأوسط مع نظام الإقصاء المزدوج',
    rulesEn: 'Middle East Cup rules with double elimination system',
    maps: ['Desert Combat', 'Middle East', 'Oil Refinery', 'Scorched Earth', 'Urban Combat'],
    streamUrl: 'https://youtube.com/live/middle-east-cup',
    discordUrl: 'https://discord.gg/zh-love',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-01-10T12:00:00Z',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-02-20T22:00:00Z'
  },
  {
    id: 4,
    uuid: '550e8400-e29b-41d4-a716-446655440004',
    name: 'بطولة الأساطير',
    name_en: 'Legends Tournament',
    description: 'بطولة مخصصة للاعبين الأساطير والمحترفين فقط',
    description_en: 'Tournament dedicated to legendary and professional players only',
    image: '/images/tournaments/legends-tournament.jpg',
    banner: '/images/tournaments/legends-tournament-banner.jpg',
    type: 'single_elimination',
    format: '1v1',
    gameMode: 'zero_hour',
    region: 'global',
    resources: '20k',
    maxParticipants: 32,
    participants: 32,
    prizePool: 5000.00,
    prizeCurrency: 'USD',
    entryFee: 25.00,
    entryCurrency: 'USD',
    registrationStart: '2024-02-20T00:00:00Z',
    registrationEnd: '2024-03-05T23:59:59Z',
    startDate: '2024-03-06T20:00:00Z',
    endDate: '2024-03-20T23:00:00Z',
    status: 'in_progress',
    visibility: 'invite_only',
    featured: true,
    featuredPriority: 4,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love-legends',
      email: 'legends@zh-love.com'
    },
    rules: 'قوانين صارمة للمحترفين مع تحكيم مباشر',
    rulesEn: 'Strict rules for professionals with live refereeing',
    maps: ['Tournament Arena', 'Pro Battle', 'Championship Map', 'Elite Combat', 'Master Desert'],
    streamUrl: 'https://youtube.com/live/legends-tournament',
    discordUrl: 'https://discord.gg/zh-love-legends',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-02-18T16:00:00Z',
    createdAt: '2024-02-18T16:00:00Z',
    updatedAt: '2024-03-06T20:00:00Z'
  },
  {
    id: 5,
    uuid: '550e8400-e29b-41d4-a716-446655440005',
    name: 'تحدي الثنائيات الكبير',
    name_en: '2v2 Challenge Championship',
    description: 'بطولة الفرق الثنائية مع أفضل اللاعبين',
    description_en: 'Team tournament with the best players in pairs',
    image: '/images/tournaments/2v2-challenge.jpg',
    banner: '/images/tournaments/2v2-challenge-banner.jpg',
    type: 'single_elimination',
    format: '2v2',
    gameMode: 'classic',
    region: 'global',
    resources: '10k',
    maxParticipants: 48,
    participants: 24,
    prizePool: 800.00,
    prizeCurrency: 'USD',
    entryFee: 10.00,
    entryCurrency: 'USD',
    registrationStart: '2024-03-01T00:00:00Z',
    registrationEnd: '2024-03-15T23:59:59Z',
    startDate: '2024-03-16T19:00:00Z',
    endDate: '2024-03-30T21:00:00Z',
    status: 'registration_open',
    visibility: 'public',
    featured: false,
    featuredPriority: 5,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love-2v2',
      telegram: 'https://t.me/zh_love_2v2'
    },
    rules: 'قوانين الفرق الثنائية مع تنسيق خاص',
    rulesEn: '2v2 team rules with special coordination',
    maps: ['Team Battle', 'Dual Combat', 'Partner Arena', 'Cooperative Desert'],
    streamUrl: 'https://youtube.com/live/2v2-challenge',
    discordUrl: 'https://discord.gg/zh-love-2v2',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-02-25T11:00:00Z',
    createdAt: '2024-02-25T11:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 6,
    uuid: '550e8400-e29b-41d4-a716-446655440006',
    name: 'بطولة المبتدئين الشهرية',
    name_en: 'Monthly Beginners Tournament',
    description: 'بطولة شهرية مخصصة للاعبين الجدد والمبتدئين',
    description_en: 'Monthly tournament dedicated to new and beginner players',
    image: '/images/tournaments/beginners-monthly.jpg',
    banner: '/images/tournaments/beginners-monthly-banner.jpg',
    type: 'single_elimination',
    format: '1v1',
    gameMode: 'classic',
    region: 'global',
    resources: '5k',
    maxParticipants: 32,
    participants: 32,
    prizePool: 200.00,
    prizeCurrency: 'USD',
    entryFee: 0.00,
    entryCurrency: 'USD',
    registrationStart: '2024-01-01T00:00:00Z',
    registrationEnd: '2024-01-25T23:59:59Z',
    startDate: '2024-01-26T17:00:00Z',
    endDate: '2024-02-02T20:00:00Z',
    status: 'completed',
    visibility: 'public',
    featured: false,
    featuredPriority: 6,
    organizerId: 1,
    organizerName: 'إدارة ZH-Love',
    organizerContact: {
      discord: 'https://discord.gg/zh-love-beginners',
      email: 'beginners@zh-love.com'
    },
    rules: 'قوانين مبسطة للمبتدئين مع إرشادات ونصائح',
    rulesEn: 'Simplified rules for beginners with guidance and tips',
    maps: ['Training Ground', 'Beginner Desert', 'Simple Battle', 'Learning Arena'],
    streamUrl: 'https://youtube.com/live/beginners-tournament',
    discordUrl: 'https://discord.gg/zh-love-beginners',
    adminApproved: true,
    approvedBy: 1,
    approvedAt: '2024-01-05T09:00:00Z',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-02-02T20:00:00Z'
  }
];

// Tournament Statistics
export const tournamentStats = {
  totalTournaments: 6,
  activeTournaments: 4,
  completedTournaments: 2,
  totalParticipants: 277,
  totalPrizePool: 10200.00,
  featuredTournaments: 4,
  liveTournaments: 2
};

// Helper Functions
export function getTournamentById(id) {
  return tournaments.find(t => t.id === parseInt(id));
}

export function getTournamentByUuid(uuid) {
  return tournaments.find(t => t.uuid === uuid);
}

export function getFeaturedTournaments() {
  return tournaments.filter(t => t.featured).sort((a, b) => a.featuredPriority - b.featuredPriority);
}

export function getTournamentsByStatus(status) {
  return tournaments.filter(t => t.status === status);
}

export function getTournamentsByRegion(region) {
  return tournaments.filter(t => t.region === region);
}

export function getActiveTournaments() {
  return tournaments.filter(t => ['registration_open', 'in_progress'].includes(t.status));
}

export function getCompletedTournaments() {
  return tournaments.filter(t => t.status === 'completed');
}

export function formatTournamentStatus(status) {
  const statusMap = {
    'draft': 'مسودة',
    'pending_approval': 'في انتظار الموافقة',
    'approved': 'موافق عليها',
    'registration_open': 'التسجيل مفتوح',
    'registration_closed': 'التسجيل مغلق',
    'in_progress': 'جارية',
    'completed': 'مكتملة',
    'cancelled': 'ملغاة'
  };
  return statusMap[status] || status;
}

export function formatTournamentType(type) {
  const typeMap = {
    'single_elimination': 'إقصاء مفرد',
    'double_elimination': 'إقصاء مزدوج',
    'round_robin': 'دوري',
    'swiss': 'سويسري',
    'ladder': 'سلم ترقي'
  };
  return typeMap[type] || type;
}

export function formatTournamentFormat(format) {
  const formatMap = {
    '1v1': '1 ضد 1',
    '2v2': '2 ضد 2',
    '3v3': '3 ضد 3',
    '4v4': '4 ضد 4',
    'ffa': 'الكل ضد الكل',
    'clan_war': 'حرب الكلانات'
  };
  return formatMap[format] || format;
}

export function formatTournamentRegion(region) {
  const regionMap = {
    'global': 'عالمي',
    'middle_east': 'الشرق الأوسط',
    'north_africa': 'شمال أفريقيا',
    'europe': 'أوروبا',
    'asia': 'آسيا'
  };
  return regionMap[region] || region;
}

export function getTournamentStatusColor(status) {
  const colorMap = {
    'draft': 'bg-gray-600',
    'pending_approval': 'bg-yellow-600',
    'approved': 'bg-green-600',
    'registration_open': 'bg-blue-600',
    'registration_closed': 'bg-orange-600',
    'in_progress': 'bg-red-600',
    'completed': 'bg-green-700',
    'cancelled': 'bg-gray-700'
  };
  return colorMap[status] || 'bg-gray-600';
}

// Calculate prize distribution
export function calculatePrizeDistribution(prizePool, format) {
  const distributions = {
    '1v1': [
      { position: 'البطل', percentage: 50 },
      { position: 'الوصيف', percentage: 30 },
      { position: 'المركز الثالث', percentage: 20 }
    ],
    '2v2': [
      { position: 'الفريق البطل', percentage: 50 },
      { position: 'الفريق الوصيف', percentage: 30 },
      { position: 'المركز الثالث', percentage: 20 }
    ],
    'clan_war': [
      { position: 'الكلان البطل', percentage: 40 },
      { position: 'الكلان الوصيف', percentage: 25 },
      { position: 'المركز الثالث', percentage: 20 },
      { position: 'المركز الرابع', percentage: 15 }
    ]
  };

  const distribution = distributions[format] || distributions['1v1'];
  return distribution.map(prize => ({
    ...prize,
    amount: (prizePool * prize.percentage / 100).toFixed(2)
  }));
}

export default tournaments; 