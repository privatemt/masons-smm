import { google } from 'googleapis';

// Типы для данных формы
export interface MediaBuyingData {
  userType: string;
  fullName: string;
  telegram: string;
  teamName: string;
  niche: string;
  vertical: string;
  trafficSources: string;
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

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async appendMediaBuyingRow(spreadsheetId: string, data: MediaBuyingData) {
    try {
      const values = [
        [
          data.userType,
          data.fullName,
          data.telegram,
          data.teamName,
          data.niche,
          data.vertical,
          data.trafficSources,
          data.timestamp,
        ],
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Team!A:H',
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
