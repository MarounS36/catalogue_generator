#!/usr/bin/env python3
"""
Catalog Generator - Convert Excel product data to PDF catalog using HTML/CSS template.

Required packages:
- pandas
- Jinja2
- WeasyPrint
- openpyxl (for Excel reading support in pandas)

Install with: pip install pandas jinja2 weasyprint openpyxl
"""

import argparse
import logging
import os
import sys
from pathlib import Path

import pandas as pd
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('catalog_generator')

def read_excel_file(file_path):
    """
    Read Excel file into a pandas DataFrame.
    
    Args:
        file_path: Path to the Excel file
        
    Returns:
        pandas DataFrame containing the product data
    """
    try:
        logger.info(f"Reading Excel file: {file_path}")
        df = pd.read_excel(file_path)
        
        # Check for required columns
        required_columns = [
            'image_url', 'box_info', 'name', 'variant', 
            'ref', 'price', 'regular_price', 'promo_tag', 'ribbon_flag'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Excel file is missing required columns: {', '.join(missing_columns)}")
        
        logger.info(f"Successfully read {len(df)} products from Excel")
        return df
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        raise

def split_into_pages(df, items_per_page):
    """
    Split DataFrame into pages with a specified number of items per page.
    
    Args:
        df: pandas DataFrame containing product data
        items_per_page: Number of items to include on each page
        
    Returns:
        List of pages, each containing a list of product dictionaries
    """
    logger.info(f"Splitting {len(df)} products into pages of {items_per_page} items")
    
    # Calculate number of pages needed
    num_pages = (len(df) + items_per_page - 1) // items_per_page
    
    # Split DataFrame into pages
    pages = []
    for i in range(num_pages):
        start_idx = i * items_per_page
        end_idx = min((i + 1) * items_per_page, len(df))
        page_df = df.iloc[start_idx:end_idx].copy()
        
        # Convert DataFrame to list of dictionaries for easier template rendering
        page_data = page_df.to_dict(orient='records')
        pages.append(page_data)
    
    logger.info(f"Created {len(pages)} pages")
    return pages

def create_jinja2_template(html_template_path):
    """
    Convert the HTML file to a Jinja2 template.
    
    Args:
        html_template_path: Path to the HTML template file
        
    Returns:
        Path to the generated Jinja2 template file
    """
    try:
        logger.info(f"Reading HTML template: {html_template_path}")
        with open(html_template_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Create a new filename for the Jinja2 template
        template_dir = os.path.dirname(html_template_path)
        template_filename = os.path.basename(html_template_path)
        jinja_template_path = os.path.join(
            template_dir, 
            f"{os.path.splitext(template_filename)[0]}_jinja.html"
        )
        
        # Replace the hardcoded catalog-item divs with a Jinja2 for loop
        # First, find the catalog-grid div
        catalog_grid_start = html.find('<div class="catalog-grid">')
        catalog_grid_end = html.rfind('</div>', 0, html.find('<div class="footer">'))
        
        # Extract content before and after the catalog grid
        template_start = html[:catalog_grid_start + len('<div class="catalog-grid">')]
        template_end = html[catalog_grid_end:]
        
        # Create the Jinja2 loop template for catalog items
        jinja_loop = '''
            {% for item in items %}
            <div class="catalog-item">
                {% if item.ribbon_flag %}
                <div class="ribbon">Special</div>
                {% endif %}
                <div class="product-image">
                    <img src="{{ item.image_url }}" alt="{{ item.name }}">
                </div>
                <div class="product-details">
                    <div class="box-info">{{ item.box_info }}</div>
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-variant">{{ item.variant }}</div>
                    <div class="product-ref">Ref: {{ item.ref }}</div>
                    <div class="price-section">
                        <div class="price-left">
                            <div class="price-box">{{ item.price }} €</div>
                            <div class="regular-price">{{ item.regular_price }} € Reg. Price</div>
                        </div>
                        <div class="promo-tag">{{ item.promo_tag }}</div>
                    </div>
                </div>
            </div>
            {% endfor %}
        '''
        
        # Replace the page number with a Jinja2 variable
        template_start = template_start.replace('<div class="page-number">03</div>', 
                                              '<div class="page-number">{{ page_number }}</div>')
        
        # Combine all parts to create the complete Jinja2 template
        jinja_template = template_start + jinja_loop + template_end
        
        # Write the Jinja2 template to a file
        with open(jinja_template_path, 'w', encoding='utf-8') as f:
            f.write(jinja_template)
        
        logger.info(f"Jinja2 template created: {jinja_template_path}")
        return jinja_template_path
        
    except Exception as e:
        logger.error(f"Error creating Jinja2 template: {e}")
        raise

def render_pages(template_path, pages):
    """
    Render all pages through the Jinja2 template and combine them.
    
    Args:
        template_path: Path to the Jinja2 template file
        pages: List of page data (each page is a list of product dictionaries)
        
    Returns:
        Combined HTML string with all pages
    """
    logger.info(f"Setting up Jinja2 environment with template: {template_path}")
    
    # Set up Jinja2 environment
    template_dir = os.path.dirname(os.path.abspath(template_path))
    template_file = os.path.basename(template_path)
    
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_file)
    
    logger.info("Rendering template for all pages")
    
    rendered_pages = []
    for page_idx, page_items in enumerate(pages, 1):
        logger.info(f"Rendering page {page_idx} with {len(page_items)} items")
        
        # Render the page with the current items
        rendered_page = template.render(
            items=page_items,
            page_number=f"{page_idx:02d}",  # Format as 01, 02, etc.
            total_pages=len(pages)
        )
        
        rendered_pages.append(rendered_page)
    
    # Combine all pages with page breaks
    page_break = '<div style="page-break-after: always"></div>'
    combined_html = page_break.join(rendered_pages)
    
    return combined_html

def generate_pdf(html_content, output_path):
    """
    Convert HTML to PDF using WeasyPrint.
    
    Args:
        html_content: HTML content to convert
        output_path: Path where to save the PDF
    """
    try:
        logger.info(f"Generating PDF: {output_path}")
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(os.path.abspath(output_path))
        os.makedirs(output_dir, exist_ok=True)
        
        # Create HTML object from string
        html = HTML(string=html_content)
        
        # Generate PDF
        html.write_pdf(output_path)
        
        logger.info(f"PDF successfully generated: {output_path}")
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise

def main(args):
    """
    Main function to orchestrate the catalog generation process.
    
    Args:
        args: Command-line arguments
    """
    try:
        # Read product data from Excel
        df = read_excel_file(args.excel)
        
        # Create Jinja2 template from HTML
        jinja_template_path = create_jinja2_template(args.template)
        
        # Split data into pages
        pages = split_into_pages(df, args.items_per_page)
        
        # Render template with data
        html_content = render_pages(jinja_template_path, pages)
        
        # Generate PDF
        generate_pdf(html_content, args.output)
        
        logger.info("Catalog generation completed successfully")
    except Exception as e:
        logger.error(f"Catalog generation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Generate PDF catalog from Excel product data")
    parser.add_argument("--excel", required=True, help="Path to the input Excel file")
    parser.add_argument("--template", required=True, help="Path to the HTML template file")
    parser.add_argument("--items-per-page", type=int, default=9, help="Number of items per page (default: 9)")
    parser.add_argument("--output", required=True, help="Path for the output PDF file")
    
    args = parser.parse_args()
    
    # Run the main function
    main(args)