import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Pet } from './storage';

export const generatePoster = async (pet: Pet) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Colors
    const redColor = '#ef4444';
    const blackColor = '#000000';
    const whiteColor = '#ffffff';

    // Header - RED BACKGROUND
    doc.setFillColor(redColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Header Text - LOST PET
    doc.setTextColor(whiteColor);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('LOST PET', 105, 28, { align: 'center' });

    // Pet Photo
    if (pet.photo) {
        try {
            // Add image centered
            // A4 width is 210mm. Let's make image 150mm wide.
            const img = new Image();
            img.src = pet.photo;

            // Wait for image to load if needed, but usually base64 is instant.
            // However, for safety in async context:
            await new Promise((resolve) => {
                if (img.complete) resolve(true);
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });

            const ratio = img.height / img.width;
            const width = 160;
            const height = width * ratio;

            // Cap height to avoid taking too much space
            const maxHeight = 120;
            let finalWidth = width;
            let finalHeight = height;

            if (height > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = maxHeight / ratio;
            }

            doc.addImage(pet.photo, 'JPEG', (210 - finalWidth) / 2, 50, finalWidth, finalHeight);
        } catch (e) {
            console.error('Error adding image to PDF', e);
        }
    }

    // Pet Details Section
    const startY = 180;

    doc.setTextColor(blackColor);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text(pet.name.toUpperCase(), 105, startY, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pet.breed} • ${pet.color} • ${pet.status === 'lost' ? 'Missing' : pet.status}`, 105, startY + 15, { align: 'center' });

    // Description
    doc.setFontSize(16);
    const splitDesc = doc.splitTextToSize(pet.description, 170);
    doc.text(splitDesc, 105, startY + 30, { align: 'center' });

    // Reward
    if (pet.reward) {
        doc.setTextColor(redColor);
        doc.setFontSize(30);
        doc.setFont('helvetica', 'bold');
        doc.text(`REWARD: $${pet.reward}`, 105, startY + 55, { align: 'center' });
    }

    // Footer / Contact
    doc.setFillColor(blackColor);
    doc.rect(0, 240, 210, 57, 'F');

    doc.setTextColor(whiteColor);
    doc.setFontSize(20);
    doc.text('IF SEEN, PLEASE CONTACT:', 105, 255, { align: 'center' });

    doc.setFontSize(35);
    doc.setFont('helvetica', 'bold');
    doc.text(pet.contactPhone, 105, 270, { align: 'center' });

    // QR Code
    try {
        const qrUrl = await QRCode.toDataURL(window.location.href);
        doc.addImage(qrUrl, 'PNG', 160, 245, 40, 40);
    } catch (e) {
        console.error('Error generating QR code', e);
    }

    doc.save(`Lost_Pet_${pet.name}.pdf`);
};
