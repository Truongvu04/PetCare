import seedVaccines from '../prisma/seed/vaccines.js';

seedVaccines()
  .then(() => {
    console.log('✅ Vaccine seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding vaccines:', error);
    process.exit(1);
  });

