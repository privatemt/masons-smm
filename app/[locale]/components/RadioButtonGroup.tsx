'use client';

import { useState } from 'react';

interface RadioButtonGroupProps {
  userTypes: {
    mediaBuying: string;
    advertiser: string;
    serviceRep: string;
    other: string;
  };
  onTypeChange: (type: string) => void;
}

export default function RadioButtonGroup({ userTypes, onTypeChange }: RadioButtonGroupProps) {
  const [selectedValue, setSelectedValue] = useState('mediaBuying');

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
    onTypeChange(value);
  };

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
      <div className="space-y-2">
        {/* Первый radio button */}
        <label className="flex items-center space-x-3 cursor-pointer"
            style={{
              backgroundColor: selectedValue === 'mediaBuying' ? "#B63C37" : "#F3F5F9",
              borderRadius: "12px",
              padding: "10px"
            }}>
          <input
            type="radio"
            name="userType"
            value="mediaBuying"
            checked={selectedValue === 'mediaBuying'}
            onChange={() => handleRadioChange('mediaBuying')}
            className="w-4 h-4 focus:ring-red-500"
            style={{
              accentColor: selectedValue === 'mediaBuying' ? 'white' : '#9FA5B7'
            }}
          />
          <span className={`text-sm ${selectedValue === 'mediaBuying' ? 'text-white' : 'text-black'}`}>
            {userTypes.mediaBuying}
          </span>
        </label>
        
        {/* Второй radio button */}
        <label className="flex items-center space-x-3 cursor-pointer"
          style={{
            backgroundColor: selectedValue === 'advertiser' ? "#B63C37" : "#F3F5F9",
            borderRadius: "12px",
            padding: "10px"
          }}>
          <input
            type="radio"
            name="userType"
            value="advertiser"
            checked={selectedValue === 'advertiser'}
            onChange={() => handleRadioChange('advertiser')}
            className="w-4 h-4 focus:ring-red-500"
            style={{
              accentColor: selectedValue === 'advertiser' ? 'white' : '#9FA5B7'
            }}
          />
          <span className={`text-sm ${selectedValue === 'advertiser' ? 'text-white' : 'text-black'}`}>
            {userTypes.advertiser}
          </span>
        </label>
        
        {/* Третий radio button */}
        <label className="flex items-center space-x-3 cursor-pointer"
          style={{
            backgroundColor: selectedValue === 'serviceRep' ? "#B63C37" : "#F3F5F9",
            borderRadius: "12px",
            padding: "10px"
          }}>
          <input
            type="radio"
            name="userType"
            value="serviceRep"
            checked={selectedValue === 'serviceRep'}
            onChange={() => handleRadioChange('serviceRep')}
            className="w-4 h-4 focus:ring-red-500"
            style={{
              accentColor: selectedValue === 'serviceRep' ? 'white' : '#9FA5B7'
            }}
          />
          <span className={`text-sm ${selectedValue === 'serviceRep' ? 'text-white' : 'text-black'}`}>
            {userTypes.serviceRep}
          </span>
        </label>
        
        {/* Четвертый radio button */}
        <label className="flex items-center space-x-3 cursor-pointer"
          style={{
            backgroundColor: selectedValue === 'other' ? "#B63C37" : "#F3F5F9",
            borderRadius: "12px",
            padding: "10px"
          }}>
          <input
            type="radio"
            name="userType"
            value="other"
            checked={selectedValue === 'other'}
            onChange={() => handleRadioChange('other')}
            className="w-4 h-4 focus:ring-red-500"
            style={{
              accentColor: selectedValue === 'other' ? 'white' : '#9FA5B7'
            }}
          />
          <span className={`text-sm ${selectedValue === 'other' ? 'text-white' : 'text-black'}`}>
            {userTypes.other}
          </span>
        </label>
      </div>
    </>
  );
}
