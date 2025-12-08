import { prisma } from '../src/config/prisma.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const testEncoding = async () => {
  try {
    console.log('🔍 Testing encoding...\n');
    
    const testQueries = [
      { name: 'Vaccines', query: () => prisma.vaccine.findMany({ take: 5 }) },
      { name: 'Products', query: () => prisma.products.findMany({ take: 5 }) },
      { name: 'Vendors', query: () => prisma.vendors.findMany({ take: 5 }) },
      { name: 'Users', query: () => prisma.users.findMany({ take: 5 }) },
    ];
    
    for (const { name, query } of testQueries) {
      console.log(`📦 Testing ${name}...`);
      try {
        const results = await query();
        if (results && results.length > 0) {
          const first = results[0];
          const sampleFields = Object.keys(first).filter(k => typeof first[k] === 'string').slice(0, 3);
          
          console.log(`   Found ${results.length} records`);
          for (const field of sampleFields) {
            const value = first[field];
            if (value) {
              const hasBroken = /[ß╗⌐─ân╞░╗║ít├¿o╞░╗║ng├ánh]/.test(value);
              const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(value);
              
              if (hasBroken) {
                console.log(`   ❌ ${field}: "${value.substring(0, 50)}" - BROKEN ENCODING`);
              } else if (hasVietnamese) {
                console.log(`   ✅ ${field}: "${value.substring(0, 50)}" - OK`);
              } else {
                console.log(`   ℹ️  ${field}: "${value.substring(0, 50)}" - No Vietnamese chars`);
              }
            }
          }
        } else {
          console.log(`   ℹ️  No records found`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      console.log('');
    }
    
    console.log('✅ Encoding test completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testEncoding();




