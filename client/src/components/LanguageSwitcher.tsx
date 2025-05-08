import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/languageContext';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'nl' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="px-2"
      aria-label={t('app.language')}
    >
      {language === 'en' ? 'NL' : 'EN'}
    </Button>
  );
}