// Mock tournament data with real information
export const mockTournaments = [
  {
    id: 1,
    name: "بطولة الجنرالات الكبرى 2024",
    description: "البطولة الأكبر والأهم في المجتمع العربي للجنرالات زيرو ساعة. تضم أقوى اللاعبين والكلانات من جميع أنحاء المنطقة في منافسة شرسة على لقب البطل.",
    banner: "/uploads/tournaments/grand-championship-2024.jpg",
    image: "/uploads/tournaments/grand-championship-2024.jpg",
    type: "single_elimination",
    format: "1v1",
    status: "registration",
    gameMode: "tournament",
    maxParticipants: 128,
    currentParticipants: 89,
    prizePool: 2500,
    currency: "USD",
    entryFee: 15,
    startDate: "2024-03-15T18:00:00Z",
    endDate: "2024-03-22T22:00:00Z",
    registrationDeadline: "2024-03-14T23:59:59Z",
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-20T14:30:00Z",
    organizer: {
      id: 1,
      username: "admin",
      displayName: "إدارة ZH-Love",
      avatar: "/uploads/avatars/admin.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Desert Fury", "Tournament Desert", "Scorched Earth", "Winter Wolf", "Green Pastures"],
      gameSettings: "الإعدادات الرسمية للبطولة",
      timeLimit: 45,
      allowedFactions: ["الصين", "الولايات المتحدة", "الحرس الجمهوري العراقي"],
      banRules: "ممنوع استخدام الغش أو التلاعب"
    },
    prizes: [
      { position: 1, amount: 1000, title: "البطل الأول", description: "الفائز بالمركز الأول" },
      { position: 2, amount: 600, title: "الوصيف", description: "الفائز بالمركز الثاني" },
      { position: 3, amount: 400, title: "المركز الثالث", description: "الفائز بالمركز الثالث" },
      { position: 4, amount: 200, title: "المركز الرابع", description: "الفائز بالمركز الرابع" },
      { position: 5, amount: 150, title: "أفضل 8", description: "جائزة أفضل 8 متسابقين" },
      { position: 6, amount: 150, title: "أفضل 8", description: "جائزة أفضل 8 متسابقين" }
    ],
    sponsors: [
      { name: "ZH-Love Gaming", logo: "/uploads/sponsors/zh-love-logo.png", url: "https://zh-love.com" }
    ],
    participants: [
      { id: 2, username: "zh_master", displayName: "أحمد المحترف", avatar: "/uploads/avatars/zh_master.jpg", rank: 1, rating: 2200, registeredAt: "2024-02-16T09:00:00Z" },
      { id: 3, username: "generals_pro", displayName: "محمد البطل", avatar: "/uploads/avatars/generals_pro.jpg", rank: 2, rating: 2350, registeredAt: "2024-02-16T10:30:00Z" },
      { id: 4, username: "tactical_gamer", displayName: "علي التكتيكي", avatar: "/uploads/avatars/tactical_gamer.jpg", rank: 3, rating: 1950, registeredAt: "2024-02-16T11:15:00Z" },
      { id: 5, username: "desert_storm", displayName: "خالد العاصفة", avatar: "/uploads/avatars/desert_storm.jpg", rank: 4, rating: 1800, registeredAt: "2024-02-16T12:00:00Z" },
      { id: 6, username: "zh_legend", displayName: "عمر الأسطورة", avatar: "/uploads/avatars/zh_legend.jpg", rank: 5, rating: 2100, registeredAt: "2024-02-16T13:30:00Z" }
    ],
    stats: {
      totalViews: 15420,
      totalMatches: 0,
      averageMatchDuration: 0,
      totalPrizeMoney: 2500,
      popularityScore: 9.2
    },
    tags: ["بطولة كبرى", "جوائز مالية", "احترافي", "عربي"],
    featured: true,
    isRegistered: false,
    canRegister: true,
    region: "MENA",
    difficulty: "pro",
    streamUrl: "https://twitch.tv/zh-love-gaming",
    discordServer: "https://discord.gg/zh-love",
    contactInfo: {
      discord: "https://discord.gg/zh-love",
      telegram: "https://t.me/zh_love_gaming",
      email: "tournaments@zh-love.com"
    },
    maps: ["Desert Fury", "Tournament Desert", "Scorched Earth", "Winter Wolf", "Green Pastures"],
    organizerId: 1,
    organizerName: "إدارة ZH-Love"
  },
  {
    id: 2,
    name: "تحدي الكلانات الأسبوعي",
    description: "مسابقة أسبوعية بين الكلانات العربية لتحديد الأقوى. كل كلان يرسل أفضل 5 لاعبين للتنافس في معارك ملحمية.",
    banner: "/uploads/tournaments/weekly-clan-battle.jpg",
    image: "/uploads/tournaments/weekly-clan-battle.jpg",
    type: "round_robin",
    format: "team",
    status: "in_progress",
    gameMode: "clan_war",
    maxParticipants: 20,
    currentParticipants: 16,
    prizePool: 500,
    currency: "USD",
    entryFee: 0,
    startDate: "2024-02-26T19:00:00Z",
    endDate: "2024-03-03T21:00:00Z",
    registrationDeadline: "2024-02-25T23:59:59Z",
    createdAt: "2024-02-18T12:00:00Z",
    updatedAt: "2024-02-26T20:15:00Z",
    organizer: {
      id: 1,
      username: "admin",
      displayName: "إدارة ZH-Love",
      avatar: "/uploads/avatars/admin.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Desert Fury", "Tournament Desert", "Urban Combat", "Industrial Zone"],
      gameSettings: "5v5 - حرب الكلانات",
      timeLimit: 60,
      allowedFactions: ["جميع الفصائل"],
      banRules: "لا يسمح بالتكرار في نفس الجولة"
    },
    prizes: [
      { position: 1, amount: 250, title: "الكلان الأول", description: "الكلان الفائز بالمركز الأول" },
      { position: 2, amount: 150, title: "الكلان الثاني", description: "الكلان الفائز بالمركز الثاني" },
      { position: 3, amount: 100, title: "الكلان الثالث", description: "الكلان الفائز بالمركز الثالث" }
    ],
    participants: [
      { id: 1, teamName: "الذئاب المحاربة", avatar: "/uploads/clans/war-wolves.jpg", rank: 1, rating: 2400, registeredAt: "2024-02-19T10:00:00Z" },
      { id: 2, teamName: "أسياد الحرب", avatar: "/uploads/clans/war-lords.jpg", rank: 2, rating: 2350, registeredAt: "2024-02-19T11:00:00Z" },
      { id: 3, teamName: "عاصفة الصحراء", avatar: "/uploads/clans/desert-storm.jpg", rank: 3, rating: 2200, registeredAt: "2024-02-19T12:00:00Z" },
      { id: 4, teamName: "فرسان الشرق", avatar: "/uploads/clans/eastern-knights.jpg", rank: 4, rating: 2100, registeredAt: "2024-02-19T13:00:00Z" }
    ],
    stats: {
      totalViews: 8950,
      totalMatches: 24,
      averageMatchDuration: 1845,
      totalPrizeMoney: 500,
      popularityScore: 8.5
    },
    tags: ["كلانات", "أسبوعي", "فرق", "مجاني"],
    featured: true,
    isRegistered: false,
    canRegister: false,
    region: "MENA",
    difficulty: "advanced",
    streamUrl: "https://youtube.com/watch?v=zh-love-clans",
    discordServer: "https://discord.gg/zh-love-clans",
    contactInfo: {
      discord: "https://discord.gg/zh-love-clans",
      telegram: "https://t.me/zh_love_clans",
      email: "clans@zh-love.com"
    },
    maps: ["Desert Fury", "Tournament Desert", "Urban Combat", "Industrial Zone"],
    organizerId: 1,
    organizerName: "إدارة ZH-Love"
  },
  {
    id: 3,
    name: "كأس الشرق الأوسط",
    description: "بطولة إقليمية تجمع أفضل اللاعبين من الشرق الأوسط في منافسة قوية. تتميز بنظام الإقصاء المزدوج الذي يعطي فرصة ثانية للجميع.",
    banner: "/uploads/tournaments/middle-east-cup.jpg",
    image: "/uploads/tournaments/middle-east-cup.jpg",
    type: "double_elimination",
    format: "1v1",
    status: "completed",
    gameMode: "ranked",
    maxParticipants: 64,
    currentParticipants: 64,
    prizePool: 1200,
    currency: "USD",
    entryFee: 8,
    startDate: "2024-02-01T20:00:00Z",
    endDate: "2024-02-15T22:00:00Z",
    registrationDeadline: "2024-01-31T23:59:59Z",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-02-15T22:30:00Z",
    organizer: {
      id: 6,
      username: "zh_legend",
      displayName: "عمر الأسطورة",
      avatar: "/uploads/avatars/zh_legend.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Desert Fury", "Winter Wolf", "Tournament Desert", "Green Pastures", "Scorched Earth"],
      gameSettings: "إعدادات المباراة الرسمية",
      timeLimit: 40,
      allowedFactions: ["الصين", "الولايات المتحدة", "الحرس الجمهوري العراقي"],
      banRules: "3 خرائط محظورة لكل لاعب"
    },
    prizes: [
      { position: 1, amount: 600, title: "بطل الشرق الأوسط", description: "الفائز بكأس الشرق الأوسط" },
      { position: 2, amount: 300, title: "الوصيف", description: "وصيف كأس الشرق الأوسط" },
      { position: 3, amount: 200, title: "المركز الثالث", description: "المركز الثالث في كأس الشرق الأوسط" },
      { position: 4, amount: 100, title: "المركز الرابع", description: "المركز الرابع في كأس الشرق الأوسط" }
    ],
    participants: [
      { id: 6, username: "zh_legend", displayName: "عمر الأسطورة", avatar: "/uploads/avatars/zh_legend.jpg", rank: 1, rating: 2100, registeredAt: "2024-01-16T10:00:00Z", placement: 1 },
      { id: 7, username: "air_commander", displayName: "سامي الطيار", avatar: "/uploads/avatars/air_commander.jpg", rank: 2, rating: 1850, registeredAt: "2024-01-16T11:00:00Z", placement: 2 },
      { id: 8, username: "tank_master", displayName: "يوسف الدبابة", avatar: "/uploads/avatars/tank_master.jpg", rank: 3, rating: 1750, registeredAt: "2024-01-16T12:00:00Z", placement: 3 },
      { id: 3, username: "generals_pro", displayName: "محمد البطل", avatar: "/uploads/avatars/generals_pro.jpg", rank: 4, rating: 2350, registeredAt: "2024-01-16T13:00:00Z", placement: 4 }
    ],
    stats: {
      totalViews: 22340,
      totalMatches: 126,
      averageMatchDuration: 1620,
      totalPrizeMoney: 1200,
      popularityScore: 9.0
    },
    tags: ["إقليمي", "مكتمل", "جوائز", "احترافي"],
    featured: false,
    isRegistered: false,
    canRegister: false,
    region: "MENA",
    difficulty: "pro",
    streamUrl: null,
    discordServer: "https://discord.gg/middle-east-cup",
    contactInfo: {
      discord: "https://discord.gg/middle-east-cup",
      telegram: "https://t.me/middle_east_cup",
      email: "legend@zh-love.com"
    },
    maps: ["Desert Fury", "Winter Wolf", "Tournament Desert", "Green Pastures", "Scorched Earth"],
    organizerId: 6,
    organizerName: "عمر الأسطورة"
  },
  {
    id: 4,
    name: "بطولة المبتدئين الشهرية",
    description: "بطولة خاصة للاعبين الجدد في المجتمع. فرصة رائعة لتعلم الأساسيات وخوض تجربة البطولات الأولى مع لاعبين في نفس المستوى.",
    banner: "/uploads/tournaments/beginners-monthly.jpg",
    image: "/uploads/tournaments/beginners-monthly.jpg",
    type: "single_elimination",
    format: "1v1",
    status: "completed",
    gameMode: "casual",
    maxParticipants: 32,
    currentParticipants: 32,
    prizePool: 200,
    currency: "USD",
    entryFee: 0,
    startDate: "2024-02-10T18:00:00Z",
    endDate: "2024-02-17T20:00:00Z",
    registrationDeadline: "2024-02-09T23:59:59Z",
    createdAt: "2024-02-01T14:00:00Z",
    updatedAt: "2024-02-17T20:30:00Z",
    organizer: {
      id: 4,
      username: "tactical_gamer",
      displayName: "علي التكتيكي",
      avatar: "/uploads/avatars/tactical_gamer.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Green Pastures", "Tournament Desert", "Desert Fury"],
      gameSettings: "إعدادات المبتدئين",
      timeLimit: 30,
      allowedFactions: ["الصين", "الولايات المتحدة"],
      banRules: "للمبتدئين فقط - تحت مستوى 50"
    },
    prizes: [
      { position: 1, amount: 100, title: "بطل المبتدئين", description: "الفائز الأول في بطولة المبتدئين" },
      { position: 2, amount: 60, title: "الوصيف", description: "الوصيف في بطولة المبتدئين" },
      { position: 3, amount: 40, title: "المركز الثالث", description: "المركز الثالث في بطولة المبتدئين" }
    ],
    participants: [
      { id: 15, username: "new_player_01", displayName: "محمد الجديد", avatar: "/uploads/avatars/default.jpg", rank: 1, rating: 1200, registeredAt: "2024-02-02T09:00:00Z", placement: 1 },
      { id: 16, username: "beginner_pro", displayName: "أحمد المبتدئ", avatar: "/uploads/avatars/default.jpg", rank: 2, rating: 1150, registeredAt: "2024-02-02T10:00:00Z", placement: 2 },
      { id: 17, username: "learning_fast", displayName: "سارة المتعلمة", avatar: "/uploads/avatars/default.jpg", rank: 3, rating: 1100, registeredAt: "2024-02-02T11:00:00Z", placement: 3 }
    ],
    stats: {
      totalViews: 3450,
      totalMatches: 31,
      averageMatchDuration: 1200,
      totalPrizeMoney: 200,
      popularityScore: 7.8
    },
    tags: ["مبتدئين", "مجاني", "تعليمي", "مكتمل"],
    featured: false,
    isRegistered: false,
    canRegister: false,
    region: "MENA",
    difficulty: "beginner",
    streamUrl: null,
    discordServer: "https://discord.gg/beginners-tournament",
    contactInfo: {
      discord: "https://discord.gg/beginners-tournament",
      telegram: "https://t.me/beginners_tournament",
      email: "tactical@zh-love.com"
    },
    maps: ["Green Pastures", "Tournament Desert", "Desert Fury"],
    organizerId: 4,
    organizerName: "علي التكتيكي"
  },
  {
    id: 5,
    name: "تحدي الـ 2v2 الكبير",
    description: "أول بطولة 2v2 في المجتمع العربي. فرق من لاعبين يتنافسون في معارك تكتيكية مثيرة تتطلب التنسيق والعمل الجماعي.",
    banner: "/uploads/tournaments/2v2-challenge.jpg",
    image: "/uploads/tournaments/2v2-challenge.jpg",
    type: "single_elimination",
    format: "2v2",
    status: "upcoming",
    gameMode: "ranked",
    maxParticipants: 48,
    currentParticipants: 24,
    prizePool: 800,
    currency: "USD",
    entryFee: 20,
    startDate: "2024-03-20T19:00:00Z",
    endDate: "2024-03-27T21:00:00Z",
    registrationDeadline: "2024-03-18T23:59:59Z",
    createdAt: "2024-02-20T16:00:00Z",
    updatedAt: "2024-02-25T12:00:00Z",
    organizer: {
      id: 2,
      username: "zh_master",
      displayName: "أحمد المحترف",
      avatar: "/uploads/avatars/zh_master.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Desert Fury", "Tournament Desert", "Urban Combat", "Mountain Pass", "Coastal Clash"],
      gameSettings: "2v2 - إعدادات البطولة",
      timeLimit: 50,
      allowedFactions: ["جميع الفصائل"],
      banRules: "فريق واحد لكل لاعب"
    },
    prizes: [
      { position: 1, amount: 400, title: "الفريق الأول", description: "الفريق الفائز بالمركز الأول" },
      { position: 2, amount: 200, title: "الفريق الثاني", description: "الفريق الفائز بالمركز الثاني" },
      { position: 3, amount: 120, title: "الفريق الثالث", description: "الفريق الفائز بالمركز الثالث" },
      { position: 4, amount: 80, title: "الفريق الرابع", description: "الفريق الفائز بالمركز الرابع" }
    ],
    participants: [
      { id: 20, teamName: "النسور الذهبية", teammates: [
        { id: 2, username: "zh_master", displayName: "أحمد المحترف" },
        { id: 3, username: "generals_pro", displayName: "محمد البطل" }
      ], avatar: "/uploads/teams/golden-eagles.jpg", rank: 1, rating: 2400, registeredAt: "2024-02-21T10:00:00Z" },
      { id: 21, teamName: "الصقور الحمراء", teammates: [
        { id: 6, username: "zh_legend", displayName: "عمر الأسطورة" },
        { id: 7, username: "air_commander", displayName: "سامي الطيار" }
      ], avatar: "/uploads/teams/red-hawks.jpg", rank: 2, rating: 2200, registeredAt: "2024-02-21T11:00:00Z" }
    ],
    stats: {
      totalViews: 5670,
      totalMatches: 0,
      averageMatchDuration: 0,
      totalPrizeMoney: 800,
      popularityScore: 8.2
    },
    tags: ["2v2", "فرق", "جوائز", "قادم"],
    featured: true,
    isRegistered: false,
    canRegister: true,
    region: "MENA",
    difficulty: "advanced",
    streamUrl: "https://youtube.com/watch?v=2v2-challenge",
    discordServer: "https://discord.gg/2v2-challenge",
    contactInfo: {
      discord: "https://discord.gg/2v2-challenge",
      telegram: "https://t.me/2v2_challenge",
      email: "zhmaster@zh-love.com"
    },
    maps: ["Desert Fury", "Tournament Desert", "Urban Combat", "Mountain Pass", "Coastal Clash"],
    organizerId: 2,
    organizerName: "أحمد المحترف"
  },
  {
    id: 6,
    name: "بطولة الأساطير",
    description: "البطولة الأسطورية التي تجمع أعظم اللاعبين في تاريخ الجنرالات العرب. منافسة ملحمية بين الأبطال القدامى والجدد.",
    banner: "/uploads/tournaments/legends-tournament.jpg",
    image: "/uploads/tournaments/legends-tournament.jpg",
    type: "double_elimination",
    format: "1v1",
    status: "in_progress",
    gameMode: "tournament",
    maxParticipants: 32,
    currentParticipants: 32,
    prizePool: 5000,
    currency: "USD",
    entryFee: 50,
    startDate: "2024-02-28T20:00:00Z",
    endDate: "2024-03-10T22:00:00Z",
    registrationDeadline: "2024-02-27T23:59:59Z",
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-02-28T21:00:00Z",
    organizer: {
      id: 1,
      username: "admin",
      displayName: "إدارة ZH-Love",
      avatar: "/uploads/avatars/admin.jpg",
      verified: true
    },
    rules: {
      mapPool: ["Desert Fury", "Tournament Desert", "Winter Wolf", "Scorched Earth", "Green Pastures", "Urban Combat"],
      gameSettings: "إعدادات الأساطير - أقصى صعوبة",
      timeLimit: 60,
      allowedFactions: ["جميع الفصائل والجنرالات"],
      banRules: "للأساطير فقط - تقييم 1800+"
    },
    prizes: [
      { position: 1, amount: 2000, title: "أسطورة الجنرالات", description: "اللقب الأسطوري الأعلى" },
      { position: 2, amount: 1200, title: "الأسطورة الثانية", description: "وصيف الأساطير" },
      { position: 3, amount: 800, title: "الأسطورة الثالثة", description: "المركز الثالث للأساطير" },
      { position: 4, amount: 500, title: "الأسطورة الرابعة", description: "المركز الرابع للأساطير" },
      { position: 5, amount: 250, title: "نصف النهائي", description: "جائزة نصف النهائي" },
      { position: 6, amount: 250, title: "نصف النهائي", description: "جائزة نصف النهائي" }
    ],
    participants: [
      { id: 2, username: "zh_master", displayName: "أحمد المحترف", avatar: "/uploads/avatars/zh_master.jpg", rank: 1, rating: 2200, registeredAt: "2024-02-11T09:00:00Z" },
      { id: 3, username: "generals_pro", displayName: "محمد البطل", avatar: "/uploads/avatars/generals_pro.jpg", rank: 2, rating: 2350, registeredAt: "2024-02-11T10:00:00Z" },
      { id: 6, username: "zh_legend", displayName: "عمر الأسطورة", avatar: "/uploads/avatars/zh_legend.jpg", rank: 3, rating: 2100, registeredAt: "2024-02-11T11:00:00Z" },
      { id: 4, username: "tactical_gamer", displayName: "علي التكتيكي", avatar: "/uploads/avatars/tactical_gamer.jpg", rank: 4, rating: 1950, registeredAt: "2024-02-11T12:00:00Z" }
    ],
    stats: {
      totalViews: 45670,
      totalMatches: 18,
      averageMatchDuration: 2100,
      totalPrizeMoney: 5000,
      popularityScore: 9.8
    },
    tags: ["أساطير", "جوائز عالية", "نخبة", "جاري"],
    featured: true,
    isRegistered: false,
    canRegister: false,
    region: "MENA",
    difficulty: "pro",
    streamUrl: "https://twitch.tv/legends-tournament",
    discordServer: "https://discord.gg/legends-tournament",
    contactInfo: {
      discord: "https://discord.gg/legends-tournament",
      telegram: "https://t.me/legends_tournament",
      email: "legends@zh-love.com"
    },
    maps: ["Desert Fury", "Tournament Desert", "Winter Wolf", "Scorched Earth", "Green Pastures", "Urban Combat"],
    organizerId: 1,
    organizerName: "إدارة ZH-Love"
  }
];

// Helper functions
export const getTournamentById = (id) => {
  return mockTournaments.find(t => t.id === parseInt(id));
};

export const getTournamentsByStatus = (status) => {
  return mockTournaments.filter(t => t.status === status);
};

export const getFeaturedTournaments = () => {
  return mockTournaments.filter(t => t.featured);
};

export const getActiveTournaments = () => {
  return mockTournaments.filter(t => ['registration', 'in_progress'].includes(t.status));
};

export const getCompletedTournaments = () => {
  return mockTournaments.filter(t => t.status === 'completed');
};

export const getUpcomingTournaments = () => {
  return mockTournaments.filter(t => t.status === 'upcoming');
};

export const getTournamentStats = () => {
  return {
    total: mockTournaments.length,
    active: getActiveTournaments().length,
    completed: getCompletedTournaments().length,
    upcoming: getUpcomingTournaments().length,
    totalParticipants: mockTournaments.reduce((sum, t) => sum + t.currentParticipants, 0),
    totalPrizes: mockTournaments.reduce((sum, t) => sum + t.prizePool, 0)
  };
};

export default mockTournaments; 