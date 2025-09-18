import { NextRequest, NextResponse } from 'next/server';
import { 
  googleSheetsService, 
  MediaBuyingData, 
  AdvertiserData, 
  ServiceRepData, 
  OtherData 
} from '../../../lib/google-sheets';
import { mongodbService } from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Извлекаем данные из FormData
    const body = {
      userType: formData.get('userType') as string,
      fullName: formData.get('fullName') as string,
      telegram: formData.get('telegram') as string,
      teamName: formData.get('teamName') as string,
      trafficSources: formData.get('trafficSources') as string,
      networksAdvertisers: formData.get('networksAdvertisers') as string,
      additionalInfo: formData.get('additionalInfo') as string,
      topGeo1: formData.get('topGeo1') as string,
      brand: formData.get('brand') as string,
      geolocation: formData.get('geolocation') as string,
      contacts: formData.get('contacts') as string,
      service: formData.get('service') as string,
      terms: formData.get('terms') as string,
      description: formData.get('description') as string,
      photos: formData.getAll('photos') as File[]
    };
    
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
      // Обрабатываем фотографии
      let photosFolderLink = '';
      
      if (body.photos && body.photos.length > 0) {
        try {
          // Фильтруем только валидные файлы
          const validPhotos = body.photos.filter(photo => 
            photo instanceof File && 
            photo.size > 0 && 
            photo.type.startsWith('image/')
          );

          if (validPhotos.length === 0) {
            console.warn('No valid image files found');
            photosFolderLink = 'No valid images to upload';
          } else {
            console.log(`Processing ${validPhotos.length} valid photos`);
            
            // Создаем папку пользователя в MongoDB и сохраняем фотографии
            const folderId = await mongodbService.createUserPhotosFolder({
              fullName: body.fullName || '',
              telegram: body.telegram || '',
              timestamp
            }, validPhotos);
            
            // Получаем ссылку на папку
            photosFolderLink = await mongodbService.getFolderLink(folderId);
            console.log(`Successfully uploaded photos. Folder ID: ${folderId}`);
          }
        } catch (error: any) {
          console.error('Error processing photos:', error);
          console.error('Full error details:', {
            message: error.message,
            name: error.name,
            status: error.status,
            code: error.code,
            errors: error.errors,
            stack: error.stack
          });
          
          // Более информативное сообщение об ошибке
          if (error.message?.includes('RangeError')) {
            photosFolderLink = 'Error: Invalid image data';
          } else if (error.message?.includes('timeout')) {
            photosFolderLink = 'Error: Upload timeout';
          } else if (error.message?.includes('GridFS')) {
            photosFolderLink = 'Error: Database storage issue';
          } else {
            photosFolderLink = 'Error uploading photos';
          }
        }
      }
      
      const mediaBuyingData: MediaBuyingData = {
        userType: body.userType,
        fullName: body.fullName || '',
        telegram: body.telegram || '',
        teamName: body.teamName || '',
        trafficSources: body.trafficSources || '',
        networksAdvertisers: body.networksAdvertisers || '',
        additionalInfo: body.additionalInfo || '',
        topGeo1: body.topGeo1 || '',
        photosFolderLink,
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
