import { google } from 'googleapis';
import { Dropbox } from 'dropbox';
import fetch from 'cross-fetch'; 
export interface MediaBuyingData {
  userType: string;
  fullName: string;
  telegram: string;
  teamName: string;
  trafficSources: string;
  networksAdvertisers: string;
  additionalInfo: string;
  topGeo1: string;
  photosFolderLink: string;
  timestamp: string;
}

export interface AdvertiserData {
  userType: string;
  brand: string;
  geolocation: string;
  contacts: string;
  timestamp: string;
}

export interface ServiceRepData {
  userType: string;
  service: string;
  contacts: string;
  terms: string;
  timestamp: string;
}

export interface OtherData {
  userType: string;
  fullName: string;
  description: string;
  timestamp: string;
}

export class GoogleSheetsService {
  private auth: any;
  private sheets: any;
  private dropbox: Dropbox;

  constructor() {
    // Аутентификация для Google Sheets
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SPREADSHEET_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SPREADSHEET_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_id: process.env.GOOGLE_SPREADSHEET_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Аутентификация для Dropbox
    this.dropbox = new Dropbox({
      accessToken: process.env.DROPBOX_ACCESS_TOKEN,
      fetch
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  // Получение или создание корневой папки MASONS_DATA в Dropbox
  async getOrCreateRootFolder(): Promise<string> {
    try {
      
      const rootFolderPath = '/MASONS_DATA';
      
      try {
        const folderInfo = await this.dropbox.filesGetMetadata({
          path: rootFolderPath,
        });
        return rootFolderPath;
      } catch (error: any) {
        if (error.status === 409) { // path_not_found
          const createdFolder = await this.dropbox.filesCreateFolderV2({
            path: rootFolderPath,
            autorename: false,
          });
          return rootFolderPath;
        } else {
          console.error('Error accessing root folder:', error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error accessing root folder:', error);
      throw error;
    }
  }

  // Создание папки пользователя
  async createUserFolder(userData: { fullName: string; telegram: string; timestamp: string }): Promise<string> {
    try {
      
      const rootFolderPath = await this.getOrCreateRootFolder();
      
      // Создаем уникальное имя папки
      const folderName = `${userData.fullName}_${userData.telegram}_${new Date(userData.timestamp).toISOString().split('T')[0]}`;
      const userFolderPath = `${rootFolderPath}/${folderName}`;
      
      // Проверяем, не существует ли уже такая папка
      try {
        const existingFolder = await this.dropbox.filesGetMetadata({
          path: userFolderPath,
        });
        return userFolderPath;
      } catch (error: any) {
        if (error.status === 409) { // path_not_found
          // Создаем папку пользователя
          const folder = await this.dropbox.filesCreateFolderV2({
            path: userFolderPath,
            autorename: false,
          });

          return userFolderPath;
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error creating user folder:', error);
      console.error('Full error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        errors: error.errors,
        stack: error.stack
      });
      throw error;
    }
  }

  // Загрузка фотографий в папку пользователя
  async uploadPhotosToUserFolder(folderPath: string, photos: File[]): Promise<string[]> {
    try {
      
      const uploadedPhotoPaths: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        try {
          const buffer = Buffer.from(await photo.arrayBuffer());
          
          const filePath = `${folderPath}/${photo.name}`;

          const file = await this.dropbox.filesUpload({
            path: filePath,
            contents: buffer,
            mode: { '.tag': 'overwrite' },
          });

          uploadedPhotoPaths.push(filePath);
          
        } catch (photoError: any) {
          console.error(`Error uploading photo ${photo.name}:`, photoError);
          console.error('Photo error details:', {
            message: photoError.message,
            status: photoError.status,
            code: photoError.code,
            errors: photoError.errors
          });
          throw photoError;
        }
      }

      return uploadedPhotoPaths;
    } catch (error: any) {
      console.error('Error in uploadPhotosToUserFolder:', error);
      console.error('Full error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        errors: error.errors,
        stack: error.stack
      });
      throw error;
    }
  }

  // Получение ссылки на папку
  async getFolderLink(folderPath: string): Promise<string> {
    try {
      
      const link = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path: folderPath,
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      return link.result.url;
    } catch (error: any) {
      console.error('Error getting folder link:', error);
      // Если ссылка уже существует, получаем её
      if (error.status === 409) {
        try {
          const existingLink = await this.dropbox.sharingListSharedLinks({
            path: folderPath,
          });
          if (existingLink.result.links && existingLink.result.links.length > 0) {
            return existingLink.result.links[0].url;
          }
        } catch (linkError) {
          console.error('Error getting existing link:', linkError);
        }
      }
      throw error;
    }
  }

  async appendMediaBuyingRow(spreadsheetId: string, data: MediaBuyingData) {
    try {
      const values = [
        [
          data.userType,
          data.fullName,
          data.telegram,
          data.teamName,
          data.trafficSources,
          data.networksAdvertisers,
          data.additionalInfo,
          data.topGeo1,
          data.photosFolderLink, // Ссылка на папку с фотографиями
          data.timestamp,
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Team!A:J', // Обновляем диапазон до столбца J
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async appendAdvertiserRow(spreadsheetId: string, data: AdvertiserData) {
    try {
      const values = [
        [
          data.userType,
          data.brand,
          data.geolocation,
          data.contacts,
          data.timestamp,
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Advertiser!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async appendServiceRepRow(spreadsheetId: string, data: ServiceRepData) {
    try {
      const values = [
        [
          data.userType,
          data.service,
          data.contacts,
          data.terms,
          data.timestamp,
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'ServiceRep!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async appendOtherRow(spreadsheetId: string, data: OtherData) {
    try {
      const values = [
        [
          data.userType,
          data.fullName,
          data.description,
          data.timestamp,
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Other!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Метод для проверки дубликатов
  async checkDuplicate(spreadsheetId: string, sheetName: string, contactField: string, contactValue: string): Promise<boolean> {
    try {
      // Определяем диапазон для поиска в зависимости от листа
      let range = '';
      let contactColumn = '';
      
      if (sheetName === 'Team') {
        range = 'Team!C:C'; // Telegram в столбце C
        contactColumn = 'C';
      } else if (sheetName === 'Advertiser') {
        range = 'Advertiser!D:D'; // Контакты в столбце D
        contactColumn = 'D';
      } else if (sheetName === 'ServiceRep') {
        range = 'ServiceRep!C:C'; // Контакты в столбце C
        contactColumn = 'C';
      } else if (sheetName === 'Other') {
        range = 'Other!B:B'; // Полное имя в столбце B
        contactColumn = 'B';
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      
      for (const row of rows) {
        if (row[0] && row[0].toString().toLowerCase().includes(contactValue.toLowerCase())) {
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      return false;
    }
  }
}

// Создаем экземпляр сервиса
export const googleSheetsService = new GoogleSheetsService();
