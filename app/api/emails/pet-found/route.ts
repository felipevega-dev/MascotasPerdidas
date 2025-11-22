import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getPetFoundEmailTemplate } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, petData } = body;

        if (!to || !petData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const html = getPetFoundEmailTemplate(petData);
        const result = await sendEmail({
            to,
            subject: `🎉 ¡Buenas Noticias! ${petData.name} ha sido Encontrado`,
            html,
        });

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in pet-found email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
