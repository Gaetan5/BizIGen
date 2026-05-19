"""
BizGen AI - PDF Engine
Specialized engine for generating high-end business reports and pitch decks.
"""
import io
import logging
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable

from app.services.export.constants import (
    BIZGEN_PRIMARY, BIZGEN_DARK, BIZGEN_ACCENT, BIZGEN_LIGHT,
    FONT_TITLE, FONT_HEADING, FONT_BODY
)

logger = logging.getLogger(__name__)

class PDFEngine:
    """Delegated engine for all PDF generation tasks"""

    @staticmethod
    def generate_pitch_deck(deck_data: Dict[str, Any]) -> bytes:
        """Génère un Pitch Deck professionnel en PDF paysage"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=1*cm, leftMargin=1*cm, topMargin=1*cm, bottomMargin=1*cm
        )
        
        styles = getSampleStyleSheet()
        slide_title_style = ParagraphStyle(
            'SlideTitle', parent=styles['Heading1'], fontSize=32,
            textColor=colors.HexColor(BIZGEN_PRIMARY), fontName=FONT_TITLE
        )
        slide_body_style = ParagraphStyle(
            'SlideBody', parent=styles['Normal'], fontSize=18, leading=24, fontName=FONT_BODY
        )
        
        story = []
        for slide in deck_data.get("slides", []):
            story.append(Paragraph(f"{slide.get('number', '')}. {slide.get('title', '')}", slide_title_style))
            story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor(BIZGEN_PRIMARY), spaceAfter=20))
            for point in slide.get("content", []):
                story.append(Paragraph(f"• {point}", slide_body_style))
            if slide.get("visual_hint"):
                story.append(Spacer(1, 2*cm))
                story.append(Paragraph(f"<i>💡 Suggestion : {slide.get('visual_hint')}</i>", ParagraphStyle('Hint', fontSize=10, textColor=colors.grey)))
            story.append(PageBreak())
            
        doc.build(story)
        return buffer.getvalue()

    @staticmethod
    def generate_audit_report(audit_data: Dict[str, Any], project_name: str) -> bytes:
        """Génère un rapport d'audit certifié au format consulting"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        # Scoring logic
        score = audit_data.get("viability_score", 0)
        score_color = BIZGEN_ACCENT if score > 70 else "#EAB308" if score > 40 else "#EF4444"
        
        story = [
            Paragraph(f"AUDIT STRATÉGIQUE : {project_name}", ParagraphStyle('Title', fontSize=24, alignment=TA_CENTER, textColor=colors.HexColor(BIZGEN_PRIMARY))),
            Spacer(1, 1*cm),
            Paragraph("SCORE DE VIABILITÉ", ParagraphStyle('Lbl', alignment=TA_CENTER)),
            Paragraph(f"{score}/100", ParagraphStyle('Score', fontSize=64, alignment=TA_CENTER, textColor=colors.HexColor(score_color))),
            Spacer(1, 1*cm),
            Paragraph("<b>Analyse du Marché</b>", styles['Heading2']),
            Paragraph(audit_data.get("market_gap", "N/A"), styles['Normal']),
            Spacer(1, 0.5*cm),
            Paragraph("<b>Sources de Recherche Web</b>", styles['Heading3'])
        ]
        
        # Inclusion des sources citées
        for source in audit_data.get("sources_cited", []):
            story.append(Paragraph(f"• <a href='{source.get('link')}'>{source.get('title')}</a>", styles['Normal']))
            
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("<b>Recommandations</b>", styles['Heading2']))
        for rec in audit_data.get("recommendations", []):
            story.append(Paragraph(f"✅ {rec}", styles['Normal']))
            
        doc.build(story)
        return buffer.getvalue()

pdf_engine = PDFEngine()
