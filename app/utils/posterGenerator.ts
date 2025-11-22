import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Pet } from './storage';

export interface PosterConfig {
    headerText?: string;
    description?: string;
    contactText?: string;
    rewardText?: string;
}

export const generatePoster = async (pet: Pet, customConfig?: PosterConfig) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Colors
    const redColor = '#ef4444';
    const blackColor = '#000000';
    const whiteColor = '#ffffff';
    const grayColor = '#6b7280';

    // Default texts (Spanish)
    const config = {
        headerText: customConfig?.headerText || (pet.status === 'lost' ? 'MASCOTA PERDIDA' : 'MASCOTA ENCONTRADA'),
        description: customConfig?.description || pet.description,
        contactText: customConfig?.contactText || 'SI LA VES, POR FAVOR CONTACTA:',
        rewardText: customConfig?.rewardText || (pet.reward ? `RECOMPENSA: ${pet.reward}` : ''),
    };

    // Header - RED BACKGROUND
    doc.setFillColor(redColor);
    doc.rect(0, 0, 210, 50, 'F');

    // Header Text
    doc.setTextColor(whiteColor);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    const headerLines = doc.splitTextToSize(config.headerText, 190);
    const headerY = headerLines.length > 1 ? 20 : 30;
    doc.text(headerLines, 105, headerY, { align: 'center' });

    // Pet Photo
    if (pet.photo) {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Create a promise to load the image
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = pet.photo;
            });

            // Calculate dimensions maintaining aspect ratio
            const ratio = img.height / img.width;
            const maxWidth = 160;
            const maxHeight = 110;
            
            let finalWidth = maxWidth;
            let finalHeight = maxWidth * ratio;
            
            if (finalHeight > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = maxHeight / ratio;
            }

            // Center the image
            const x = (210 - finalWidth) / 2;
            const y = 60;

            // Add white border around image
            doc.setFillColor(255, 255, 255);
            doc.rect(x - 2, y - 2, finalWidth + 4, finalHeight + 4, 'F');
            
            // Add image
            doc.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
        } catch (e) {
            console.error('Error adding image to PDF:', e);
            // Add placeholder if image fails
            doc.setFillColor(240, 240, 240);
            doc.rect(25, 60, 160, 110, 'F');
            doc.setTextColor(grayColor);
            doc.setFontSize(14);
            doc.text('Foto no disponible', 105, 115, { align: 'center' });
        }
    }

    // Pet Details Section
    const startY = 185;

    // Pet Name
    doc.setTextColor(blackColor);
    doc.setFontSize(44);
    doc.setFont('helvetica', 'bold');
    doc.text(pet.name.toUpperCase(), 105, startY, { align: 'center' });

    // Pet Details
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor);
    const details = `${pet.breed} • ${pet.color}`;
    doc.text(details, 105, startY + 12, { align: 'center' });

    // Description
    doc.setTextColor(blackColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(config.description, 170);
    const descLines = splitDesc.slice(0, 3); // Max 3 lines
    doc.text(descLines, 105, startY + 24, { align: 'center', maxWidth: 170 });

    // Reward (if exists)
    let rewardY = startY + 24 + (descLines.length * 6);
    if (config.rewardText) {
        rewardY += 8;
        doc.setFillColor(255, 243, 205); // Light yellow background
        doc.roundedRect(30, rewardY - 8, 150, 20, 3, 3, 'F');
        
        doc.setTextColor(redColor);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(config.rewardText, 105, rewardY + 5, { align: 'center' });
    }

    // Footer / Contact
    doc.setFillColor(blackColor);
    doc.rect(0, 240, 210, 57, 'F');

    doc.setTextColor(whiteColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(config.contactText, 105, 252, { align: 'center' });

    // Contact Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(pet.contactName, 105, 263, { align: 'center' });

    // Contact Phone
    doc.setFontSize(28);
    doc.text(pet.contactPhone, 105, 276, { align: 'center' });

    // QR Code
    try {
        const qrUrl = await QRCode.toDataURL(`${window.location.origin}/pet/${pet.id}`, {
            width: 400,
            margin: 1,
        });
        doc.addImage(qrUrl, 'PNG', 165, 245, 35, 35);
        
        // QR Label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Escanear', 182.5, 285, { align: 'center' });
    } catch (e) {
        console.error('Error generating QR code:', e);
    }

    // Footer text
    doc.setFontSize(9);
    doc.setTextColor(grayColor);
    const footerText = `Última vez visto: ${pet.lastSeenLocation || 'Ubicación no especificada'}`;
    doc.text(footerText, 10, 290, { maxWidth: 145 });

    doc.save(`Mascota_${pet.name.replace(/\s+/g, '_')}.pdf`);
};

