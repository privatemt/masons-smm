'use client';

import { useRouter, usePathname } from 'next/navigation';

interface LanguageSelectorProps {
  currentLocale: string;
}

export default function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    console.log('Language changed to:', newLocale); // Debug log
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    console.log('Navigating to:', newPath); // Debug log
    router.push(newPath);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          const newLocale = currentLocale === 'en' ? 'ru' : 'en';
          handleLanguageChange(newLocale);
        }}
        className="px-3 py-2 bg-gray-100/90 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer hover:bg-gray-200/90 transition-colors flex items-center space-x-2"
      >
        <span>{currentLocale.toUpperCase()}</span>
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
