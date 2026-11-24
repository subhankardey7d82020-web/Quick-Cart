import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();

  if (settings.announcementActive !== 'true') {
    return null;
  }

  return (
    <aside aria-label="Announcement" className="bg-noir-900 text-cream-100 text-xs tracking-luxury py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center font-medium">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse hidden sm:inline" />
        <span>{settings.announcementText}</span>
      </div>
    </aside>
  );
};
