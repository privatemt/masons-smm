import { NextRequest, NextResponse } from 'next/server';
import { mongodbService } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gridFSId: string }> }
) {
  try {
    // Проверяем пароль
    const password = request.nextUrl.searchParams.get('password');
    if (password !== 'masons2024admin') {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const { gridFSId } = await params;
    
    // Получаем фотографию из GridFS
    const photoBuffer = await mongodbService.getPhotoById(gridFSId);
    
    if (!photoBuffer) {
      return NextResponse.json(
        { error: 'Фотография не найдена' },
        { status: 404 }
      );
    }

    // Определяем тип контента (по умолчанию image/jpeg)
    const contentType = 'image/jpeg';

    return new NextResponse(photoBuffer as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении фотографии' },
      { status: 500 }
    );
  }
}
