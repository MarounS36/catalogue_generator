const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

class CatalogGenerator {
    constructor() {
        this.cssTemplate = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            page-break-after: always;
        }

        .container:last-child {
            page-break-after: avoid;
        }

        /* Header */
        .header {
            position: relative;
            background-color: #2d2d2d;
            color: white;
            padding: 40px 60px;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            text-align: center;
            top: 0;
            right: 0;
            width: 400px;
            height: 100%;
            background-color: #0099cc;
            clip-path: polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0 50%);
            z-index: 2;
        }
        .header::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 10%;
            height: 100%;
            background-color: white;
            z-index: 1;
        }
        .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 48px;
            font-weight: normal;
            margin-right: 80px;
        }

        .header .subtitle {
            font-size: 28px;
            font-weight: normal;
        }

        .header-right {
            position: relative;
            z-index: 5;
            text-align: right;
            margin-left: auto;
        }

        .header-right .catalog-text {
            font-size: 16px;
            margin-bottom: 5px;
            z-index: 4;
        }

        .header-right .website {
            font-size: 14px;
        }

        /* Product Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 40px 60px;
        }

        .product-card {
            border: 1px solid #0099cc;
            border-radius: 15px;
            position: relative;
            background-color: white;
        }

        .bottle-container {
            height: 200px;
            padding-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .product-image {
            max-width: 120px;
            max-height: 180px;
            width: auto;
            height: auto;
            object-fit: contain;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .bottle {
            width: 80px;
            height: 180px;
            background: linear-gradient(to bottom, #d32f2f 0%, #c62828 100%);
            border-radius: 5px 5px 15px 15px;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .bottle::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 20px;
            background: #333;
            border-radius: 3px 3px 0 0;
        }

        .bottle::after {
            content: attr(data-label);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            width: 100%;
        }

        .image-placeholder {
            width: 120px;
            height: 180px;
            background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
            border: 2px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: #999;
            font-size: 12px;
            text-align: center;
            padding: 10px;
        }

        .product-details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
        }

        .product-info {
            flex: 1;
            margin-left: 30px;
        }

        .size {
            font-size: 14px;
            text-align: center;
            color: #666;
            margin-bottom: 15px;
        }

        .product-name {
            font-size: 18px;
            color: #0099cc;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .alcohol-content {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }

        .ref-number {
            font-size: 12px;
            color: #999;
        }

        .price-container {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            flex-shrink: 0;
            padding-bottom: 20px;
        }

        .promo-badge {
            background-color: #0099cc;
            color: white;
            padding: 10px 20px;
            clip-path: polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%);
            font-weight: bold;
            white-space: nowrap;
            margin-bottom: 5px;
        }

        .promo-price {
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .regular-price {
            font-size: 12px;
            color: #999;
            text-decoration: line-through;
            text-align: right;
        }

        /* Footer */
        .footer {
            background-color: #2d2d2d;
            color: white;
            padding: 20px 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150px;
            height: 80px;
            background-color: #0099cc;
            clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
            z-index: 2;
        }

        .footer::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            background-color: white;
            z-index: 1;
        }

        .footer-left {
            font-size: 12px;
            max-width: 400px;
            position: relative;
            z-index: 1;
        }

        .footer-right {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .next-arrow {
            font-size: 30px;
            color: #ccc;
        }

        .footer-nav {
            font-size: 14px;
            color: #999;
        }

        .footer-nav-text {
            font-size: 12px;
            color: #999;
        }

        @media print {
            .container {
                page-break-after: always;
            }
            .container:last-child {
                page-break-after: avoid;
            }
        }
        `;
    }

    // Utility method to convert image to base64 for PDF embedding
    imageToBase64(imagePath) {
        try {
            if (!fs.existsSync(imagePath)) {
                console.warn(`Image not found: ${imagePath}`);
                return null;
            }
            
            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imagePath).toLowerCase();
            let mimeType;
            
            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.webp':
                    mimeType = 'image/webp';
                    break;
                default:
                    console.warn(`Unsupported image format: ${ext}`);
                    return null;
            }
            
            return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        } catch (error) {
            console.warn(`Error processing image ${imagePath}:`, error.message);
            return null;
        }
    }

    // Process products to convert local images to base64
    processProductImages(products) {
        return products.map(product => {
            if (product.imagePath && !product.imagePath.startsWith('http')) {
                // Convert local image path to base64
                const base64Image = this.imageToBase64(product.imagePath);
                if (base64Image) {
                    return {
                        ...product,
                        imageUrl: base64Image,
                        originalImagePath: product.imagePath
                    };
                }
            }
            return product;
        });
    }
    

    generateProductCard(product) {
        let imageHtml;
        
        // Check if product has an image path
        if (product.imagePath) {
            // Use actual product image
            imageHtml = `
                <img src="${product.imagePath}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-placeholder" style="display: none;">
                    <div>Image<br>Not Found<br><small>${product.name}</small></div>
                </div>
            `;
        } else if (product.imageUrl) {
            // Use image URL (for web images)
            imageHtml = `
                <img src="${product.imageUrl}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-placeholder" style="display: none;">
                    <div>Image<br>Not Found<br><small>${product.name}</small></div>
                </div>
            `;
        } else {
            // Fallback to CSS bottle design
            imageHtml = `<div class="bottle" data-label="${product.label || 'PRODUCT'}"></div>`;
        }
        
        return `
        <div class="product-card">
            <div class="bottle-container">
                ${imageHtml}
            </div>
            <div class="size">${product.size}</div>
            <div class="product-details">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="alcohol-content">${product.alcohol}</div>
                    <div class="ref-number">Ref. ${product.ref}</div>
                </div>
                <div class="price-container">
                    <div class="promo-badge">
                        <div class="promo-price">${product.promoPrice}</div>
                        PROMO
                    </div>
                    <div class="regular-price">${product.regularPrice} Reg. Price</div>
                </div>
            </div>
        </div>
        `;
    }

    generatePage(pageData) {
        // Process images for this page
        const processedProducts = this.processProductImages(pageData.products);
        const productsHtml = processedProducts.map(product => this.generateProductCard(product)).join('');
        
        return `
        <div class="container">
            <div class="header">
                <div class="header-content">
                    <h1>${pageData.title}</h1>
                    <div class="subtitle">${pageData.subtitle}</div>
                    <div class="header-right">
                        <div class="catalog-text">DWS Catalog</div>
                        <div class="website">www.dws-brussels.com</div>
                    </div>
                </div>
            </div>

            <div class="products-grid">
                ${productsHtml}
            </div>

            <div class="footer">
                <div class="footer-left">
                    All offers valid while stocks last. Prices correct at the time of printing. Errors and omissions excepted.
                </div>
                <div class="footer-right">
                    <div>
                        <div class="footer-nav-text">Next Page</div>
                        <div class="footer-nav">DWS Catalogue</div>
                    </div>
                    <div class="next-arrow">≫</div>
                </div>
            </div>
        </div>
        `;
    }

    generateFullHTML(pages) {
        const pagesHtml = pages.map(page => this.generatePage(page)).join('');
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DWS Catalog</title>
            <style>${this.cssTemplate}</style>
        </head>
        <body>
            ${pagesHtml}
        </body>
        </html>
        `;
    }

    async generatePDF(pages, outputPath = 'catalog.pdf') {
        // Generate HTML
        const html = this.generateFullHTML(pages);
        
        // Save HTML file (optional, for debugging)
        fs.writeFileSync('temp_catalog.html', html);
        
        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });
        
        await browser.close();
        
        // Clean up temp file
        fs.unlinkSync('temp_catalog.html');
        
        console.log(`PDF generated: ${outputPath}`);
    }
}

// Example usage
async function generateCatalog() {
    const generator = new CatalogGenerator();
    
    // Sample data - you can load this from JSON, CSV, or database
    const catalogData = [
        {
            title: "Apperitif",
            subtitle: "Very Special Offers",
            products: [
                {
                    name: "Martini Fiero",
                    size: "1L",
                    alcohol: "14.4°",
                    ref: "00003934",
                    promoPrice: "7.50 €",
                    regularPrice: "12.00 €",
                    label: "MARTINI"
                },
                {
                    name: "Martini Rosso",
                    size: "1L",
                    alcohol: "15.0°",
                    ref: "00003935",
                    promoPrice: "8.00 €",
                    regularPrice: "13.00 €",
                    label: "MARTINI"
                },
                {
                    name: "Martini Bianco",
                    size: "750ml",
                    alcohol: "15.0°",
                    ref: "00003936",
                    promoPrice: "6.50 €",
                    regularPrice: "10.00 €",
                    label: "MARTINI"
                },
                // Add more products...
                {
                    name: "Campari",
                    size: "1L",
                    alcohol: "25.0°",
                    ref: "00003937",
                    promoPrice: "15.50 €",
                    regularPrice: "20.00 €",
                    label: "CAMPARI"
                },
                {
                    name: "Aperol",
                    size: "1L",
                    alcohol: "11.0°",
                    ref: "00003938",
                    promoPrice: "12.50 €",
                    regularPrice: "16.00 €",
                    label: "APEROL"
                },
                {
                    name: "Cynar",
                    size: "700ml",
                    alcohol: "16.5°",
                    ref: "00003939",
                    promoPrice: "14.00 €",
                    regularPrice: "18.00 €",
                    label: "CYNAR"
                },
                {
                    name: "Pimm's No.1",
                    size: "1L",
                    alcohol: "25.0°",
                    ref: "00003940",
                    promoPrice: "18.00 €",
                    regularPrice: "23.00 €",
                    label: "PIMM'S"
                },
                {
                    name: "Ricard",
                    size: "1L",
                    alcohol: "45.0°",
                    ref: "00003941",
                    promoPrice: "22.00 €",
                    regularPrice: "28.00 €",
                    label: "RICARD"
                },
                {
                    name: "Suze",
                    size: "1L",
                    alcohol: "15.0°",
                    ref: "00003942",
                    promoPrice: "16.50 €",
                    regularPrice: "21.00 €",
                    label: "SUZE"
                }
            ]
        },
        {
            title: "Whisky",
            subtitle: "Premium Selection",
            products: [
                {
                    name: "Johnnie Walker Red",
                    size: "1L",
                    alcohol: "40.0°",
                    ref: "00004001",
                    promoPrice: "25.00 €",
                    regularPrice: "32.00 €",
                    label: "JW"
                },
                // Add more whisky products...
            ]
        }
    ];
    
    await generator.generatePDF(catalogData, 'dws-catalog.pdf');
}

// Export for use as module
module.exports = CatalogGenerator;

// Run if called directly
if (require.main === module) {
    generateCatalog().catch(console.error);
}