import { NextRequest, NextResponse } from 'next/server';
import { mongodbService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Проверяем пароль
    const password = request.nextUrl.searchParams.get('password');
    if (password !== 'masons2024admin') {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Получаем все записи пользователей с фотографиями
    const users = await mongodbService.getAllUsers();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении фотографий' },
      { status: 500 }
    );
  }
}
