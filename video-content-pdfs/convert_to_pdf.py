#!/usr/bin/env python3
"""Convert all markdown files to PDF using WeasyPrint."""

import os
import markdown
from weasyprint import HTML

INPUT_DIR = "/home/user/fheacademy/video-content-pdfs"
OUTPUT_DIR = "/home/user/fheacademy/video-content-pdfs/pdfs"

CSS = """
@page {
    size: A4;
    margin: 2cm;
}
body {
    font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
}
h1 {
    color: #1a237e;
    font-size: 22pt;
    border-bottom: 3px solid #1a237e;
    padding-bottom: 8px;
    margin-top: 0;
}
h2 {
    color: #283593;
    font-size: 16pt;
    margin-top: 24px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 4px;
}
h3 {
    color: #3949ab;
    font-size: 13pt;
    margin-top: 18px;
}
code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'DejaVu Sans Mono', 'Courier New', monospace;
    font-size: 9.5pt;
}
pre {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
}
pre code {
    background: none;
    padding: 0;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
}
th, td {
    border: 1px solid #ccc;
    padding: 8px 12px;
    text-align: left;
    font-size: 10pt;
}
th {
    background-color: #e8eaf6;
    color: #1a237e;
    font-weight: bold;
}
tr:nth-child(even) {
    background-color: #f9f9f9;
}
blockquote {
    border-left: 4px solid #3949ab;
    margin: 12px 0;
    padding: 8px 16px;
    background-color: #e8eaf6;
}
strong {
    color: #1a237e;
}
hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 24px 0;
}
"""

def convert_md_to_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    html_content = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'codehilite']
    )

    full_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>{CSS}</style></head>
<body>{html_content}</body>
</html>"""

    HTML(string=full_html).write_pdf(pdf_path)
    print(f"  ✓ {os.path.basename(pdf_path)}")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    md_files = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith('.md')])

    print(f"Converting {len(md_files)} markdown files to PDF...\n")

    for md_file in md_files:
        md_path = os.path.join(INPUT_DIR, md_file)
        pdf_name = md_file.replace('.md', '.pdf')
        pdf_path = os.path.join(OUTPUT_DIR, pdf_name)
        try:
            convert_md_to_pdf(md_path, pdf_path)
        except Exception as e:
            print(f"  ✗ {pdf_name}: {e}")

    print(f"\nDone! PDFs saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
