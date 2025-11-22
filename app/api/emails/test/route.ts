import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json(
                { error: 'Email address required' },
                { status: 400 }
            );
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #667eea;">🎉 ¡Email de Prueba Exitoso!</h1>
            <p>Este es un email de prueba desde PawAlert.</p>
            <p>Si recibes este mensaje, significa que el sistema de notificaciones está funcionando correctamente.</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                Enviado desde el sistema de notificaciones de PawAlert
            </p>
        </body>
        </html>
        `;

        const result = await sendEmail({
            to,
            subject: '✅ Test Email - PawAlert Notifications',
            html,
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Test email sent successfully' });
        } else {
            return NextResponse.json(
                { error: 'Failed to send test email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in test email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
