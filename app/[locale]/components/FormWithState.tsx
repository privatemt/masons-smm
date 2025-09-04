'use client';

import { useState } from 'react';
import RadioButtonGroup from './RadioButtonGroup';

interface FormWithStateProps {
  t: (key: string) => string;
}

export default function FormWithState({ t }: FormWithStateProps) {
  const [selectedUserType, setSelectedUserType] = useState('mediaBuying');

  return (
    <form className="space-y-5">
      {/* Тип пользователя */}
      <div className="space-y-3">
        <RadioButtonGroup 
          userTypes={{
            mediaBuying: t("form.userTypes.mediaBuying"),
            advertiser: t("form.userTypes.advertiser"),
            serviceRep: t("form.userTypes.serviceRep"),
            other: t("form.userTypes.other")
          }}
          onTypeChange={setSelectedUserType}
        />
      </div>

      {/* Динамические поля формы */}
      <DynamicFormFields userType={selectedUserType} t={t} />

      {/* reCAPTCHA */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-300">{t("form.recaptcha")}</span>
        </div>
        <p className="text-xs text-gray-400">{t("form.recaptchaTerms")}</p>
      </div>

      {/* Кнопка */}
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {t("form.submit")}
      </button>
    </form>
  );
}
