import { PrismaClient } from '@prisma/client';
import { normalizeTextEncoding } from '../src/utils/encodingHelper.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const fixProductEncoding = async () => {
  try {
    console.log('🔍 Fetching all products...');
    const products = await prisma.products.findMany({
      select: {
        product_id: true,
        name: true,
        description: true,
        category: true,
      },
    });

    console.log(`📦 Found ${products.length} products`);

    let fixedCount = 0;
    const updates = [];

    for (const product of products) {
      const originalName = product.name;
      const originalDescription = product.description;
      const originalCategory = product.category;

      const fixedName = normalizeTextEncoding(originalName);
      const fixedDescription = originalDescription ? normalizeTextEncoding(originalDescription) : null;
      const fixedCategory = originalCategory ? normalizeTextEncoding(originalCategory) : null;

      const needsUpdate = 
        fixedName !== originalName || 
        fixedDescription !== originalDescription || 
        fixedCategory !== originalCategory;

      if (needsUpdate) {
        updates.push({
          product_id: product.product_id,
          name: fixedName,
          description: fixedDescription,
          category: fixedCategory,
        });
        fixedCount++;
        console.log(`\n🔧 Product ID ${product.product_id}:`);
        console.log(`   Name: "${originalName}" -> "${fixedName}"`);
        if (originalDescription) {
          console.log(`   Description: "${originalDescription.substring(0, 50)}..." -> "${fixedDescription?.substring(0, 50)}..."`);
        }
      }
    }

    if (updates.length > 0) {
      console.log(`\n📝 Updating ${updates.length} products...`);
      
      for (const update of updates) {
        await prisma.products.update({
          where: { product_id: update.product_id },
          data: {
            name: update.name,
            description: update.description,
            category: update.category,
          },
        });
      }

      console.log(`✅ Fixed ${fixedCount} products`);
    } else {
      console.log('✅ No products need fixing');
    }

    const vendors = await prisma.vendors.findMany({
      select: {
        vendor_id: true,
        store_name: true,
        description: true,
        address: true,
      },
    });

    console.log(`\n🏪 Checking ${vendors.length} vendors...`);
    let fixedVendors = 0;

    for (const vendor of vendors) {
      const fixedStoreName = normalizeTextEncoding(vendor.store_name);
      const fixedDescription = vendor.description ? normalizeTextEncoding(vendor.description) : null;
      const fixedAddress = vendor.address ? normalizeTextEncoding(vendor.address) : null;

      const needsUpdate = 
        fixedStoreName !== vendor.store_name || 
        fixedDescription !== vendor.description || 
        fixedAddress !== vendor.address;

      if (needsUpdate) {
        await prisma.vendors.update({
          where: { vendor_id: vendor.vendor_id },
          data: {
            store_name: fixedStoreName,
            description: fixedDescription,
            address: fixedAddress,
          },
        });
        fixedVendors++;
        console.log(`🔧 Vendor ID ${vendor.vendor_id}: "${vendor.store_name}" -> "${fixedStoreName}"`);
      }
    }

    if (fixedVendors > 0) {
      console.log(`✅ Fixed ${fixedVendors} vendors`);
    } else {
      console.log('✅ No vendors need fixing');
    }

  } catch (error) {
    console.error('❌ Error fixing encoding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

fixProductEncoding()
  .then(() => {
    console.log('\n✅ Encoding fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Encoding fix failed:', error);
    process.exit(1);
  });


