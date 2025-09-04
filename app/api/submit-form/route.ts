import { NextRequest, NextResponse } from 'next/server';
import { 
  googleSheetsService, 
  MediaBuyingData, 
  AdvertiserData, 
  ServiceRepData, 
  OtherData 
} from '../../../lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация - проверяем что есть хотя бы одно заполненное поле
    const hasRequiredFields = body.fullName || body.brand || body.service || body.contacts || body.telegram;
    if (!hasRequiredFields) {
      return NextResponse.json(
        { success: false, message: 'Please fill at least one required field' },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('Google Spreadsheet ID not configured');
    }

    const timestamp = new Date().toISOString();

    // Отправляем данные в зависимости от типа пользователя
    if (body.userType === 'mediaBuying') {
      const mediaBuyingData: MediaBuyingData = {
        userType: body.userType,
        fullName: body.fullName || '',
        telegram: body.telegram || '',
        teamName: body.teamName || '',
        niche: body.niche || '',
        vertical: body.vertical || '',
        trafficSources: body.trafficSources || '',
        timestamp,
      };
      
      if (mediaBuyingData.telegram) {
        const isDuplicate = await googleSheetsService.checkDuplicate(
          spreadsheetId, 
          'Team', 
          'telegram', 
          mediaBuyingData.telegram
        );
        
        if (isDuplicate) {
          return NextResponse.json(
            { success: false, message: 'Заявка с таким Telegram уже существует' },
            { status: 409 }
          );
        }
      }
      
      await googleSheetsService.appendMediaBuyingRow(spreadsheetId, mediaBuyingData);
    } else if (body.userType === 'advertiser') {
      const advertiserData: AdvertiserData = {
        userType: body.userType,
        brand: body.brand || '',
        geolocation: body.geolocation || '',
        contacts: body.contacts || '',
        timestamp,
      };
      
      // Проверяем дубликат по контактам
      if (advertiserData.contacts) {
        const isDuplicate = await googleSheetsService.checkDuplicate(
          spreadsheetId, 
          'Advertiser', 
          'contacts', 
          advertiserData.contacts
        );
        
        if (isDuplicate) {
          return NextResponse.json(
            { success: false, message: 'Заявка с такими контактами уже существует' },
            { status: 409 }
          );
        }
      }
      
      await googleSheetsService.appendAdvertiserRow(spreadsheetId, advertiserData);
    } else if (body.userType === 'serviceRep') {
      const serviceRepData: ServiceRepData = {
        userType: body.userType,
        service: body.service || '',
        contacts: body.contacts || '',
        terms: body.terms || '',
        timestamp,
      };
      
      // Проверяем дубликат по контактам
      if (serviceRepData.contacts) {
        const isDuplicate = await googleSheetsService.checkDuplicate(
          spreadsheetId, 
          'ServiceRep', 
          'contacts', 
          serviceRepData.contacts
        );
        
        if (isDuplicate) {
          return NextResponse.json(
            { success: false, message: 'Заявка с такими контактами уже существует' },
            { status: 409 }
          );
        }
      }
      
      await googleSheetsService.appendServiceRepRow(spreadsheetId, serviceRepData);
    } else if (body.userType === 'other') {
      const otherData: OtherData = {
        userType: body.userType,
        fullName: body.fullName || '',
        description: body.description || '',
        timestamp,
      };
      
      // Проверяем дубликат по имени
      if (otherData.fullName) {
        const isDuplicate = await googleSheetsService.checkDuplicate(
          spreadsheetId, 
          'Other', 
          'fullName', 
          otherData.fullName
        );
        
        if (isDuplicate) {
          return NextResponse.json(
            { success: false, message: 'Заявка с таким именем уже существует' },
            { status: 409 }
          );
        }
      }
      
      await googleSheetsService.appendOtherRow(spreadsheetId, otherData);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
    
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
