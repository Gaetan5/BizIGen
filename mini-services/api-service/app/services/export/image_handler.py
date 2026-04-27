"""
BizGen AI - Image Export Handler (Pillow)
"""
import io
import os
from typing import Dict, Any
from datetime import datetime
from PIL import Image as PILImage, ImageDraw, ImageFont
from app.services.export.constants import (
    BIZGEN_PRIMARY, BIZGEN_DARK, BIZGEN_LIGHT, 
    BMC_COLORS, LEAN_COLORS
)

class ImageHandler:
    def __init__(self):
        self.pil_fonts = self._init_fonts()
        
    def _init_fonts(self):
        fonts = {'title': None, 'heading': None, 'body': None, 'small': None}
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "C:\\Windows\\Fonts\\arial.ttf",
        ]
        for path in font_paths:
            if os.path.exists(path):
                try:
                    fonts['title'] = ImageFont.truetype(path, 24)
                    fonts['heading'] = ImageFont.truetype(path, 14)
                    fonts['body'] = ImageFont.truetype(path, 11)
                    fonts['small'] = ImageFont.truetype(path, 9)
                    return fonts
                except: continue
        
        # Fallback
        default = ImageFont.load_default()
        return {k: default for k in fonts}

    def generate_bmc_png(self, bmc_data: Dict[str, Any], project_name: str) -> bytes:
        width, height = 1400, 900
        margin, header_height, footer_height = 20, 60, 30
        img = PILImage.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        draw.rectangle([0, 0, width, header_height], fill=BIZGEN_PRIMARY)
        draw.text((width // 2, header_height // 2), f"Business Model Canvas - {project_name}", font=self.pil_fonts['title'], fill='white', anchor='mm')
        
        grid_top, grid_bottom = header_height + margin, height - footer_height - margin
        grid_left, grid_right = margin, width - margin
        grid_width, grid_height = grid_right - grid_left, grid_bottom - grid_top
        
        row1_h, row2_h, row3_h = int(grid_height * 0.35), int(grid_height * 0.35), int(grid_height * 0.15)
        c1_w, c2_w, c3_w, c4_w = int(grid_width * 0.20), int(grid_width * 0.20), int(grid_width * 0.25), int(grid_width * 0.20)
        
        blocks = [
            {"key": "key_partners", "title": "Partenaires Clés", "rect": (grid_left, grid_top, grid_left + c1_w, grid_top + row1_h + row2_h), "color": BMC_COLORS["key_partners"]},
            {"key": "key_activities", "title": "Activités Clés", "rect": (grid_left + c1_w, grid_top, grid_left + c1_w + c2_w, grid_top + row1_h), "color": BMC_COLORS["key_activities"]},
            {"key": "value_propositions", "title": "Propositions de Valeur", "rect": (grid_left + c1_w + c2_w, grid_top, grid_left + c1_w + c2_w + c3_w, grid_top + row1_h + row2_h), "color": BMC_COLORS["value_propositions"]},
            {"key": "customer_relationships", "title": "Relations Clients", "rect": (grid_left + c1_w + c2_w + c3_w, grid_top, grid_left + c1_w + c2_w + c3_w + c4_w, grid_top + row1_h), "color": BMC_COLORS["customer_relationships"]},
            {"key": "channels", "title": "Canaux", "rect": (grid_left + c1_w + c2_w + c3_w, grid_top + row1_h, grid_right, grid_top + row1_h + row2_h), "color": BMC_COLORS["channels"]},
            {"key": "key_resources", "title": "Ressources Clés", "rect": (grid_left + c1_w, grid_top + row1_h, grid_left + c1_w + c2_w, grid_top + row1_h + row2_h), "color": BMC_COLORS["key_resources"]},
            {"key": "customer_segments", "title": "Segments Clients", "rect": (grid_left, grid_top + row1_h + row2_h, grid_right, grid_top + row1_h + row2_h + row3_h), "color": BMC_COLORS["customer_segments"]},
            {"key": "cost_structure", "title": "Structure des Coûts", "rect": (grid_left, grid_top + row1_h + row2_h + row3_h, grid_left + grid_width // 2, grid_bottom), "color": BMC_COLORS["cost_structure"]},
            {"key": "revenue_streams", "title": "Sources de Revenus", "rect": (grid_left + grid_width // 2, grid_top + row1_h + row2_h + row3_h, grid_right, grid_bottom), "color": BMC_COLORS["revenue_streams"]},
        ]
        
        for b in blocks: self._draw_block(draw, b, bmc_data.get(b["key"], []))
        
        draw.rectangle([0, height - footer_height, width, height], fill=BIZGEN_LIGHT)
        draw.text((width // 2, height - footer_height // 2), f"Généré par BizGen AI - {datetime.now().strftime('%d/%m/%Y')}", font=self.pil_fonts['small'], fill=BIZGEN_DARK, anchor='mm')
        
        buf = io.BytesIO()
        img.save(buf, format='PNG', dpi=(150, 150))
        return buf.getvalue()

    def _draw_block(self, draw, block, data):
        r, color, title = block["rect"], block["color"], block["title"]
        draw.rectangle(r, fill=color, outline=BIZGEN_DARK, width=1)
        th = 25
        draw.rectangle([r[0], r[1], r[2], r[1] + th], fill=BIZGEN_DARK)
        draw.text((r[0] + 5, r[1] + th // 2), title, font=self.pil_fonts['heading'], fill='white', anchor='lm')
        
        cy, cx = r[1] + th + 10, r[0] + 10
        if isinstance(data, list): items = data
        elif isinstance(data, dict): items = [f"{k}: {v}" for k, v in data.items()]
        else: items = [str(data)] if data else []
        
        for item in items[:10]:
            if cy + 16 > r[3] - 5: break
            draw.text((cx, cy), f"• {str(item)[:50]}", font=self.pil_fonts['body'], fill=BIZGEN_DARK)
            cy += 16
