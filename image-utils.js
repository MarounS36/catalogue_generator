// image-utils.js - Utilities for managing product images

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class ImageManager {
    constructor(imageDirectory = './images') {
        this.imageDirectory = imageDirectory;
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.imageDirectory)) {
            fs.mkdirSync(this.imageDirectory, { recursive: true });
            console.log(`📁 Created image directory: ${this.imageDirectory}`);
        }
    }

    // Create organized subdirectories for different product categories
    createCategoryDirectories(categories = ['aperitif', 'whisky', 'vodka', 'rum', 'gin']) {
        categories.forEach(category => {
            const categoryPath = path.join(this.imageDirectory, category);
            if (!fs.existsSync(categoryPath)) {
                fs.mkdirSync(categoryPath, { recursive: true });
                console.log(`📁 Created category directory: ${categoryPath}`);
            }
        });
    }

    // Download image from URL
    async downloadImage(url, filename) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https:') ? https : http;
            const filePath = path.join(this.imageDirectory, filename);
            
            client.get(url, (response) => {
                if (response.statusCode === 200) {
                    const file = fs.createWriteStream(filePath);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Downloaded: ${filename}`);
                        resolve(filePath);
                    });
                } else {
                    reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                }
            }).on('error', reject);
        });
    }

    // Batch download images from a list
    async downloadImageBatch(imageList) {
        const results = [];
        
        for (const item of imageList) {
            try {
                const filename = item.filename || this.generateFilename(item.name, item.url);
                const filePath = await this.downloadImage(item.url, filename);
                results.push({
                    name: item.name,
                    url: item.url,
                    localPath: filePath,
                    success: true
                });
            } catch (error) {
                console.error(`❌ Failed to download ${item.name}:`, error.message);
                results.push({
                    name: item.name,
                    url: item.url,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    // Generate filename from product name and URL
    generateFilename(productName, url) {
        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const sanitizedName = productName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return `${sanitizedName}${ext}`;
    }

    // Scan directory for existing images
    scanImages() {
        const images = {};
        
        const scanDirectory = (dir, category = '') => {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(itemPath, item);
                } else if (this.supportedFormats.includes(path.extname(item).toLowerCase())) {
                    const relativePath = path.relative(this.imageDirectory, itemPath);
                    const key = category ? `${category}/${item}` : item;
                    images[key] = {
                        path: itemPath,
                        relativePath: `./${path.join('images', relativePath).replace(/\\/g, '/')}`,
                        size: stat.size,
                        category: category || 'root'
                    };
                }
            });
        };
        
        scanDirectory(this.imageDirectory);
        return images;
    }

    // Match products with available images
    matchProductsWithImages(products) {
        const availableImages = this.scanImages();
        const matched = [];
        const unmatched = [];
        
        products.forEach(product => {
            let imageFound = false;
            
            // Try various matching patterns
            const searchPatterns = [
                product.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                product.name.toLowerCase().replace(/\s+/g, '-'),
                product.ref,
                product.name.toLowerCase().replace(/\s+/g, '_')
            ];
            
            for (const pattern of searchPatterns) {
                for (const [key, imageInfo] of Object.entries(availableImages)) {
                    if (key.toLowerCase().includes(pattern) || 
                        imageInfo.relativePath.toLowerCase().includes(pattern)) {
                        matched.push({
                            ...product,
                            imagePath: imageInfo.relativePath,
                            matchedBy: pattern
                        });
                        imageFound = true;
                        break;
                    }
                }
                if (imageFound) break;
            }
            
            if (!imageFound) {
                unmatched.push(product);
            }
        });
        
        return { matched, unmatched };
    }

    // Generate image report
    generateImageReport(products) {
        const availableImages = this.scanImages();
        const { matched, unmatched } = this.matchProductsWithImages(products);
        
        console.log('\n📊 IMAGE REPORT');
        console.log('================');
        console.log(`📁 Available images: ${Object.keys(availableImages).length}`);
        console.log(`✅ Products with images: ${matched.length}`);
        console.log(`❌ Products without images: ${unmatched.length}`);
        
        if (unmatched.length > 0) {
            console.log('\n📋 PRODUCTS MISSING IMAGES:');
            unmatched.forEach(product => {
                console.log(`   • ${product.name} (Ref: ${product.ref})`);
            });
        }
        
        console.log('\n📁 AVAILABLE IMAGES BY CATEGORY:');
        const imagesByCategory = Object.values(availableImages).reduce((acc, img) => {
            acc[img.category] = (acc[img.category] || 0) + 1;
            return acc;
        }, {});
        
        Object.entries(imagesByCategory).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} images`);
        });
        
        return { availableImages, matched, unmatched };
    }

    // Auto-update catalog data with image paths
    updateCatalogWithImages(catalogData) {
        return catalogData.map(page => ({
            ...page,
            products: this.matchProductsWithImages(page.products).matched
        }));
    }
}

// Example usage and utility functions
function createImageDownloadList() {
    // Example list of images to download
    return [
        {
            name: "Martini Fiero",
            url: "https://example.com/martini-fiero.jpg",
            filename: "aperitif/martini-fiero.jpg"
        },
        {
            name: "Johnnie Walker Red",
            url: "https://example.com/johnnie-walker-red.jpg",
            filename: "whisky/johnnie-walker-red.jpg"
        }
        // Add more image URLs here
    ];
}

async function setupImageDirectory() {
    const imageManager = new ImageManager();
    
    // Create category directories
    imageManager.createCategoryDirectories(['aperitif', 'whisky', 'vodka', 'rum', 'gin', 'liqueur']);
    
    console.log(`
📁 Image directory structure created!

To add your product images:
1. Place images in: ./images/
2. Organize by category: ./images/aperitif/, ./images/whisky/, etc.
3. Use clear filenames: martini-fiero.jpg, johnnie-walker-red.jpg
4. Supported formats: JPG, PNG, GIF, WebP
5. Recommended size: 400x600px or similar aspect ratio

Run: node image-utils.js --scan
to see available images and matching report.
    `);
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const imageManager = new ImageManager();
    
    if (args.includes('--setup')) {
        await setupImageDirectory();
    } 
    else if (args.includes('--scan')) {
        // Load catalog data to check matches
        try {
            const catalogData = require('./catalog-data');
            const allProducts = catalogData.flatMap(page => page.products);
            imageManager.generateImageReport(allProducts);
        } catch (error) {
            console.log('📊 Scanning available images...');
            const images = imageManager.scanImages();
            console.log(`Found ${Object.keys(images).length} images`);
            Object.entries(images).forEach(([name, info]) => {
                console.log(`   📷 ${name} (${Math.round(info.size/1024)}KB)`);
            });
        }
    }
    else if (args.includes('--download')) {
        const downloadList = createImageDownloadList();
        console.log('📡 Starting image downloads...');
        const results = await imageManager.downloadImageBatch(downloadList);
        
        const successful = results.filter(r => r.success).length;
        console.log(`\n✅ Downloaded ${successful}/${results.length} images successfully`);
    }
    else {
        console.log(`
Image Management Utilities

Usage:
  node image-utils.js --setup     # Create directory structure
  node image-utils.js --scan      # Scan and match existing images
  node image-utils.js --download  # Download images from URLs

Directory Structure:
  ./images/
  ├── aperitif/
  ├── whisky/
  ├── vodka/
  ├── rum/
  ├── gin/
  └── liqueur/
        `);
    }
}

module.exports = ImageManager;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}