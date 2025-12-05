import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateCuid() {
  return crypto.randomBytes(12).toString('hex').substring(0, 25);
}

const vaccines = [
  {
    name: 'Rabies',
    species: 'dog',
    description: 'Rabies vaccine protects against rabies virus',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'Initial dose' },
      { dose_number: 2, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'DHPP',
    species: 'dog',
    description: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) - Core vaccine',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'First dose at 6-8 weeks' },
      { dose_number: 2, days_after_previous: 21, is_booster: false, notes: 'Second dose at 9-11 weeks' },
      { dose_number: 3, days_after_previous: 21, is_booster: false, notes: 'Third dose at 12-14 weeks' },
      { dose_number: 4, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'Bordetella',
    species: 'dog',
    description: 'Bordetella bronchiseptica vaccine (Kennel Cough)',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'Initial dose' },
      { dose_number: 2, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'Lyme',
    species: 'dog',
    description: 'Lyme disease vaccine',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'First dose' },
      { dose_number: 2, days_after_previous: 21, is_booster: false, notes: 'Second dose' },
      { dose_number: 3, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'Rabies',
    species: 'cat',
    description: 'Rabies vaccine protects against rabies virus',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'Initial dose' },
      { dose_number: 2, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'FVRCP',
    species: 'cat',
    description: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) - Core vaccine',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'First dose at 6-8 weeks' },
      { dose_number: 2, days_after_previous: 21, is_booster: false, notes: 'Second dose at 9-11 weeks' },
      { dose_number: 3, days_after_previous: 21, is_booster: false, notes: 'Third dose at 12-14 weeks' },
      { dose_number: 4, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
  {
    name: 'FeLV',
    species: 'cat',
    description: 'Feline Leukemia Virus vaccine',
    dose_schedules: [
      { dose_number: 1, days_after_previous: 0, is_booster: false, notes: 'First dose' },
      { dose_number: 2, days_after_previous: 21, is_booster: false, notes: 'Second dose' },
      { dose_number: 3, days_after_previous: 365, is_booster: true, notes: 'Annual booster' },
    ],
  },
];

async function seedVaccines() {
  try {
    console.log('Starting vaccine seed...');

    for (const vaccineData of vaccines) {
      const { dose_schedules, ...vaccineInfo } = vaccineData;

      const existingVaccine = await prisma.vaccine.findFirst({
        where: {
          name: vaccineInfo.name,
          species: vaccineInfo.species,
        },
      });

      if (existingVaccine) {
        console.log(`Vaccine ${vaccineInfo.name} for ${vaccineInfo.species} already exists, skipping...`);
        continue;
      }

      const vaccine = await prisma.vaccine.create({
        data: {
          vaccine_id: generateCuid(),
          ...vaccineInfo,
          dose_schedules: {
            create: dose_schedules.map((schedule) => ({
              schedule_id: generateCuid(),
              ...schedule,
            })),
          },
        },
      });

      console.log(`Created vaccine: ${vaccine.name} for ${vaccine.species}`);
    }

    console.log('Vaccine seed completed!');
  } catch (error) {
    console.error('Error seeding vaccines:', error);
    throw error;
  }
}

export default seedVaccines;

if (import.meta.url === `file://${process.argv[1]}`) {
  seedVaccines()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

