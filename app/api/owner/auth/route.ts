import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: 'PIN wajib diisi.' }, { status: 400 });
    }

    const expectedPin = process.env.OWNER_PIN || '8888';

    if (pin.toString().trim() === expectedPin.toString().trim()) {
      const response = NextResponse.json({ success: true, message: 'Login berhasil!' });
      const sessionSecret = process.env.SESSION_SECRET || 'authorized_owner_session_token';

      // Set cookie owner_session sebagai HTTP-only
      response.cookies.set('owner_session', sessionSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 hari
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ error: 'PIN salah! Akses ditolak.' }, { status: 401 });
  } catch (error) {
    console.error('Owner auth error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
