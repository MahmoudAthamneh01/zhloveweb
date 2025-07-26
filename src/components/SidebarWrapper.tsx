import React from 'react';
import Sidebar from './Sidebar';

interface SidebarWrapperProps {
  currentPath?: string;
  language?: 'ar' | 'en';
}

const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ currentPath, language }) => {
  return <Sidebar currentPath={currentPath} language={language} />;
};

export default SidebarWrapper; 