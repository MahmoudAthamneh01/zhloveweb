/**
 * Persistent Data Management for ZH-Love
 * حفظ البيانات بشكل دائم حتى بعد تسجيل الخروج
 */

// مفاتيح البيانات الدائمة
const PERSISTENT_KEYS = [
  'approvedClans',
  'clanApplications', 
  'clanJoinApplications',
  'clanWars',
  'approvedStreamers',
  'tournamentData',
  'forumPosts',
  'replays',
  'rankings'
];

// مفاتيح بيانات المستخدم
const USER_KEYS = [
  'currentUser',
  'zh_love_token',
  'zh_love_user',
  'userGold',
  'userPreferences'
];

/**
 * Initialize persistent data
 */
export function initializePersistentData() {
  // إنشاء البيانات الأساسية إذا لم تكن موجودة
  if (!localStorage.getItem('approvedClans')) {
    const defaultClans = [
      {
        id: 1,
        name: 'نسور الشرق',
        tag: 'EAST',
        description: 'عشيرة نخبة للاعبين المحترفين في الشرق الأوسط',
        ownerId: 1,
        members: [],
        level: 5,
        totalMembers: 0,
        maxMembers: 50,
        totalTrophies: 25000,
        winRate: 87,
        warWinRate: 87,
        isVerified: true,
        isElite: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'الذئاب المحاربة',
        tag: 'WAR',
        description: 'كلان محترف متخصص في المعارك الاستراتيجية',
        ownerId: 2,
        members: [],
        level: 8,
        totalMembers: 0,
        maxMembers: 30,
        totalTrophies: 35000,
        winRate: 92,
        warWinRate: 88,
        isVerified: true,
        isElite: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'عاصفة الصحراء',
        tag: 'STORM',
        description: 'كلان سريع ومتميز في المعارك السريعة',
        ownerId: 3,
        members: [],
        level: 6,
        totalMembers: 0,
        maxMembers: 40,
        totalTrophies: 28000,
        winRate: 85,
        warWinRate: 82,
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('approvedClans', JSON.stringify(defaultClans));
  }
  
  // إنشاء حروب العشائر التجريبية
  if (!localStorage.getItem('clanWars')) {
    const defaultWars = [
      {
        id: 1,
        challengerClanId: 3,
        challengedClanId: 1,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // غداً
        duration: 48,
        rules: 'حرب كاملة بجميع الوحدات المتاحة',
        challengeMessage: 'تحدي من عاصفة الصحراء لنسور الشرق',
        status: 'pending',
        createdBy: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        challengerClanId: 2,
        challengedClanId: 1,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // بعد 3 أيام
        duration: 72,
        rules: 'حرب نخبة للمحترفين فقط - بدون قيود',
        challengeMessage: 'معركة الأساطير بين النخبة',
        status: 'pending',
        createdBy: 2,
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('clanWars', JSON.stringify(defaultWars));
  }
  
  // إنشاء طلبات انضمام العشائر
  if (!localStorage.getItem('clanJoinApplications')) {
    localStorage.setItem('clanJoinApplications', JSON.stringify([]));
  }
  
  // إنشاء طلبات إنشاء العشائر
  if (!localStorage.getItem('clanApplications')) {
    localStorage.setItem('clanApplications', JSON.stringify([]));
  }
  
  // إنشاء رصيد الذهب الافتراضي
  if (!localStorage.getItem('userGold')) {
    localStorage.setItem('userGold', '25000');
  }
}

/**
 * Create or update user clan membership
 */
export function ensureUserClanMembership(userId, username = 'مستخدم تجريبي') {
  const clans = JSON.parse(localStorage.getItem('approvedClans') || '[]');
  
  // البحث عن عشيرة المستخدم
  const userClan = clans.find(clan => 
    clan.ownerId === userId || 
    (clan.members && clan.members.some(member => member.id === userId))
  );
  
  // إذا لم يكن المستخدم في أي عشيرة، أضفه لعشيرة نسور الشرق
  if (!userClan) {
    const eastClan = clans.find(clan => clan.tag === 'EAST');
    if (eastClan) {
      // جعل المستخدم مالك العشيرة
      eastClan.ownerId = userId;
      
      // إضافة المستخدم كقائد
      const userMember = {
        id: userId,
        username: username,
        role: 'leader',
        joinedAt: new Date().toISOString(),
        contributionPoints: 5000
      };
      
      // إزالة المستخدم من قائمة الأعضاء إن وجد
      eastClan.members = eastClan.members.filter(member => member.id !== userId);
      
      // إضافة المستخدم كقائد
      eastClan.members.unshift(userMember);
      eastClan.totalMembers = eastClan.members.length;
      
      // حفظ التحديثات
      localStorage.setItem('approvedClans', JSON.stringify(clans));
      
      console.log(`تم تعيين المستخدم ${username} كقائد لعشيرة نسور الشرق`);
      
      return eastClan;
    }
  }
  
  return userClan;
}

/**
 * Clean user data on logout (keep persistent data)
 */
export function cleanUserDataOnLogout() {
  USER_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('تم مسح بيانات المستخدم مع الحفاظ على البيانات الدائمة');
}

/**
 * Get clan by user ID
 */
export function getUserClan(userId) {
  const clans = JSON.parse(localStorage.getItem('approvedClans') || '[]');
  
  return clans.find(clan => 
    clan.ownerId === userId || 
    (clan.members && clan.members.some(member => member.id === userId))
  );
}

/**
 * Get user role in clan
 */
export function getUserClanRole(userId, clanId) {
  const clans = JSON.parse(localStorage.getItem('approvedClans') || '[]');
  const clan = clans.find(c => c.id === clanId);
  
  if (!clan) return null;
  
  // Check if owner
  if (clan.ownerId === userId) {
    return 'leader';
  }
  
  // Check in members
  const member = clan.members.find(m => m.id === userId);
  return member ? member.role : null;
}

/**
 * Save data permanently
 */
export function savePersistentData(key, data) {
  if (PERSISTENT_KEYS.includes(key)) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Load persistent data
 */
export function loadPersistentData(key) {
  if (PERSISTENT_KEYS.includes(key)) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return null;
}

// تهيئة البيانات عند تحميل الصفحة
if (typeof window !== 'undefined') {
  initializePersistentData();
} 