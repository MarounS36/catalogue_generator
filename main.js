// generate-catalog.js - Main script to generate your catalog

const CatalogGenerator = require('./catalog-generator');
const catalogData = require('./catalog-data');
const fs = require('fs');

async function main() {
    try {
        console.log('🚀 Starting catalog generation...');
        
        const generator = new CatalogGenerator();
        
        // Generate PDF
        await generator.generatePDF(catalogData, 'dws-catalog-complete.pdf');
        
        console.log('✅ Catalog generated successfully!');
        console.log('📁 Output file: dws-catalog-complete.pdf');
        
        // Optional: Also generate HTML for preview
        const html = generator.generateFullHTML(catalogData);
        fs.writeFileSync('catalog-preview.html', html);
        console.log('🌐 HTML preview: catalog-preview.html');
        
    } catch (error) {
        console.error('❌ Error generating catalog:', error);
        process.exit(1);
    }
}

// Alternative: Load data from JSON file
async function generateFromJSON(jsonFile) {
    try {
        console.log(`📖 Loading data from ${jsonFile}...`);
        
        const rawData = fs.readFileSync(jsonFile, 'utf8');
        const data = JSON.parse(rawData);
        
        const generator = new CatalogGenerator();
        await generator.generatePDF(data, 'catalog-from-json.pdf');
        
        console.log('✅ Catalog generated from JSON successfully!');
        
    } catch (error) {
        console.error('❌ Error generating catalog from JSON:', error);
        process.exit(1);
    }
}

// Alternative: Load data from CSV (basic implementation)
async function generateFromCSV(csvFile) {
    try {
        console.log(`📊 Loading data from ${csvFile}...`);
        
        // This is a simplified CSV parser - you might want to use a library like 'csv-parser'
        const csvData = fs.readFileSync(csvFile, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const products = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const product = {};
                headers.forEach((header, index) => {
                    product[header.trim()] = values[index] ? values[index].trim() : '';
                });
                products.push(product);
            }
        }
        
        // Group products by category (assuming you have a 'category' column)
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
        
        const generator = new CatalogGenerator();
        await generator.generatePDF(catalogPages, 'catalog-from-csv.pdf');
        
        console.log('✅ Catalog generated from CSV successfully!');
        
    } catch (error) {
        console.error('❌ Error generating catalog from CSV:', error);
        process.exit(1);
    }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
    // Default: use hardcoded data
    main();
} else if (args[0] === '--json' && args[1]) {
    generateFromJSON(args[1]);
} else if (args[0] === '--csv' && args[1]) {
    generateFromCSV(args[1]);
} else {
    console.log(`
Usage:
  node generate-catalog.js                    # Use hardcoded data
  node generate-catalog.js --json data.json  # Use JSON file
  node generate-catalog.js --csv data.csv    # Use CSV file
    `);
    process.exit(1);
}