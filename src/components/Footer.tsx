import React from 'react';

interface FooterProps {
  language?: 'ar' | 'en';
}

const Footer: React.FC<FooterProps> = ({ language = 'ar' }) => {
  const isRTL = language === 'ar';

  const texts = {
    ar: {
      description: 'المنصة الرسمية للاعبي جنرالز زيرو آور في الشرق الأوسط',
      pages: 'الصفحات',
      community: 'المجتمع',
      legal: 'قانوني',
      about: 'حول المنصة',
      support: 'الدعم',
      gameInfo: 'معلومات اللعبة',
      contact: 'اتصل بنا',
      forum: 'المنتدى',
      tournaments: 'البطولات',
      clans: 'العشائر',
      rankings: 'التصنيفات',
      privacy: 'سياسة الخصوصية',
      terms: 'الشروط والأحكام',
      copyright: '© 2024 ZH-Love. جميع الحقوق محفوظة.',
      madeWith: 'مبني بـ ❤️ لمجتمع جنرالز زيرو آور'
    },
    en: {
      description: 'Official platform for Command & Conquer: Generals Zero Hour players in the Middle East',
      pages: 'Pages',
      community: 'Community',
      legal: 'Legal',
      about: 'About',
      support: 'Support',
      gameInfo: 'Game Info',
      contact: 'Contact',
      forum: 'Forum',
      tournaments: 'Tournaments',
      clans: 'Clans',
      rankings: 'Rankings',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      copyright: '© 2024 ZH-Love. All rights reserved.',
      madeWith: 'Built with ❤️ for the Generals Zero Hour community'
    }
  };

  const t = texts[language];

  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">ZH</span>
              </div>
              <span className="text-xl font-bold text-gradient">ZH-Love</span>
            </div>
            <p className="text-muted-foreground mb-4">
              {t.description}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.pages}</h3>
            <ul className="space-y-2">
              <li><a href={`/${language}/about`} className="text-muted-foreground hover:text-foreground transition-colors">{t.about}</a></li>
              <li><a href={`/${language}/support`} className="text-muted-foreground hover:text-foreground transition-colors">{t.support}</a></li>
              <li><a href={`/${language}/game-info`} className="text-muted-foreground hover:text-foreground transition-colors">{t.gameInfo}</a></li>
              <li><a href={`/${language}/contact`} className="text-muted-foreground hover:text-foreground transition-colors">{t.contact}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.community}</h3>
            <ul className="space-y-2">
              <li><a href={`/${language}/forum`} className="text-muted-foreground hover:text-foreground transition-colors">{t.forum}</a></li>
              <li><a href={`/${language}/tournaments`} className="text-muted-foreground hover:text-foreground transition-colors">{t.tournaments}</a></li>
              <li><a href={`/${language}/clans`} className="text-muted-foreground hover:text-foreground transition-colors">{t.clans}</a></li>
              <li><a href={`/${language}/rankings`} className="text-muted-foreground hover:text-foreground transition-colors">{t.rankings}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.legal}</h3>
            <ul className="space-y-2">
              <li><a href={`/${language}/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">{t.privacy}</a></li>
              <li><a href={`/${language}/terms`} className="text-muted-foreground hover:text-foreground transition-colors">{t.terms}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {t.copyright}
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            {t.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 