import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const data = await resend.emails.send({
            from: 'PawAlert <noreply@pawalert.app>',
            to: [to],
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

export function getPetLostEmailTemplate(petData: {
    name: string;
    breed: string;
    color: string;
    lastSeenLocation: string;
    contactName: string;
    petUrl: string;
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mascota Perdida - ${petData.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🐾 PawAlert</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Mascota Perdida en tu área</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">¡Ayuda a encontrar a ${petData.name}!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 10px 0;"><strong>Nombre:</strong> ${petData.name}</p>
                <p style="margin: 10px 0;"><strong>Raza:</strong> ${petData.breed}</p>
                <p style="margin: 10px 0;"><strong>Color:</strong> ${petData.color}</p>
                <p style="margin: 10px 0;"><strong>Última vez visto:</strong> ${petData.lastSeenLocation}</p>
                <p style="margin: 10px 0;"><strong>Reportado por:</strong> ${petData.contactName}</p>
            </div>
            
            <p style="margin: 20px 0;">Si has visto a esta mascota, por favor contacta al dueño o reporta un avistamiento en nuestra plataforma.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${petData.petUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Ver Detalles Completos</a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Este email fue enviado porque estás registrado en PawAlert y hay una mascota perdida cerca de tu ubicación.
            </p>
        </div>
    </body>
    </html>
    `;
}

export function getPetFoundEmailTemplate(petData: {
    name: string;
    breed: string;
    contactName: string;
    petUrl: string;
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Mascota Encontrada! - ${petData.name}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #34d399 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Buenas Noticias!</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Una mascota ha sido encontrada</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10b981; margin-top: 0;">¡${petData.name} ha sido encontrado!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 10px 0;"><strong>Mascota:</strong> ${petData.name}</p>
                <p style="margin: 10px 0;"><strong>Raza:</strong> ${petData.breed}</p>
                <p style="margin: 10px 0;"><strong>Dueño:</strong> ${petData.contactName}</p>
            </div>
            
            <p style="margin: 20px 0;">¡Excelentes noticias! Esta mascota ha sido marcada como encontrada. Gracias a todos los que ayudaron en la búsqueda.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${petData.petUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Ver Detalles</a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Gracias por ser parte de la comunidad PawAlert. Juntos ayudamos a reunir mascotas con sus familias.
            </p>
        </div>
    </body>
    </html>
    `;
}

export function getSightingReportEmailTemplate(sightingData: {
    petName: string;
    petBreed: string;
    location: string;
    notes: string;
    ownerName: string;
    petUrl: string;
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Avistamiento - ${sightingData.petName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">👀 ¡Nuevo Avistamiento!</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Alguien ha visto a tu mascota</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #f59e0b; margin-top: 0;">Hola ${sightingData.ownerName},</h2>
            
            <p style="margin: 20px 0;">¡Tenemos buenas noticias! Alguien ha reportado haber visto a <strong>${sightingData.petName}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 10px 0;"><strong>Mascota:</strong> ${sightingData.petName} (${sightingData.petBreed})</p>
                <p style="margin: 10px 0;"><strong>Ubicación del avistamiento:</strong> ${sightingData.location}</p>
                ${sightingData.notes ? `<p style="margin: 10px 0;"><strong>Notas:</strong> "${sightingData.notes}"</p>` : ''}
            </div>
            
            <p style="margin: 20px 0;">Te recomendamos que te dirijas a esta ubicación lo antes posible para buscar a tu mascota.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${sightingData.petUrl}" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Ver Avistamiento en el Mapa</a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Este email fue enviado porque alguien reportó un avistamiento de tu mascota en PawAlert.
            </p>
        </div>
    </body>
    </html>
    `;
}
