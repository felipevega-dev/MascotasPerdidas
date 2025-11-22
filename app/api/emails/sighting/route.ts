import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getSightingReportEmailTemplate } from '@/app/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, sightingData } = body;

        if (!to || !sightingData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const html = getSightingReportEmailTemplate(sightingData);
        const result = await sendEmail({
            to,
            subject: `👀 Nuevo Avistamiento de ${sightingData.petName}`,
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
        console.error('Error in sighting email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
