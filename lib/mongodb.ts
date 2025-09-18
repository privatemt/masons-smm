import { MongoClient, Db, Collection, GridFSBucket } from 'mongodb';

export interface PhotoMetadata {
  name: string;
  contentType: string;
  size: number;
  gridFSId: string;
}

export interface UserPhotosFolder {
  userType: string;
  fullName: string;
  telegram: string;
  timestamp: string;
  photos: PhotoMetadata[];
  createdAt: Date;
  updatedAt: Date;
}

export class MongoDBService {
  private client: MongoClient;
  private db: Db;
  private isConnected: boolean = false;

  constructor() {
    const username = process.env.MONGODB_USERNAME || 'developmentis_db_user';
    const password = process.env.MONGODB_PASSWORD || 'nBKwCcL5poFZUlGj';
    const connectionString = `mongodb+srv://${username}:${password}@cluster0.rbuxfxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    
    this.client = new MongoClient(connectionString);
    this.db = this.client.db('masons_uploaded_data');
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  private getPhotosCollection(): Collection {
    return this.db.collection('masons_uploaded_data');
  }

  private getGridFSBucket(): GridFSBucket {
    return new GridFSBucket(this.db, { bucketName: 'photos' });
  }

  // Создание папки пользователя и сохранение фотографий
  async createUserPhotosFolder(userData: { fullName: string; telegram: string; timestamp: string }, photos: File[]): Promise<string> {
    await this.connect();
    const collection = this.getPhotosCollection();
    const bucket = this.getGridFSBucket();
    
    try {
      // Обрабатываем фотографии и сохраняем в GridFS
      const photosMetadata: PhotoMetadata[] = [];
      
      for (const photo of photos) {
        try {
          // Проверяем размер файла
          if (photo.size === 0) {
            console.warn(`Skipping empty file: ${photo.name}`);
            continue;
          }

          // Конвертируем файл в буфер
          const arrayBuffer = await photo.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Проверяем что буфер не пустой
          if (buffer.length === 0) {
            console.warn(`Skipping empty buffer for file: ${photo.name}`);
            continue;
          }

          // Создаем уникальное имя файла
          const fileName = `${userData.fullName}_${userData.telegram}_${Date.now()}_${photo.name}`;
          
          // Создаем поток для записи в GridFS
          const uploadStream = bucket.openUploadStream(fileName, {
            metadata: {
              contentType: photo.type,
              originalName: photo.name,
              userFullName: userData.fullName,
              userTelegram: userData.telegram,
              timestamp: userData.timestamp
            }
          });

          // Записываем данные в GridFS с улучшенной обработкой ошибок
          const gridFSId = await new Promise<string>((resolve, reject) => {
            uploadStream.on('error', (error) => {
              console.error(`GridFS upload error for file ${photo.name}:`, error);
              reject(error);
            });
            
            uploadStream.on('finish', () => {
              resolve(uploadStream.id.toString());
            });

            // Записываем буфер по частям для больших файлов
            const chunkSize = 255 * 1024; // 255KB chunks
            let offset = 0;
            
            const writeNextChunk = () => {
              if (offset >= buffer.length) {
                uploadStream.end();
                return;
              }
              
              const end = Math.min(offset + chunkSize, buffer.length);
              const chunk = buffer.subarray(offset, end);
              
              const canContinue = uploadStream.write(chunk);
              offset = end;
              
              if (canContinue) {
                writeNextChunk();
              } else {
                uploadStream.once('drain', writeNextChunk);
              }
            };
            
            writeNextChunk();
          });

          photosMetadata.push({
            name: photo.name,
            contentType: photo.type,
            size: buffer.length,
            gridFSId: gridFSId
          });
          
        } catch (photoError) {
          console.error(`Error processing photo ${photo.name}:`, photoError);
          // Продолжаем обработку других файлов
          continue;
        }
      }

      // Если нет успешно обработанных фотографий, все равно создаем запись
      if (photosMetadata.length === 0) {
        console.warn('No photos were successfully processed');
      }

      // Создаем уникальный идентификатор папки
      const folderId = `${userData.fullName}_${userData.telegram}_${new Date(userData.timestamp).toISOString().split('T')[0]}`;
      
      // Сохраняем метаданные папки с фотографиями
      const userPhotosFolder: UserPhotosFolder = {
        userType: 'mediaBuying',
        fullName: userData.fullName,
        telegram: userData.telegram,
        timestamp: userData.timestamp,
        photos: photosMetadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(userPhotosFolder);
      
      // Возвращаем ID записи как ссылку на папку
      return result.insertedId.toString();
    } catch (error) {
      console.error('Error creating user photos folder:', error);
      throw error;
    }
  }

  // Получение ссылки на папку (возвращаем MongoDB ID)
  async getFolderLink(folderId: string): Promise<string> {
    return `MongoDB folder ID: ${folderId}`;
  }

  // Получение метаданных фотографий пользователя по ID папки
  async getUserPhotos(folderId: string): Promise<UserPhotosFolder | null> {
    await this.connect();
    const collection = this.getPhotosCollection();
    
    try {
      const { ObjectId } = require('mongodb');
      const result = await collection.findOne({ _id: new ObjectId(folderId) });
      return result as UserPhotosFolder | null;
    } catch (error) {
      console.error('Error getting user photos:', error);
      return null;
    }
  }

  // Получение конкретной фотографии из GridFS
  async getPhotoById(gridFSId: string): Promise<Buffer | null> {
    await this.connect();
    const bucket = this.getGridFSBucket();
    
    try {
      const { ObjectId } = require('mongodb');
      const downloadStream = bucket.openDownloadStream(new ObjectId(gridFSId));
      
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        downloadStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        downloadStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        
        downloadStream.on('error', (error) => {
          console.error('Error downloading photo:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error getting photo by ID:', error);
      return null;
    }
  }
}

// Создаем экземпляр сервиса
export const mongodbService = new MongoDBService();
