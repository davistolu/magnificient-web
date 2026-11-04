import React from 'react';
import { Link } from 'react-router-dom';

interface AnnouncementBarProps {
  text?: string;
  link?: string;
  enabled?: boolean;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = 'Complimentary white-glove presentation box included with every curated order.',
  link = '/gift-sets',
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <div className="bg-espresso-900 text-ivory-100 text-xs py-2 px-4 text-center tracking-editorial font-light transition-colors border-b border-espresso-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <span>{text}</span>
        {link && (
          <Link
            to={link}
            className="underline underline-offset-4 text-champagne hover:text-white transition-colors ml-1 font-medium"
          >
            Explore
          </Link>
        )}
      </div>
    </div>
  );
};
