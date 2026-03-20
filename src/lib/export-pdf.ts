'use client';

import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPDFOptions {
  elementId: string;
  fileName: string;
  title?: string;
  subtitle?: string;
}

interface ExportBusinessPlanOptions {
  data: Record<string, unknown>;
  projectName: string;
}

export function useExportPDF() {
  const exportCanvasToPDF = useCallback(async ({ elementId, fileName, title, subtitle }: ExportPDFOptions) => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add title if provided
    if (title) {
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(title, 14, 20);
      
      if (subtitle) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(subtitle, 14, 28);
      }
    }

    // Add image
    const imgData = canvas.toDataURL('image/png');
    const yOffset = title ? 35 : 10;
    pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth - 20, imgHeight);

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Généré par BizGen AI - ${new Date().toLocaleDateString('fr-FR')}`, 14, pageHeight - 10);

    // Save
    pdf.save(`${fileName}.pdf`);
  }, []);

  const exportBusinessPlanToPDF = useCallback(async ({ data, projectName }: ExportBusinessPlanOptions) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    let yPos = margin;

    const addTitle = (text: string, size: number = 20) => {
      pdf.setFontSize(size);
      pdf.setTextColor(0, 0, 0);
      pdf.text(text, margin, yPos);
      yPos += size * 0.5;
    };

    const addSubtitle = (text: string) => {
      pdf.setFontSize(14);
      pdf.setTextColor(50, 50, 50);
      pdf.text(text, margin, yPos);
      yPos += 10;
    };

    const addText = (text: string, indent: number = 0) => {
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const lines = pdf.splitTextToSize(text, pageWidth - margin * 2 - indent);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin + indent, yPos);
        yPos += 5;
      });
    };

    const addBulletList = (items: string[], indent: number = 0) => {
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      items.forEach(item => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(`• ${item}`, margin + indent, yPos);
        yPos += 5;
      });
    };

    const checkPageBreak = (needed: number = 30) => {
      if (yPos + needed > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
    };

    // Cover Page
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Business Plan', pageWidth / 2, pageHeight / 3, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(projectName, pageWidth / 2, pageHeight / 3 + 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
    pdf.text('BizGen AI', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

    // New page for content
    pdf.addPage();
    yPos = margin;

    // Executive Summary
    const bp = data as Record<string, unknown>;
    
    if (bp.executiveSummary) {
      addTitle('Résumé Exécutif');
      addText(bp.executiveSummary as string);
      yPos += 10;
    }

    // Company Overview
    if (bp.companyOverview) {
      checkPageBreak();
      addTitle('Aperçu de l\'Entreprise', 16);
      const co = bp.companyOverview as Record<string, unknown>;
      
      addSubtitle('Mission');
      addText(co.mission as string);
      
      addSubtitle('Vision');
      addText(co.vision as string);
      
      if (Array.isArray(co.values)) {
        addSubtitle('Valeurs');
        addBulletList(co.values);
      }
      
      yPos += 5;
    }

    // Market Analysis
    if (bp.marketAnalysis) {
      checkPageBreak();
      addTitle('Analyse du Marché', 16);
      const ma = bp.marketAnalysis as Record<string, unknown>;
      
      addSubtitle('Aperçu du secteur');
      addText(ma.industryOverview as string);
      
      addSubtitle('Marché cible');
      addText(ma.targetMarket as string);
      
      addSubtitle('Taille du marché');
      addText(ma.marketSize as string);
      
      if (Array.isArray(ma.trends)) {
        addSubtitle('Tendances');
        addBulletList(ma.trends);
      }
      
      yPos += 5;
    }

    // SWOT Analysis
    if (bp.swot) {
      checkPageBreak(50);
      addTitle('Analyse SWOT', 16);
      const swot = bp.swot as Record<string, string[]>;
      
      addSubtitle('Forces');
      addBulletList(swot.strengths || []);
      
      addSubtitle('Faiblesses');
      addBulletList(swot.weaknesses || []);
      
      addSubtitle('Opportunités');
      addBulletList(swot.opportunities || []);
      
      addSubtitle('Menaces');
      addBulletList(swot.threats || []);
      
      yPos += 5;
    }

    // Competitive Analysis
    if (bp.competitiveAnalysis) {
      checkPageBreak();
      addTitle('Analyse Concurrentielle', 16);
      const ca = bp.competitiveAnalysis as Record<string, unknown>;
      
      if (Array.isArray(ca.directCompetitors)) {
        addSubtitle('Concurrents directs');
        addBulletList(ca.directCompetitors);
      }
      
      if (Array.isArray(ca.indirectCompetitors)) {
        addSubtitle('Concurrents indirects');
        addBulletList(ca.indirectCompetitors);
      }
      
      addSubtitle('Avantage concurrentiel');
      addText(ca.competitiveAdvantage as string);
      
      yPos += 5;
    }

    // Marketing Strategy
    if (bp.marketingStrategy) {
      checkPageBreak();
      addTitle('Stratégie Marketing', 16);
      const ms = bp.marketingStrategy as Record<string, unknown>;
      
      addSubtitle('Positionnement');
      addText(ms.positioning as string);
      
      if (Array.isArray(ms.channels)) {
        addSubtitle('Canaux de distribution');
        addBulletList(ms.channels);
      }
      
      addSubtitle('Stratégie de prix');
      addText(ms.pricingStrategy as string);
      
      addSubtitle('Approche commerciale');
      addText(ms.salesApproach as string);
      
      yPos += 5;
    }

    // Financial Projections
    if (bp.financialProjections) {
      checkPageBreak();
      addTitle('Projections Financières', 16);
      const fp = bp.financialProjections as Record<string, unknown>;
      
      addSubtitle('Revenus projetés');
      addText(`Année 1: ${fp.year1Revenue}`);
      addText(`Année 2: ${fp.year2Revenue}`);
      addText(`Année 3: ${fp.year3Revenue}`);
      
      addSubtitle('Point d\'équilibre');
      addText(`Mois ${fp.breakEvenMonth}`);
      
      addSubtitle('Financement requis');
      addText(fp.fundingRequired as string);
      
      if (Array.isArray(fp.useOfFunds)) {
        addSubtitle('Utilisation des fonds');
        addBulletList(fp.useOfFunds);
      }
      
      yPos += 5;
    }

    // Operations Plan
    if (bp.operationsPlan) {
      checkPageBreak();
      addTitle('Plan Opérationnel', 16);
      const op = bp.operationsPlan as Record<string, string[]>;
      
      if (Array.isArray(op.keyActivities)) {
        addSubtitle('Activités clés');
        addBulletList(op.keyActivities);
      }
      
      if (Array.isArray(op.keyResources)) {
        addSubtitle('Ressources clés');
        addBulletList(op.keyResources);
      }
      
      if (Array.isArray(op.keyPartners)) {
        addSubtitle('Partenaires clés');
        addBulletList(op.keyPartners);
      }
      
      if (Array.isArray(op.milestones)) {
        addSubtitle('Jalons');
        addBulletList(op.milestones);
      }
      
      yPos += 5;
    }

    // Team
    if (bp.team) {
      checkPageBreak();
      addTitle('Équipe', 16);
      const team = bp.team as Record<string, string[]>;
      
      if (Array.isArray(team.founders)) {
        addSubtitle('Fondateurs');
        addBulletList(team.founders);
      }
      
      if (Array.isArray(team.keyHires)) {
        addSubtitle('Recrutements clés');
        addBulletList(team.keyHires);
      }
      
      if (Array.isArray(team.advisors)) {
        addSubtitle('Conseillers');
        addBulletList(team.advisors);
      }
      
      yPos += 5;
    }

    // Risk Analysis
    if (bp.riskAnalysis) {
      checkPageBreak();
      addTitle('Analyse des Risques', 16);
      const ra = bp.riskAnalysis as Record<string, string[]>;
      
      if (Array.isArray(ra.risks)) {
        addSubtitle('Risques identifiés');
        ra.risks.forEach((risk, i) => {
          addText(`• ${risk}`);
          if (ra.mitigations && ra.mitigations[i]) {
            addText(`  Mitigation: ${ra.mitigations[i]}`, 5);
          }
        });
      }
    }

    // Add page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Save
    pdf.save(`Business_Plan_${projectName.replace(/\s+/g, '_')}.pdf`);
  }, []);

  return { exportCanvasToPDF, exportBusinessPlanToPDF };
}
