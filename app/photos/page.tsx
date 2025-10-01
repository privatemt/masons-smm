'use client';

import { useState, useEffect } from 'react';

interface PhotoMetadata {
  name: string;
  contentType: string;
  size: number;
  gridFSId: string;
}

interface UserPhotosFolder {
  _id: string;
  userType: string;
  fullName: string;
  telegram: string;
  timestamp: string;
  photos: PhotoMetadata[];
  createdAt: string;
  updatedAt: string;
}

export default function PhotosPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserPhotosFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/photos?password=${encodeURIComponent(password)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUsers(data.users);
      } else {
        setError(data.error || 'Ошибка аутентификации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Доступ к фотографиям</h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите пароль"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Проверка...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Фотографии пользователей</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setUsers([]);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Выйти
          </button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Фотографии не найдены</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
                  <p className="text-gray-600">Telegram: {user.telegram}</p>
                  <p className="text-gray-600">Дата: {formatDate(user.timestamp)}</p>
                  <p className="text-gray-600">Тип: {user.userType}</p>
                  <p className="text-sm text-gray-500">
                    Создано: {formatDate(user.createdAt)} | Обновлено: {formatDate(user.updatedAt)}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    Фотографии ({user.photos.length})
                  </h3>
                </div>

                {user.photos.length === 0 ? (
                  <p className="text-gray-500">Фотографии отсутствуют</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {user.photos.map((photo, index) => (
                      <div key={photo.gridFSId} className="border rounded-lg p-3">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                          <img
                            src={`/api/photos/${photo.gridFSId}?password=${encodeURIComponent(password)}`}
                            alt={photo.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => {
                              window.open(
                                `/api/photos/${photo.gridFSId}?password=${encodeURIComponent(password)}`,
                                '_blank'
                              );
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Ошибка загрузки</text></svg>';
                            }}
                          />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium truncate" title={photo.name}>
                            {photo.name}
                          </p>
                          <p className="text-gray-500">{formatFileSize(photo.size)}</p>
                          <p className="text-gray-500">{photo.contentType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

