import React from 'react';
import Footer from './Footer';

interface FooterWrapperProps {
  language?: 'ar' | 'en';
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ language }) => {
  return <Footer language={language} />;
};

export default FooterWrapper; 