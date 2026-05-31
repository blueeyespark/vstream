import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseTitle, courseType, completionDate, score, certificateId } = await req.json();

    if (!courseTitle || !certificateId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background gradient effect with colors
    const typeColors = {
      coding: { bg: '#1e78ff', accent: '#00c8ff' },
      art: { bg: '#a855f7', accent: '#ec4899' },
      creator: { bg: '#f59e0b', accent: '#fbbf24' }
    };
    
    const colors = typeColors[courseType] || typeColors.coding;

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Decorative border
    doc.setDrawColor(parseInt(colors.bg.slice(1), 16) >> 16, 
                      (parseInt(colors.bg.slice(1), 16) >> 8) & 255, 
                      parseInt(colors.bg.slice(1), 16) & 255);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Inner accent line
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Top accent bar
    doc.setFillColor(parseInt(colors.bg.slice(1), 16) >> 16, 
                     (parseInt(colors.bg.slice(1), 16) >> 8) & 255, 
                     parseInt(colors.bg.slice(1), 16) & 255);
    doc.rect(0, 0, 297, 30, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Certificate of Completion', 148.5, 18, { align: 'center' });

    // Main content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('This is to certify that', 148.5, 55, { align: 'center' });

    // User name
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(parseInt(colors.bg.slice(1), 16) >> 16, 
                     (parseInt(colors.bg.slice(1), 16) >> 8) & 255, 
                     parseInt(colors.bg.slice(1), 16) & 255);
    doc.text(user.full_name || user.email, 148.5, 70, { align: 'center' });

    // Body text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('has successfully completed the course', 148.5, 85, { align: 'center' });

    // Course title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(parseInt(colors.bg.slice(1), 16) >> 16, 
                     (parseInt(colors.bg.slice(1), 16) >> 8) & 255, 
                     parseInt(colors.bg.slice(1), 16) & 255);
    doc.text(courseTitle, 148.5, 100, { align: 'center', maxWidth: 200 });

    // Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Completion Date: ${completionDate}`, 60, 125);
    doc.text(`Final Score: ${score}%`, 60, 135);
    doc.text(`Certificate ID: ${certificateId}`, 60, 145);

    // Signature line
    doc.setLineWidth(0.5);
    doc.line(60, 165, 110, 165);
    doc.setFontSize(9);
    doc.text('Authorized by VStream', 85, 170, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('VStream Learning Platform | Verify at vstream.academy/verify', 148.5, 205, { align: 'center' });

    // Generate PDF
    const pdfData = doc.output('arraybuffer');

    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${courseTitle}_Certificate.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});