import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getPetLostEmailTemplate } from '@/app/lib/email';

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

        const html = getPetLostEmailTemplate(petData);
        const result = await sendEmail({
            to,
            subject: `🐾 Mascota Perdida Cerca de Ti: ${petData.name}`,
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
        console.error('Error in pet-lost email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
