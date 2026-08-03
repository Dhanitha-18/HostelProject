/**
 * Seed script: Populates the Facility table with all 12 facilities
 * from the Student Portal's hardcoded PG_FACILITIES list.
 *
 * Run with: npx tsx seed-facilities.ts
 * (from the Admin/backend directory)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FACILITIES = [
  {
    title: 'High-Speed Wi-Fi',
    description: 'Commercial gigabit bandwidth across all lounge and study areas.',
    imageUrl: '/facilities/wifib.jpeg',
  },
  {
    title: 'Laundry Services',
    description: 'Washing machines and professional dry cleaning schedules twice a week.',
    imageUrl: '/facilities/washingmachine.jpeg',
  },
  {
    title: 'RO Purified Water',
    description: 'Continuous RO water dispensers on every floor checked for TDS levels.',
    imageUrl: '/facilities/rowater.jpeg',
  },
  {
    title: 'Power Backup',
    description: 'Silent diesel generator backup ensuring 24/7 electricity coverage.',
    imageUrl: '/facilities/power.jpeg',
  },
  {
    title: 'Biometric Security',
    description: 'Secure biometric fingerprint access points on main entry gates.',
    imageUrl: '/facilities/tanker.jpeg',
  },
  {
    title: 'CCTV Surveillance',
    description: '60+ CCTV high definition cameras covering lobbies, corridors, and perimeters.',
    imageUrl: '/facilities/cctv.jpeg',
  },
  {
    title: 'Two-Wheeler Parking',
    description: 'Dedicated basement parking spots with security guard patrols.',
    imageUrl: '/facilities/shoerack.jpeg',
  },
  {
    title: 'Daily Housekeeping',
    description: 'Professional sweeping and garbage disposal in all rooms every morning.',
    imageUrl: '/facilities/cleaning2.jpeg',
  },
  {
    title: 'Indoor Games Arena',
    description: 'Table tennis, carrom boards, and chess in the recreation lounge.',
    imageUrl: '/facilities/FireExtinguisher.jpeg',
  },
  {
    title: 'Quiet Study Area',
    description: 'Separate soundproof cabins equipped with desk lights and ports.',
    imageUrl: '/facilities/dryarea.jpeg',
  },
  {
    title: 'Hot Water Supply',
    description: 'Solar heaters backed by instant geysers in all restrooms.',
    imageUrl: '/facilities/tanker.jpeg',
  },
  {
    title: 'Modern Lift Access',
    description: 'Reliable 8-passenger automatic elevator with ARD safety triggers.',
    imageUrl: '/facilities/lift.jpeg',
  },
];

async function main() {
  console.log('🌱 Seeding facilities...');

  // Clear existing facilities first to avoid duplicates
  const deleted = await prisma.facility.deleteMany({});
  console.log(`   Cleared ${deleted.count} existing facilities.`);

  for (const facility of FACILITIES) {
    const created = await prisma.facility.create({ data: facility });
    console.log(`   ✅ Created: ${created.title}`);
  }

  console.log(`\n✨ Done! ${FACILITIES.length} facilities seeded successfully.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
