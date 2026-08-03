import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding mock data...')

  // Clean existing data
  await prisma.allocation.deleteMany()
  await prisma.document.deleteMany()
  await prisma.bed.deleteMany()
  await prisma.room.deleteMany()
  await prisma.block.deleteMany()
  await prisma.application.deleteMany()
  await prisma.facility.deleteMany()

  // ─── Seed Facilities ──────────────────────────────────────────────────────
  await prisma.facility.createMany({
    data: [
      { title: 'High-Speed Wi-Fi',    description: 'Commercial gigabit bandwidth across all lounge and study areas.',               imageUrl: '/facilities/wifib.jpeg' },
      { title: 'Laundry Services',     description: 'Washing machines and professional dry cleaning schedules twice a week.',       imageUrl: '/facilities/washingmachine.jpeg' },
      { title: 'RO Purified Water',    description: 'Continuous RO water dispensers on every floor checked for TDS levels.',       imageUrl: '/facilities/rowater.jpeg' },
      { title: 'Power Backup',         description: 'Silent diesel generator backup ensuring 24/7 electricity coverage.',           imageUrl: '/facilities/power.jpeg' },
      { title: 'Biometric Security',   description: 'Secure biometric fingerprint access points on main entry gates.',              imageUrl: '/facilities/tanker.jpeg' },
      { title: 'CCTV Surveillance',    description: '60+ CCTV cameras covering lobbies, corridors, and perimeters.',               imageUrl: '/facilities/cctv.jpeg' },
      { title: 'Two-Wheeler Parking',  description: 'Dedicated basement parking spots with security guard patrols.',               imageUrl: '/facilities/shoerack.jpeg' },
      { title: 'Daily Housekeeping',   description: 'Professional sweeping and garbage disposal in all rooms every morning.',      imageUrl: '/facilities/cleaning2.jpeg' },
      { title: 'Indoor Games Arena',   description: 'Table tennis, carrom boards, and chess in the recreation lounge.',            imageUrl: '/facilities/FireExtinguisher.jpeg' },
      { title: 'Quiet Study Area',     description: 'Separate soundproof cabins equipped with desk lights and ports.',             imageUrl: '/facilities/dryarea.jpeg' },
      { title: 'Hot Water Supply',     description: 'Solar heaters backed by instant geysers in all restrooms.',                  imageUrl: '/facilities/tanker.jpeg' },
      { title: 'Modern Lift Access',   description: 'Reliable 8-passenger automatic elevator with ARD safety triggers.',          imageUrl: '/facilities/lift.jpeg' },
    ]
  })
  console.log('Seeded 12 facilities.')
  // ─────────────────────────────────────────────────────────────────────────────

  // Create Blocks
  const boysBlockA = await prisma.block.create({ data: { name: 'Boys Block A', gender: 'MALE' } })
  const boysBlockB = await prisma.block.create({ data: { name: 'Boys Block B', gender: 'MALE' } })
  const boysBlockC = await prisma.block.create({ data: { name: 'Boys Block C', gender: 'MALE' } })
  const girlsBlockA = await prisma.block.create({ data: { name: 'Girls Block A', gender: 'FEMALE' } })

  const boysBlocks = [boysBlockA, boysBlockB, boysBlockC];

  // Create Rooms & Beds for Boys Blocks
  for (const block of boysBlocks) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 3; i++) {
        const room = await prisma.room.create({
          data: {
            blockId: block.id,
            roomNo: `${floor}0${i}`,
            floor: floor,
            capacity: 4,
            type: '4 Sharing'
          }
        })
        for (let j = 1; j <= 4; j++) {
          await prisma.bed.create({
            data: {
              roomId: room.id,
              bedNo: j,
              status: 'AVAILABLE'
            }
          })
        }
      }
    }
  }

  // Create Rooms & Beds for Girls Block
  for (let i = 1; i <= 3; i++) {
    const room = await prisma.room.create({
      data: {
        blockId: girlsBlockA.id,
        roomNo: `20${i}`,
        floor: 2,
        capacity: 4,
        type: '4 Sharing'
      }
    })
    for (let j = 1; j <= 4; j++) {
      await prisma.bed.create({
        data: {
          roomId: room.id,
          bedNo: j,
          status: 'AVAILABLE'
        }
      })
    }
  }

  // Create 100 Applications
  const firstNames = ['John', 'Jane', 'Mike', 'Emily', 'Chris', 'Sarah', 'Alex', 'Katie', 'Rahul', 'Priya', 'Amit', 'Neha', 'Daniel', 'Sophia', 'David', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Kumar', 'Sharma', 'Singh', 'Patel'];
  const departments = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 'DS'];
  const genders = ['MALE', 'FEMALE'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const status = 'PENDING';
    const usnNum = i.toString().padStart(3, '0');

    await prisma.application.create({
      data: {
        studentName: `${fName} ${lName}`,
        phoneNumber: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        fatherName: `Mr. ${lName}`,
        fatherPhone: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        gender: gender,
        usn: `1BM21${dept.substring(0, 2)}${usnNum}`,
        department: dept,
        yearSem: `${Math.floor(Math.random() * 4) + 1} Year`,
        dob: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `${Math.floor(Math.random() * 999) + 1} Main St, Bengaluru`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@bmsit.in`,
        hostelPref: '4 Sharing',
        emergencyContact: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        status: status
      }
    });
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
