import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();

    if (!content || !type) {
      return NextResponse.json({ error: 'Content and type required' }, { status: 400 });
    }

    // Create PDF
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`${type.toUpperCase()} Export`, 20, 30);

    let yPosition = 50;

    const addText = (text: string, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 6 + 10;
    };

    if (type === 'bmc' || type === 'lc') {
      Object.entries(content).forEach(([key, value]) => {
        addText(`${key.replace('_', ' ').toUpperCase()}:`, 14);
        addText(String(value), 10);
      });
    } else if (type === 'bp') {
      Object.entries(content).forEach(([key, value]) => {
        addText(key.replace('_', ' ').toUpperCase(), 14);
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            addText(`  ${subKey.replace('_', ' ')}:`, 12);
            addText(String(subValue), 10);
          });
        } else {
          addText(String(value), 10);
        }
      });
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-export.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
