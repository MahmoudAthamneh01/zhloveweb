/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "ar",
  locales: ["ar", "en"],
  namespaces: ["common", "navigation", "auth", "forum", "tournament", "clan", "streamer", "admin"],
  defaultNamespace: "common",
  i18nextServer: {
    debug: false,
    initImmediate: false,
    backend: {
      loadPath: "./src/locales/{{lng}}/{{ns}}.json",
    },
  },
  i18nextClient: {
    debug: false,
    initImmediate: false,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  },
  routes: {
    ar: {
      // Arabic routes (RTL)
      "about": "حول",
      "contact": "اتصل-بنا",
      "forum": "المنتدى",
      "tournaments": "البطولات",
      "clans": "العشائر",
      "rankings": "التصنيفات",
      "replays": "المقاطع",
      "streamers": "المذيعون",
      "support": "الدعم",
      "game-info": "معلومات-اللعبة",
      "profile": "الملف-الشخصي",
      "settings": "الإعدادات",
      "login": "تسجيل-الدخول",
      "register": "التسجيل",
      "admin": "لوحة-التحكم",
      "privacy": "سياسة-الخصوصية",
      "terms": "الشروط-والأحكام",
      "badges": "الشارات",
      "messages": "الرسائل"
    },
    en: {
      // English routes (LTR)
      "about": "about",
      "contact": "contact",
      "forum": "forum",
      "tournaments": "tournaments",
      "clans": "clans",
      "rankings": "rankings",
      "replays": "replays",
      "streamers": "streamers",
      "support": "support",
      "game-info": "game-info",
      "profile": "profile",
      "settings": "settings",
      "login": "login",
      "register": "register",
      "admin": "admin",
      "privacy": "privacy",
      "terms": "terms",
      "badges": "badges",
      "messages": "messages"
    }
  },
  showDefaultLocale: false,
  trailingSlash: "never",
}; 