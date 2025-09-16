'use client';

import { useState } from 'react';
import Modal from './Modal';

interface InteractiveFormProps {
  messages: {
    form: {
      userTypes: {
        mediaBuying: string;
        advertiser: string;
        serviceRep: string;
        other: string;
      };
      fields: {
        fullName: string;
        fullNamePlaceholder: string;
        telegram: string;
        telegramPlaceholder: string;
        teamName: string;
        teamNamePlaceholder: string;
        trafficSources: string;
        trafficSourcesPlaceholder: string;
        networksAdvertisers: string;
        networksAdvertisersPlaceholder: string;
        additionalInfo: string;
        additionalInfoPlaceholder: string;
        topGeo: string;
        topGeoPlaceholder: string;
        photos: string;
        photosPlaceholder: string;
        brand: string;
        brandPlaceholder: string;
        geolocation: string;
        geolocationPlaceholder: string;
        contacts: string;
        contactsPlaceholder: string;
        service: string;
        servicePlaceholder: string;
        terms: string;
        termsPlaceholder: string;
        description: string;
        descriptionPlaceholder: string;
        suggest: string;
      };
      submit: string;
      recaptcha: string;
      recaptchaTerms: string;
    };
  };
}

interface FormData {
  userType: string;
  fullName: string;
  telegram: string;
  teamName: string;
  trafficSources: string;
  networksAdvertisers: string;
  additionalInfo: string;
  topGeo1: string;
  photos: FileList | null;
  brand: string;
  geolocation: string;
  contacts: string;
  service: string;
  terms: string;
  description: string;
}

export default function InteractiveForm({ messages }: InteractiveFormProps) {
  const [selectedUserType, setSelectedUserType] = useState('mediaBuying');
  const [formData, setFormData] = useState<FormData>({
    userType: 'mediaBuying',
    fullName: '',
    telegram: '',
    teamName: '',
    trafficSources: '',
    networksAdvertisers: '',
    additionalInfo: '',
    topGeo1: '',
    photos: null,
    brand: '',
    geolocation: '',
    contacts: '',
    service: '',
    terms: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  });

  const handleRadioChange = (value: string) => {
    setSelectedUserType(value);
    setFormData(prev => ({ ...prev, userType: value }));
  };

  const handleInputChange = (field: keyof FormData, value: string | FileList | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    setModalData({ title, message, type });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSubmitStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Подготавливаем данные для отправки
      const formDataToSend = new FormData();
      
      // Добавляем все текстовые поля
      formDataToSend.append('userType', formData.userType);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('telegram', formData.telegram);
      formDataToSend.append('teamName', formData.teamName);
      formDataToSend.append('trafficSources', formData.trafficSources);
      formDataToSend.append('networksAdvertisers', formData.networksAdvertisers);
      formDataToSend.append('additionalInfo', formData.additionalInfo);
      formDataToSend.append('topGeo1', formData.topGeo1);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('geolocation', formData.geolocation);
      formDataToSend.append('contacts', formData.contacts);
      formDataToSend.append('service', formData.service);
      formDataToSend.append('terms', formData.terms);
      formDataToSend.append('description', formData.description);
      
      // Добавляем фотографии
      if (formData.photos) {
        Array.from(formData.photos).forEach((photo) => {
          formDataToSend.append('photos', photo);
        });
      }

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // Очищаем форму
        setFormData({
          userType: 'mediaBuying',
          fullName: '',
          telegram: '',
          teamName: '',
          trafficSources: '',
          networksAdvertisers: '',
          additionalInfo: '',
          topGeo1: '',
          photos: null,
          brand: '',
          geolocation: '',
          contacts: '',
          service: '',
          terms: '',
          description: ''
        });
        setSelectedUserType('mediaBuying');
        
        // Показываем модальное окно успеха
        showModal(
          'Успешно!',
          'Ваша заявка была успешно отправлена. Мы свяжемся с вами в ближайшее время.',
          'success'
        );
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          showModal(
            'Дубликат заявки',
            'Заявка с такими данными уже существует. Проверьте введенные контакты и попробуйте еще раз.',
            'warning'
          );
        } else {
          showModal(
            'Ошибка отправки',
            'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.',
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showModal(
        'Ошибка сети',
        'Произошла ошибка соединения. Проверьте интернет-соединение и попробуйте еще раз.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSS для radio button'ов
  const radioStyles = `
    input[type="radio"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border-radius: 50%;
      border: 2px solid;
      outline: none;
      position: relative;
    }
    
    input[type="radio"]:checked {
      background-color: white !important;
      border-color: white !important;
    }
    
    input[type="radio"]:not(:checked) {
      background-color: transparent !important;
      border-color: #9FA5B7 !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: radioStyles }} />
      
      {/* Модальное окно */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Тип пользователя */}
        <div className="space-y-3">
          <div className="space-y-2">
            {/* Первый radio button */}
            <label className="flex items-center space-x-3 cursor-pointer"
                style={{
                  backgroundColor: selectedUserType === 'mediaBuying' ? "#B63C37" : "#F3F5F9",
                  borderRadius: "12px",
                  padding: "10px"
                }}>
              <input
                type="radio"
                name="userType"
                value="mediaBuying"
                checked={selectedUserType === 'mediaBuying'}
                onChange={() => handleRadioChange('mediaBuying')}
                className="w-4 h-4 focus:ring-red-500"
              />
              <span className={`text-sm ${selectedUserType === 'mediaBuying' ? 'text-white' : 'text-black'}`}>
                {messages.form.userTypes.mediaBuying}
              </span>
            </label>
            
            {/* Второй radio button */}
            <label className="flex items-center space-x-3 cursor-pointer"
              style={{
                backgroundColor: selectedUserType === 'advertiser' ? "#B63C37" : "#F3F5F9",
                borderRadius: "12px",
                padding: "10px"
              }}>
              <input
                type="radio"
                name="userType"
                value="advertiser"
                checked={selectedUserType === 'advertiser'}
                onChange={() => handleRadioChange('advertiser')}
                className="w-4 h-4 focus:ring-red-500"
              />
              <span className={`text-sm ${selectedUserType === 'advertiser' ? 'text-white' : 'text-black'}`}>
                {messages.form.userTypes.advertiser}
              </span>
            </label>
            
            {/* Третий radio button */}
            <label className="flex items-center space-x-3 cursor-pointer"
              style={{
                backgroundColor: selectedUserType === 'serviceRep' ? "#B63C37" : "#F3F5F9",
                borderRadius: "12px",
                padding: "10px"
              }}>
              <input
                type="radio"
                name="userType"
                value="serviceRep"
                checked={selectedUserType === 'serviceRep'}
                onChange={() => handleRadioChange('serviceRep')}
                className="w-4 h-4 focus:ring-red-500"
              />
              <span className={`text-sm ${selectedUserType === 'serviceRep' ? 'text-white' : 'text-black'}`}>
                {messages.form.userTypes.serviceRep}
              </span>
            </label>
            
            {/* Четвертый radio button */}
            <label className="flex items-center space-x-3 cursor-pointer"
              style={{
                backgroundColor: selectedUserType === 'other' ? "#B63C37" : "#F3F5F9",
                borderRadius: "12px",
                padding: "10px"
              }}>
              <input
                type="radio"
                name="userType"
                value="other"
                checked={selectedUserType === 'other'}
                onChange={() => handleRadioChange('other')}
                className="w-4 h-4 focus:ring-red-500"
              />
              <span className={`text-sm ${selectedUserType === 'other' ? 'text-white' : 'text-black'}`}>
                {messages.form.userTypes.other}
              </span>
            </label>
          </div>
        </div>

        {/* Динамические поля формы */}
        {selectedUserType === 'mediaBuying' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.fullName} *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder={messages.form.fields.fullNamePlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.telegram} *
              </label>
              <input
                type="text"
                required
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                placeholder={messages.form.fields.telegramPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.teamName} *
              </label>
              <input
                type="text"
                required
                value={formData.teamName}
                onChange={(e) => handleInputChange('teamName', e.target.value)}
                placeholder={messages.form.fields.teamNamePlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.trafficSources} *
              </label>
              <input
                type="text"
                required
                value={formData.trafficSources}
                onChange={(e) => handleInputChange('trafficSources', e.target.value)}
                placeholder={messages.form.fields.trafficSourcesPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.networksAdvertisers} *
              </label>
              <input
                type="text"
                required
                value={formData.networksAdvertisers}
                onChange={(e) => handleInputChange('networksAdvertisers', e.target.value)}
                placeholder={messages.form.fields.networksAdvertisersPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Два выпадающих списка для GEO */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.topGeo} *
              </label>
              <select
                required
                value={formData.topGeo1}
                onChange={(e) => handleInputChange('topGeo1', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none"
              >
                <option value="">{messages.form.fields.topGeoPlaceholder}</option>
                <option value="europe">Europe</option>
                <option value="north-america">North America</option>
                <option value="latin-america">Latin America</option>
                <option value="africa">Africa</option>
                <option value="asia">Asia</option>
                <option value="oceania">Oceania</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.photos} *
              </label>
              <input
                type="file"
                required
                multiple
                accept="image/*"
                onChange={(e) => handleInputChange('photos', e.target.files)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                {messages.form.fields.photosPlaceholder}
              </p>
              {formData.photos && formData.photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-300 mb-2">Выбранные файлы:</p>
                  <div className="space-y-1">
                    {Array.from(formData.photos).map((file: File, index: number) => (
                      <div key={index} className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.additionalInfo} *
              </label>
              <textarea
                required
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder={messages.form.fields.additionalInfoPlaceholder}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
        )}

        {selectedUserType === 'advertiser' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.brand}
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder={messages.form.fields.brandPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.geolocation}
              </label>
              <input
                type="text"
                required
                value={formData.geolocation}
                onChange={(e) => handleInputChange('geolocation', e.target.value)}
                placeholder={messages.form.fields.geolocationPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.contacts}
              </label>
              <input
                type="text"
                required
                value={formData.contacts}
                onChange={(e) => handleInputChange('contacts', e.target.value)}
                placeholder={messages.form.fields.contactsPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {selectedUserType === 'serviceRep' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.service}
              </label>
              <input
                type="text"
                required
                value={formData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                placeholder={messages.form.fields.servicePlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.contacts}
              </label>
              <input
                type="text"
                required
                value={formData.contacts}
                onChange={(e) => handleInputChange('contacts', e.target.value)}
                placeholder={messages.form.fields.contactsPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.terms}
              </label>
              <input
                type="text"
                required
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder={messages.form.fields.termsPlaceholder}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {selectedUserType === 'other' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.contacts}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder={messages.form.fields.contacts}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages.form.fields.suggest}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={messages.form.fields.suggest}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* reCAPTCHA */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-300">{messages.form.recaptcha}</span>
          </div>
          <p className="text-xs text-gray-400">{messages.form.recaptchaTerms}</p>
        </div>

        {/* Кнопка */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center space-x-2"
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Отправка...' : messages.form.submit}
        </button>
      </form>
    </>
  );
}
