#!/usr/bin/env python3
import os, markdown
from weasyprint import HTML

DIR = "/home/user/fheacademy/video-content-pdfs-v2"
OUT = os.path.join(DIR, "pdfs")
CSS = """
@page { size: A4; margin: 2cm; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
h1 { color: #1a237e; font-size: 22pt; border-bottom: 3px solid #1a237e; padding-bottom: 8px; margin-top: 0; }
h2 { color: #283593; font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
h3 { color: #3949ab; font-size: 13pt; margin-top: 18px; }
code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'DejaVu Sans Mono', monospace; font-size: 9.5pt; }
pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 12px; font-size: 9pt; line-height: 1.4; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; }
th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; font-size: 10pt; }
th { background: #e8eaf6; color: #1a237e; font-weight: bold; }
tr:nth-child(even) { background: #f9f9f9; }
strong { color: #1a237e; }
hr { border: none; border-top: 2px solid #e0e0e0; margin: 24px 0; }
"""

os.makedirs(OUT, exist_ok=True)
for f in sorted(os.listdir(DIR)):
    if not f.endswith('.md'): continue
    with open(os.path.join(DIR, f)) as fh: md = fh.read()
    html = markdown.markdown(md, extensions=['tables', 'fenced_code'])
    full = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{html}</body></html>"
    pdf = os.path.join(OUT, f.replace('.md', '.pdf'))
    HTML(string=full).write_pdf(pdf)
    print(f"  OK {f.replace('.md', '.pdf')}")
print("Done!")
