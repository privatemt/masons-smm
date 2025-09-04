import type { Locale } from '../i18n/request';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_APP_URL: string;
    }
  }
}

declare module 'next-intl' {
  interface Messages {
    common: {
      title: string;
      description: string;
      getStarted: string;
      saveChanges: string;
      deployNow: string;
      readDocs: string;
      learn: string;
      examples: string;
      goToNextjs: string;
      language?: string;
    };
    navigation: {
      home: string;
      about: string;
      contact: string;
    };
    footer: {
      learn: string;
      examples: string;
      goToNextjs: string;
    };
  }
}

export {};
