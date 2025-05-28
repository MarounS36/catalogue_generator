// generate-catalog.js - Main script to generate your catalog with image support

const CatalogGenerator = require('./catalog-generator');
const ImageManager = require('./image-utils');
const catalogData = require('./catalog-data');
const fs = require('fs');

async function main() {
    try {
        console.log('🚀 Starting catalog generation with images...');
        
        const generator = new CatalogGenerator();
        const imageManager = new ImageManager();
        
        // Check image availability
        console.log('📊 Checking image availability...');
        const allProducts = catalogData.flatMap(page => page.products);
        const imageReport = imageManager.generateImageReport(allProducts);
        
        // Auto-update catalog data with matched images
        const updatedCatalogData = imageManager.updateCatalogWithImages(catalogData);
        
        // Generate PDF with images
        console.log('📄 Generating PDF...');
        await generator.generatePDF(updatedCatalogData, 'dws-catalog-with-images.pdf');
        
        console.log('✅ Catalog generated successfully!');
        console.log('📁 Output file: dws-catalog-with-images.pdf');
        
        // Optional: Also generate HTML for preview
        const html = generator.generateFullHTML(updatedCatalogData);
        fs.writeFileSync('catalog-preview-with-images.html', html);
        console.log('🌐 HTML preview: catalog-preview-with-images.html');
        
        // Show summary
        console.log(`\n📈 GENERATION SUMMARY:`);
        console.log(`   Products with images: ${imageReport.matched.length}`);
        console.log(`   Products with fallback design: ${imageReport.unmatched.length}`);
        console.log(`   Total products: ${allProducts.length}`);
        
    } catch (error) {
        console.error('❌ Error generating catalog:', error);
        process.exit(1);
    }
}

// Alternative: Generate from JSON with image paths
async function generateFromJSONWithImages(jsonFile) {
    try {
        console.log(`📖 Loading data from ${jsonFile}...`);
        
        const rawData = fs.readFileSync(jsonFile, 'utf8');
        const data = JSON.parse(rawData);
        
        const generator = new CatalogGenerator();
        const imageManager = new ImageManager();
        
        // Process images for all products
        const processedData = data.map(page => ({
            ...page,
            products: page.products.map(product => {
                // Auto-find images if not specified
                if (!product.imagePath && !product.imageUrl) {
                    const matched = imageManager.matchProductsWithImages([product]);
                    if (matched.matched.length > 0) {
                        return matched.matched[0];
                    }
                }
                return product;
            })
        }));
        
        await generator.generatePDF(processedData, 'catalog-from-json-with-images.pdf');
        console.log('✅ Catalog generated from JSON with images successfully!');
        
    } catch (error) {
        console.error('❌ Error generating catalog from JSON:', error);
        process.exit(1);
    }
}

// Alternative: Generate from CSV with automatic image matching
async function generateFromCSVWithImages(csvFile) {
    try {
        console.log(`📊 Loading data from ${csvFile}...`);
        
        const csvData = fs.readFileSync(csvFile, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const products = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const product = {};
                headers.forEach((header, index) => {
                    product[header] = values[index] ? values[index].trim() : '';
                });
                products.push(product);
            }
        }
        
        // Group products by category
        const groupedData = products.reduce((acc, product) => {
            const category = product.category || 'General';
            if (!acc[category]) {
                acc[category] = {
                    title: category,
                    subtitle: "Special Offers",
                    products: []
                };
            }
            acc[category].products.push(product);
            return acc;
        }, {});
        
        const catalogPages = Object.values(groupedData);
        
        // Auto-match images
        const imageManager = new ImageManager();
        const catalogWithImages = imageManager.updateCatalogWithImages(catalogPages);
        
        const generator = new CatalogGenerator();
        await generator.generatePDF(catalogWithImages, 'catalog-from-csv-with-images.pdf');
        
        console.log('✅ Catalog generated from CSV with images successfully!');
        
    } catch (error) {
        console.error('❌ Error generating catalog from CSV:', error);
        process.exit(1);
    }
}

// Batch processing for multiple image formats
async function generateMultipleFormats() {
    try {
        console.log('🎯 Generating catalog in multiple formats...');
        
        const generator = new CatalogGenerator();
        const imageManager = new ImageManager();
        
        // Process catalog data
        const updatedCatalogData = imageManager.updateCatalogWithImages(catalogData);
        
        // Generate PDF
        await generator.generatePDF(updatedCatalogData, 'output/catalog.pdf');
        
        // Generate HTML
        const html = generator.generateFullHTML(updatedCatalogData);
        fs.writeFileSync('output/catalog.html', html);
        
        // Generate individual page HTMLs
        updatedCatalogData.forEach((page, index) => {
            const pageHtml = generator.generateFullHTML([page]);
            fs.writeFileSync(`output/page-${index + 1}-${page.title.toLowerCase()}.html`, pageHtml);
        });
        
        console.log('✅ Generated multiple formats in ./output/ directory');
        
    } catch (error) {
        console.error('❌ Error in batch generation:', error);
        process.exit(1);
    }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
    // Default: use hardcoded data with images
    main();
} else if (args[0] === '--json' && args[1]) {
    generateFromJSONWithImages(args[1]);
} else if (args[0] === '--csv' && args[1]) {
    generateFromCSVWithImages(args[1]);
} else if (args[0] === '--batch') {
    // Ensure output directory exists
    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }
    generateMultipleFormats();
} else if (args[0] === '--setup-images') {
    // Setup image directory structure
    const imageManager = new ImageManager();
    imageManager.createCategoryDirectories();
    console.log('📁 Image directories created! Add your product images to ./images/');
} else {
    console.log(`
Usage:
  node generate-catalog.js                      # Use hardcoded data with images
  node generate-catalog.js --json data.json    # Use JSON file with image matching
  node generate-catalog.js --csv data.csv      # Use CSV file with image matching
  node generate-catalog.js --batch             # Generate multiple formats
  node generate-catalog.js --setup-images      # Create image directory structure

Image Support:
  • Place images in ./images/ directory
  • Organize by category: ./images/aperitif/, ./images/whisky/, etc.
  • Supported formats: JPG, PNG, GIF, WebP
  • Auto-matching by product name and reference number
  • Fallback to design elements for missing images

For image management:
  node image-utils.js --setup                  # Setup directory structure  
  node image-utils.js --scan                   # Scan and match images
    `);
    process.exit(1);
}