import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'
import nodemailer from "nodemailer";
import crypto from 'crypto';


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
})

const prisma = new PrismaClient()

async function sendRealEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    if (!to || !to.trim()) return false;
    
    // Bypass SMTP delivery ONLY in test environment (e.g. NODE_ENV === 'test')
    if (process.env.NODE_ENV === 'test') {
      console.log(`[TEST MODE] Bypassed SMTP send for ${to}: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'no-reply@hostel.com',
      to: to.trim(),
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error(`Email delivery error for ${to} (non-blocking):`, err);
    return false;
  }
}

app.use(cors())
app.use(express.json())

// Presence State
export type AdminPresence = {
  socketId: string;
  adminName: string;
  role: string;
  currentModule: string;
  lastActive: Date;
  status: 'online' | 'idle';
};

export type EditingLock = {
  resourceId: string;
  resourceType: string;
  adminName: string;
  socketId: string;
  lockedAt: Date;
};

const connectedAdmins = new Map<string, AdminPresence>();
const activeLocks = new Map<string, EditingLock>();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send initial state to the newly connected client
  socket.emit('presence_updated', Array.from(connectedAdmins.values()));
  socket.emit('locks_updated', Array.from(activeLocks.values()));

  socket.on('admin_join', (data: { adminName: string; role: string }) => {
    connectedAdmins.set(socket.id, {
      socketId: socket.id,
      adminName: data.adminName,
      role: data.role,
      currentModule: 'Dashboard',
      lastActive: new Date(),
      status: 'online'
    });
    io.emit('presence_updated', Array.from(connectedAdmins.values()));
  });

  socket.on('admin_navigate', (moduleName: string) => {
    const admin = connectedAdmins.get(socket.id);
    if (admin) {
      admin.currentModule = moduleName;
      admin.lastActive = new Date();
      connectedAdmins.set(socket.id, admin);
      io.emit('presence_updated', Array.from(connectedAdmins.values()));
    }
  });

  socket.on('lock_acquire', (data: { resourceId: string; resourceType: string }) => {
    const admin = connectedAdmins.get(socket.id);
    if (!admin) return;

    const lockKey = `${data.resourceType}_${data.resourceId}`;
    if (!activeLocks.has(lockKey)) {
      activeLocks.set(lockKey, {
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        adminName: admin.adminName,
        socketId: socket.id,
        lockedAt: new Date()
      });
      io.emit('locks_updated', Array.from(activeLocks.values()));
    }
  });

  socket.on('lock_release', (data: { resourceId: string; resourceType: string }) => {
    const lockKey = `${data.resourceType}_${data.resourceId}`;
    const lock = activeLocks.get(lockKey);
    if (lock && lock.socketId === socket.id) {
      activeLocks.delete(lockKey);
      io.emit('locks_updated', Array.from(activeLocks.values()));
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedAdmins.delete(socket.id);
    
    // Release any locks held by this socket
    for (const [key, lock] of activeLocks.entries()) {
      if (lock.socketId === socket.id) {
        activeLocks.delete(key);
      }
    }
    
    io.emit('presence_updated', Array.from(connectedAdmins.values()));
    io.emit('locks_updated', Array.from(activeLocks.values()));
  });
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Student submits hostel application
app.post('/api/applications', async (req, res) => {
  try {
    console.log("====== APPLICATION RECEIVED ======");
    console.log(req.body);

    const data = req.body;

    const application = await prisma.application.create({
  data: {
    studentName: data.studentName,
    phoneNumber: data.phoneNumber,
    fatherName: data.fatherName,
    fatherPhone: data.fatherPhone,
    gender: data.gender,
    usn: data.usn,
    department: data.department,
    yearSem: data.yearSem,
    dob: new Date(data.dob),
    address: data.address,
    email: data.email,
    category: data.category || null,
    hostelPref: data.hostelPref,
    medicalInfo: data.medicalInfo || null,
    emergencyContact: data.emergencyContact,
    remarks: data.remarks || null,
    status: "PENDING",
    holdReason: null,
    bmsitId: data.bmsitId || null,
    fatherEmail: data.fatherEmail || null,
    motherEmail: data.motherEmail || null,
    guardianEmail: data.guardianEmail || null,
    motherName: data.motherName || null,
    motherPhone: data.motherPhone || null,
    guardianName: data.guardianName || null,
    guardianPhone: data.guardianPhone || null,
    quota: data.quota || null,
    rank: data.rank || null,
    bloodGroup: data.bloodGroup || null,
    nationality: data.nationality || null,
    religion: data.religion || null,
    aadhaar: data.aadhaar || null,
    fatherOcc: data.fatherOcc || null,
    motherOcc: data.motherOcc || null,
    allergies: data.allergies || null,
    medication: data.medication || null
  }
});

    let passportPhoto = null;
    if (data.passportPhoto || data.photoUrl) {
      const url = data.passportPhoto || data.photoUrl;
      const existingPhotoDoc = await prisma.document.findFirst({
        where: {
          applicationId: application.id,
          name: "Passport Photo"
        }
      });

      if (existingPhotoDoc) {
        const updatedDoc = await prisma.document.update({
          where: { id: existingPhotoDoc.id },
          data: { url }
        });
        passportPhoto = updatedDoc.url;
      } else {
        const newDoc = await prisma.document.create({
          data: {
            applicationId: application.id,
            name: "Passport Photo",
            url
          }
        });
        passportPhoto = newDoc.url;
      }
    }

console.log("Saved successfully:", application);

io.emit('data_updated');
io.emit('APPLICATION_UPDATED', application);

res.status(201).json({
  ...application,
  passportPhoto,
  photoUrl: passportPhoto
});

  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});
app.get('/api/applications', async (req, res) => {
  try {
    const { status } = req.query;
    const [applications, sentHistories, approvedPayments] = await Promise.all([
      prisma.application.findMany({
        where: status ? { status: String(status) } : undefined,
        orderBy: { appliedAt: 'asc' }, // First Come First Serve
        include: { 
          allocations: {
            include: {
              bed: {
                include: {
                  room: {
                    include: {
                      block: true
                    }
                  }
                }
              }
            }
          }, 
          documents: true 
        }
      }),
      prisma.emailHistory.findMany({
        where: { status: 'Sent' }
      }),
      prisma.payment.findMany({
        where: { status: 'APPROVED' }
      })
    ]);

    const approvedUsns = new Set(approvedPayments.map(p => p.studentUsn));

    const mapped = applications.map(app => {
      const photoDoc = app.documents.find(d => d.name === "Passport Photo");
      
      const studentSent = sentHistories.filter(h => h.studentId === app.id);
      const sentEmails: Record<string, { date: string; student: boolean; father: boolean; mother: boolean }> = {};
      
      const workflows = [
        { name: 'Allocation', key: 'ALLOCATION' },
        { name: 'Rejection', key: 'REJECTION' },
        { name: 'Payment Confirmation', key: 'PAYMENT_CONFIRMATION' },
        { name: 'Payment Reminder', key: 'PAYMENT_REMINDER' },
        { name: 'Annual Hostel Fee Reminder', key: 'ANNUAL_FEE_REMINDER' }
      ];
      for (const wf of workflows) {
        const latest = studentSent
          .filter(h => h.workflow === wf.name)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (latest) {
          sentEmails[wf.key] = {
            date: latest.createdAt.toISOString(),
            student: true,
            father: true,
            mother: true
          };
        }
      }

      return {
        ...app,
        createdAt: app.appliedAt,
        passportPhoto: photoDoc ? photoDoc.url : null,
        photoUrl: photoDoc ? photoDoc.url : null,
        sentEmails,
        hasApprovedPayment: approvedUsns.has(app.usn)
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update multiple applications status
app.post('/api/applications/batch-status', async (req, res) => {
  try {
    const { ids, status, reason } = req.body;

    await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status, holdReason: reason || null }
    });

    io.emit('data_updated');

    const emailMode = await getEmailMode();
    if (status === 'REJECTED' && emailMode === 'Automatic') {
      for (const appId of ids) {
        sendWorkflowEmail(appId, 'REJECTION', 'Automatic').catch(err => console.error("Auto rejection email error:", err));
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update applications' });
  }
});

// Get Blocks and Room Availability
app.get('/api/blocks', async (req, res) => {
  try {
    const blocks = await prisma.block.findMany({
      include: {
        rooms: {
          include: { beds: true }
        }
      }
    });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

app.get('/api/allocations', async (req, res) => {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        application: true,
        bed: {
          include: {
            room: {
              include: {
                block: true
              }
            }
          }
        }
      }
    });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

// Real-Time Allocation API with Transaction Locking
app.post('/api/allocate', async (req, res) => {
  try {
    const { applicationId, bedId, adminName } = req.body;

    // Use transaction to prevent double booking with atomic check-and-set
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atomic Check and Set for Bed to prevent double booking race condition
      const updatedBedCount = await tx.bed.updateMany({
        where: { id: bedId, status: 'AVAILABLE' },
        data: { status: 'OCCUPIED' }
      });

      if (updatedBedCount.count === 0) {
        throw new Error('This bed was already allocated by another administrator or is not available.');
      }

      // 2. Atomic Check and Set for Application
      const updatedAppCount = await tx.application.updateMany({
        where: { id: applicationId, status: { in: ['PENDING', 'APPROVED'] } },
        data: { status: 'ALLOCATED' }
      });

      if (updatedAppCount.count === 0) {
        throw new Error('This student is already allocated or does not exist.');
      }

      // 4. Create Allocation
      const allocation = await tx.allocation.create({
        data: {
          applicationId,
          bedId,
          status: 'ACTIVE'
        }
      });

      // 5. Fetch updated Application for emails
      const application = await tx.application.findUnique({ where: { id: applicationId } });
      if (!application) throw new Error('Application not found');

      return allocation;
    });

    // Emit granular events
    io.emit('BED_ALLOCATED', { bedId, applicationId });
    io.emit('APPLICATION_UPDATED', { applicationId, status: 'ALLOCATED' });
    
    // Also emit old data_updated just in case some components still rely on it while we transition
    io.emit('data_updated');

    const emailMode = await getEmailMode();
    if (emailMode === 'Automatic') {
      sendWorkflowEmail(applicationId, 'ALLOCATION', 'Automatic').catch(err => console.error("Auto allocate email error:", err));
    }

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to allocate' });
  }
});

// Real-Time Reallocation API with Transaction Locking
app.post('/api/reallocate', async (req, res) => {
  try {
    const { allocationId, newBedId, adminName, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Fetch old allocation
      const oldAllocation = await tx.allocation.findUnique({
        where: { id: allocationId },
        include: { application: true, bed: { include: { room: { include: { block: true } } } } }
      });
      if (!oldAllocation) throw new Error('Allocation not found');

      // Fetch new bed
      const newBed = await tx.bed.findUnique({
        where: { id: newBedId },
        include: { room: { include: { block: true } } }
      });
      if (!newBed || newBed.status !== 'AVAILABLE') throw new Error('New bed is not available');

      // 1. Free the old bed
      await tx.bed.update({
        where: { id: oldAllocation.bedId },
        data: { status: 'AVAILABLE' }
      });

      // 2. Occupy the new bed
      await tx.bed.update({
        where: { id: newBedId },
        data: { status: 'OCCUPIED' }
      });

      // 3. Update Allocation record
      const updatedAllocation = await tx.allocation.update({
        where: { id: allocationId },
        data: { bedId: newBedId }
      });

      // 4. Create History Record
      await tx.allocationHistory.create({
        data: {
          studentName: oldAllocation.application.studentName,
          previousBlock: oldAllocation.bed.room.block.name,
          previousRoom: oldAllocation.bed.room.roomNo,
          previousBed: oldAllocation.bed.bedNo.toString(),
          newBlock: newBed.room.block.name,
          newRoom: newBed.room.roomNo,
          newBed: newBed.bedNo.toString(),
          adminName: adminName,
          reason: reason || 'Reallocated by admin'
        }
      });

      // 5. Send real email
      await sendRealEmail(
        oldAllocation.application.email,
        'Hostel Reallocation Notice',
        `<p>Dear ${oldAllocation.application.studentName},</p><p>Your hostel bed has been reallocated. Reason: ${reason || 'Admin Reallocation'}</p>`
      );

      return updatedAllocation;
    });

    io.emit('data_updated');
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reallocate' });
  }
});

// Create Block
app.post('/api/blocks', async (req, res) => {
  const { name, gender, floorConfigs, imageUrl } = req.body;
  // floorConfigs should be an array of { floor: number, rooms: number, capacity: number }
  try {
    const block = await prisma.$transaction(async (tx) => {
      const newBlock = await tx.block.create({ data: { name, gender, imageUrl } });

      for (const config of floorConfigs) {
        const floor = config.floor;
        const capacity = config.capacity;
        const roomNumbers = config.roomNumbers || []; // Array of string room numbers

        for (const roomNo of roomNumbers) {
          const type = `${capacity} Sharing`;

          const newRoom = await tx.room.create({
            data: { blockId: newBlock.id, roomNo: String(roomNo), floor, capacity, type }
          });

          const bedsData = Array.from({ length: capacity }).map((_, i) => ({
            roomId: newRoom.id,
            bedNo: i + 1,
            status: 'AVAILABLE'
          }));

          await tx.bed.createMany({ data: bedsData });
        }
      }
      return newBlock;
    });
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create block' });
  }
});

// Upload image endpoint
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Update block photo
app.put('/api/blocks/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const block = await prisma.block.update({
      where: { id },
      data: { imageUrl }
    });

    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update block photo' });
  }
});

// Edit Room Capacity
app.put('/api/rooms/:id/capacity', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { newCapacity } = req.body;

    await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { beds: { orderBy: { bedNo: 'desc' } } }
      });

      if (!room) throw new Error('Room not found');

      const currentCapacity = room.capacity;

      if (newCapacity > currentCapacity) {
        // Add new beds
        const bedsToAdd = newCapacity - currentCapacity;
        const bedsData = Array.from({ length: bedsToAdd }).map((_, i) => ({
          roomId,
          bedNo: currentCapacity + i + 1,
          status: 'AVAILABLE'
        }));
        await tx.bed.createMany({ data: bedsData });
      } else if (newCapacity < currentCapacity) {
        // Remove beds
        const bedsToRemoveCount = currentCapacity - newCapacity;
        const availableBeds = room.beds.filter(b => b.status === 'AVAILABLE' || b.status === 'MAINTENANCE');

        if (availableBeds.length < bedsToRemoveCount) {
          throw new Error(`Cannot reduce capacity to ${newCapacity}. Room has ${room.beds.length - availableBeds.length} occupied beds.`);
        }

        // Delete the highest numbered available beds first
        const bedsToDelete = availableBeds.slice(0, bedsToRemoveCount).map(b => b.id);
        await tx.bed.deleteMany({ where: { id: { in: bedsToDelete } } });
      }

      // Update room capacity
      await tx.room.update({
        where: { id: roomId },
        data: {
          capacity: newCapacity,
          type: `${newCapacity} Sharing`
        }
      });
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update Room Capacity Error:', error);
    res.status(400).json({ error: error.message || 'Failed to update room capacity' });
  }
});

// Delete Block
app.delete('/api/blocks/:id', async (req, res) => {
  try {
    const blockId = req.params.id;

    // 1. Safety Check: Verify if any bed is OCCUPIED
    const occupiedBed = await prisma.bed.findFirst({
      where: {
        room: { blockId },
        status: 'OCCUPIED'
      }
    });

    if (occupiedBed) {
      return res.status(400).json({ error: 'Cannot delete block. It contains occupied beds.' });
    }

    // 2. Safely Cascade Delete (Bottom-Up)
    await prisma.$transaction(async (tx) => {
      const rooms = await tx.room.findMany({ where: { blockId } });
      const roomIds = rooms.map(r => r.id);

      if (roomIds.length > 0) {
        await tx.bed.deleteMany({ where: { roomId: { in: roomIds } } });
      }
      await tx.room.deleteMany({ where: { blockId } });
      await tx.block.delete({ where: { id: blockId } });
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete block' });
  }
});

// Add Floor to Block
app.post('/api/blocks/:id/floors', async (req, res) => {
  try {
    const blockId = req.params.id;
    const { floor, numberOfRooms, capacityPerRoom, type } = req.body;

    // Check if block exists
    const block = await prisma.block.findUnique({ where: { id: blockId } });
    if (!block) return res.status(404).json({ error: 'Block not found' });

    await prisma.$transaction(async (tx) => {
      for (let i = 1; i <= numberOfRooms; i++) {
        const roomNo = `${floor}${i.toString().padStart(2, '0')}`;
        const room = await tx.room.create({
          data: {
            blockId,
            roomNo,
            floor,
            capacity: capacityPerRoom,
            type: type || `${capacityPerRoom} Sharing`
          }
        });
        
        for (let j = 1; j <= capacityPerRoom; j++) {
          await tx.bed.create({
            data: { roomId: room.id, bedNo: j, status: 'AVAILABLE' }
          });
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add floor' });
  }
});

// Add Room(s) to Block
app.post('/api/blocks/:id/rooms', async (req, res) => {
  try {
    const blockId = req.params.id;
    const { floor, roomNos, capacity, type } = req.body;

    if (!roomNos || !Array.isArray(roomNos) || roomNos.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one room number' });
    }

    await prisma.$transaction(async (tx) => {
      for (const roomNo of roomNos) {
        const existingRoom = await tx.room.findFirst({
          where: { blockId, roomNo: roomNo.trim() }
        });
        if (existingRoom) {
          throw new Error(`Room number ${roomNo} already exists in this block`);
        }

        const room = await tx.room.create({
          data: {
            blockId,
            roomNo: roomNo.trim(),
            floor,
            capacity,
            type: type || `${capacity} Sharing`
          }
        });
        
        for (let j = 1; j <= capacity; j++) {
          await tx.bed.create({
            data: { roomId: room.id, bedNo: j, status: 'AVAILABLE' }
          });
        }
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to add rooms' });
  }
});

// Delete Room
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;

    // Safety check
    const occupiedBed = await prisma.bed.findFirst({
      where: { roomId, status: 'OCCUPIED' }
    });

    if (occupiedBed) {
      return res.status(400).json({ error: 'Cannot delete room containing occupied beds' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bed.deleteMany({ where: { roomId } });
      await tx.room.delete({ where: { id: roomId } });
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Get Detailed Occupancy
app.get('/api/occupancy', async (req, res) => {
  try {
    const blocks = await prisma.block.findMany({
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                allocation: {
                  include: { application: true }
                }
              }
            }
          }
        }
      }
    });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch occupancy' });
  }
});

// Smart Batch Allocation
app.post('/api/allocate/batch', async (req, res) => {
  try {
    const { applicationIds, blockId, floor, roomType } = req.body;

    // 1. Fetch the approved or pending applications
    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds }, status: { in: ['APPROVED', 'PENDING'] } },
      orderBy: { appliedAt: 'asc' } // Ensure FCFS in allocation
    });

    if (applications.length === 0) {
      return res.status(400).json({ error: 'No valid applications selected' });
    }

    // 2. Find available beds in the specified criteria
    const roomWhereClause: any = { blockId, floor: Number(floor) };
    if (roomType !== 'ANY' && roomType !== 'MATCH_PREFERENCE') {
      roomWhereClause.type = roomType;
    }

    const availableRooms = await prisma.room.findMany({
      where: roomWhereClause,
      orderBy: { roomNo: 'asc' },
      include: {
        beds: {
          where: { status: 'AVAILABLE' },
          orderBy: { bedNo: 'asc' }
        }
      }
    });

    // Flatten available beds across rooms
    let availableBeds: { id: string; roomId: string; roomNo: string; bedNo: number; type: string }[] = [];
    for (const room of availableRooms) {
      for (const bed of room.beds) {
        availableBeds.push({
          id: bed.id,
          roomId: room.id,
          roomNo: room.roomNo,
          bedNo: bed.bedNo,
          type: room.type
        });
      }
    }



    // 3. Allocate sequentially within a transaction
    const transaction: any[] = [];
    let allocatedCount = 0;
    const allocatedAppIds: string[] = [];

    for (const app of applications) {
      let bedIndex = -1;
      
      if (roomType === 'MATCH_PREFERENCE') {
        bedIndex = availableBeds.findIndex(b => b.type === app.hostelPref);
      } else {
        if (availableBeds.length > 0) {
          bedIndex = 0; // Just take the first available
        }
      }

      if (bedIndex !== -1) {
        const bed = availableBeds[bedIndex];
        availableBeds.splice(bedIndex, 1); // Remove it from available pool
        allocatedCount++;
        allocatedAppIds.push(app.id);
        
        transaction.push(
          prisma.allocation.create({
            data: {
              applicationId: app.id,
              bedId: bed.id,
              status: 'ACTIVE'
            }
          }),
          prisma.bed.update({
            where: { id: bed.id },
            data: { status: 'OCCUPIED' }
          })
        );
      }
    }

    if (allocatedAppIds.length > 0) {
      transaction.push(
        prisma.application.updateMany({
          where: { id: { in: allocatedAppIds } },
          data: { status: 'ALLOCATED' }
        })
      );
    }

    // Add Audit Log
    transaction.push(
      prisma.auditLog.create({
        data: {
          adminName: 'Admin',
          action: 'BATCH_ALLOCATION',
          details: `Allocated ${allocatedCount} students to Block ${blockId}`
        }
      })
    );

    await prisma.$transaction(transaction);

    const emailMode = await getEmailMode();
    if (emailMode === 'Automatic') {
      for (const appId of allocatedAppIds) {
        sendWorkflowEmail(appId, 'ALLOCATION', 'Automatic').catch(err => console.error("Auto batch allocate email error:", err));
      }
    }

    res.json({ success: true, allocated: allocatedCount, totalRequested: applications.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to allocate' });
  }
});

// Auto-Allocate FCFS
app.post('/api/allocate/auto', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { status: 'PENDING' },
      orderBy: { appliedAt: 'asc' } // FCFS order
    });

    if (applications.length === 0) {
      return res.status(400).json({ error: 'No pending applications to allocate' });
    }

    const availableRooms = await prisma.room.findMany({
      include: {
        block: true,
        beds: {
          where: { status: 'AVAILABLE' },
          orderBy: { bedNo: 'asc' }
        }
      }
    });

    // Group beds by gender
    const bedsByGender: Record<string, any[]> = { MALE: [], FEMALE: [] };
    for (const room of availableRooms) {
      for (const bed of room.beds) {
        if (bedsByGender[room.block.gender]) {
          bedsByGender[room.block.gender].push({
            id: bed.id,
            roomId: room.id,
            blockId: room.blockId
          });
        }
      }
    }

    let allocatedCount = 0;
    const transaction = [];
    const appIdsToUpdate = [];

    for (const app of applications) {
      const genderBeds = bedsByGender[app.gender];
      if (genderBeds && genderBeds.length > 0) {
        const bed = genderBeds.shift(); // First come, first assigned to first available bed
        allocatedCount++;
        appIdsToUpdate.push(app.id);

        transaction.push(
          prisma.allocation.create({
            data: { applicationId: app.id, bedId: bed.id, status: 'ACTIVE' }
          }),
          prisma.bed.update({
            where: { id: bed.id },
            data: { status: 'OCCUPIED' }
          })
        );
      }
    }

    if (appIdsToUpdate.length > 0) {
      transaction.push(
        prisma.application.updateMany({
          where: { id: { in: appIdsToUpdate } },
          data: { status: 'ALLOCATED' }
        }),
        prisma.auditLog.create({
          data: {
            adminName: 'AutoEngine',
            action: 'AUTO_ALLOCATION',
            details: `Auto-allocated ${allocatedCount} students based on FCFS.`
          }
        })
      );
      await prisma.$transaction(transaction);

      const emailMode = await getEmailMode();
      if (emailMode === 'Automatic') {
        for (const appId of appIdsToUpdate) {
          sendWorkflowEmail(appId, 'ALLOCATION', 'Automatic').catch(err => console.error("Auto FCFS allocate email error:", err));
        }
      }
    }

    res.json({ success: true, allocatedCount, unallocatedCount: applications.length - allocatedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Auto-allocation failed' });
  }
});

// Undo Allocation
app.post('/api/allocate/undo', async (req, res) => {
  try {
    const { applicationIds } = req.body;

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({ error: 'No applications provided' });
    }

    // 1. Find the active allocations for these applications
    const allocations = await prisma.allocation.findMany({
      where: {
        applicationId: { in: applicationIds },
        status: 'ACTIVE'
      }
    });

    if (allocations.length === 0) {
      return res.status(400).json({ error: 'No active allocations found for selected students' });
    }

    const bedIds = allocations.map(a => a.bedId);
    const allocationIds = allocations.map(a => a.id);

    // 2. Perform the reversal in a transaction
    await prisma.$transaction([
      // Set beds back to AVAILABLE
      prisma.bed.updateMany({
        where: { id: { in: bedIds } },
        data: { status: 'AVAILABLE' }
      }),
      // Set applications back to PENDING
      prisma.application.updateMany({
        where: { id: { in: applicationIds } },
        data: { status: 'PENDING' }
      }),
      // Mark allocations as CANCELLED (or delete them, but cancelled keeps history)
      prisma.allocation.updateMany({
        where: { id: { in: allocationIds } },
        data: { status: 'CANCELLED' }
      }),
      // Audit log
      prisma.auditLog.create({
        data: {
          adminName: 'Admin',
          action: 'UNDO_ALLOCATION',
          details: `Reverted allocation for ${allocations.length} students.`
        }
      })
    ]);

    res.json({ success: true, count: allocations.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to undo allocations' });
  }
});



// Batch Update Status (e.g., Transfer)
app.put('/api/applications/batch-status', async (req, res) => {
  try {
    const { status, fromStatuses } = req.body;

    // Find applications that match the criteria
    const applicationsToUpdate = await prisma.application.findMany({
      where: { status: { in: fromStatuses } }
    });

    if (applicationsToUpdate.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    // Update their status
    await prisma.application.updateMany({
      where: { status: { in: fromStatuses } },
      data: { status }
    });

    res.json({ success: true, count: applicationsToUpdate.length });
  } catch (error) {
    console.error('Failed to batch update status:', error);
    res.status(500).json({ error: 'Failed to batch update status' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [pending, approved, hold, rejected, allocated, paymentPending, paymentCompleted] = await Promise.all([
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'HOLD' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { status: 'ALLOCATED' } }),
      prisma.payment.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } })
    ]);

    const allBeds = await prisma.bed.count();
    const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
    const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });

    const occupancyPercentage = allBeds === 0 ? 0 : Math.round((occupiedBeds / allBeds) * 100);

    // Simple male/female occupancy (assuming boys block = male, girls block = female)
    const blocks = await prisma.block.findMany({ include: { rooms: { include: { beds: true } } } });
    let maleOccupancy = 0;
    let femaleOccupancy = 0;

    blocks.forEach(block => {
      let blockOccupancy = 0;
      block.rooms.forEach(room => {
        blockOccupancy += room.beds.filter(b => b.status === 'OCCUPIED').length;
      });
      if (block.gender === 'MALE') maleOccupancy += blockOccupancy;
      if (block.gender === 'FEMALE') femaleOccupancy += blockOccupancy;
    });

   const totalBlocks = await prisma.block.count();

res.json({
  applications: { pending, approved, hold, rejected, allocated },
  payments: { pending: paymentPending, completed: paymentCompleted },
  beds: { all: allBeds, occupied: occupiedBeds, available: availableBeds },
  occupancyPercentage,
  maleOccupancy,
  femaleOccupancy,
  totalBlocks
});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

// Seed demo payment data
app.post('/api/payments/seed', async (req, res) => {
  try {
    const existing = await prisma.payment.count();
    if (existing > 0) {
      return res.json({ message: 'Demo data already exists', count: existing });
    }

    const demoPayments = [
      { studentName: 'Aditya Sharma', studentUsn: '1BM21CS001', hostelName: 'Om Sai Boys Hostel', block: 'A', floor: '1', roomNumber: '102', utrNumber: 'UTR20260715001', paymentDate: new Date('2026-07-15'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Rohan Patil', studentUsn: '1BM21EC088', hostelName: 'Om Sai Boys Hostel', block: 'A', floor: '3', roomNumber: '312', utrNumber: 'UTR20260714002', paymentDate: new Date('2026-07-14'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Vikram Singh', studentUsn: '1BM22ME054', hostelName: 'Om Sai Boys Hostel', block: 'A', floor: '2', roomNumber: '205', utrNumber: 'UTR20260713003', paymentDate: new Date('2026-07-13'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-14') },
      { studentName: 'Kabir Verma', studentUsn: '1BM23EE030', hostelName: 'Om Sai Boys Hostel', block: 'B', floor: '1', roomNumber: '104', utrNumber: 'UTR20260712004', paymentDate: new Date('2026-07-12'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-13') },
      { studentName: 'Arjun Mehta', studentUsn: '1BM22CS045', hostelName: 'Om Sai Boys Hostel', block: 'C', floor: '2', roomNumber: '210', utrNumber: 'UTR20260711005', paymentDate: new Date('2026-07-11'), status: 'REJECTED', emailStatus: 'PENDING', remarks: 'Invalid UTR number' },
      { studentName: 'Meera Nair', studentUsn: '1BM21IS042', hostelName: 'Om Sai Girls Hostel', block: 'A', floor: '2', roomNumber: '204', utrNumber: 'UTR20260716006', paymentDate: new Date('2026-07-16'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Sanya Gupta', studentUsn: '1BM22CS120', hostelName: 'Om Sai Girls Hostel', block: 'A', floor: '2', roomNumber: '201', utrNumber: 'UTR20260715007', paymentDate: new Date('2026-07-15'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-16') },
      { studentName: 'Neha Deshmukh', studentUsn: '1BM21CS099', hostelName: 'Om Sai Girls Hostel', block: 'B', floor: '3', roomNumber: '303', utrNumber: 'UTR20260714008', paymentDate: new Date('2026-07-14'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-15') },
      { studentName: 'Ananya Rao', studentUsn: '1BM23CS010', hostelName: 'Om Sai Girls Hostel', block: 'B', floor: '1', roomNumber: '108', utrNumber: 'UTR20260718009', paymentDate: new Date('2026-07-18'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Priya Joshi', studentUsn: '1BM22EC076', hostelName: 'Om Sai Girls Hostel', block: 'C', floor: '2', roomNumber: '215', utrNumber: 'UTR20260717010', paymentDate: new Date('2026-07-17'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Ravi Kumar', studentUsn: '1BM21ME032', hostelName: 'Om Sai Boys Hostel', block: 'A', floor: '1', roomNumber: '106', utrNumber: 'UTR20260710011', paymentDate: new Date('2026-07-10'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-11') },
      { studentName: 'Deepak Shetty', studentUsn: '1BM23IS055', hostelName: 'Om Sai Boys Hostel', block: 'C', floor: '3', roomNumber: '309', utrNumber: 'UTR20260719012', paymentDate: new Date('2026-07-19'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Kavitha Raj', studentUsn: '1BM22IS090', hostelName: 'Om Sai Girls Hostel', block: 'A', floor: '1', roomNumber: '110', utrNumber: 'UTR20260716013', paymentDate: new Date('2026-07-16'), status: 'REJECTED', emailStatus: 'PENDING', remarks: 'Duplicate payment submission' },
      { studentName: 'Suresh Patel', studentUsn: '1BM21EC044', hostelName: 'Om Sai Boys Hostel', block: 'B', floor: '2', roomNumber: '208', utrNumber: 'UTR20260718014', paymentDate: new Date('2026-07-18'), status: 'PENDING_REVIEW', emailStatus: 'PENDING' },
      { studentName: 'Lakshmi Iyer', studentUsn: '1BM23ME015', hostelName: 'Om Sai Girls Hostel', block: 'C', floor: '1', roomNumber: '105', utrNumber: 'UTR20260717015', paymentDate: new Date('2026-07-17'), status: 'APPROVED', emailStatus: 'SENT', reviewedBy: 'Sindu Sharma', reviewedAt: new Date('2026-07-18') },
    ];

    for (const payment of demoPayments) {
      await prisma.payment.create({ data: payment });
    }

    io.emit('data_updated');
    res.json({ success: true, count: demoPayments.length });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message || 'Failed to seed payment data' });
  }
});

// Get payment summary statistics
app.get('/api/payments/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingReview, approvedTotal, approvedToday, rejected, totalThisMonth] = await Promise.all([
      prisma.payment.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } }),
      prisma.payment.count({ where: { status: 'APPROVED', reviewedAt: { gte: startOfToday } } }),
      prisma.payment.count({ where: { status: 'REJECTED' } }),
      prisma.payment.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const allPayments = await prisma.payment.findMany({
      select: { block: true, status: true }
    });

    const blockStats: Record<string, { total: number; paid: number }> = {};
    allPayments.forEach((p: { block: string; status: string }) => {
      if (!blockStats[p.block]) blockStats[p.block] = { total: 0, paid: 0 };
      blockStats[p.block].total++;
      if (p.status === 'APPROVED') blockStats[p.block].paid++;
    });

    res.json({ pendingReview, approvedTotal, approvedToday, rejected, totalThisMonth, blockStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment stats' });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Approve single payment
app.put('/api/payments/:id/approve', async (req, res) => {
  try {
    const emailMode = await getEmailMode();
    const isAuto = emailMode === 'Automatic';

    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: req.params.id },
        data: {
          status: 'APPROVED',
          reviewedBy: req.body.reviewedBy || 'Admin',
          reviewedAt: new Date(),
          emailStatus: isAuto ? 'SENT' : 'PENDING'
        }
      });

      await tx.auditLog.create({
        data: {
          adminName: req.body.reviewedBy || 'Admin',
          action: 'PAYMENT_APPROVED',
          details: `Approved payment from ${updated.studentName} (UTR: ${updated.utrNumber})`
        }
      });

      return updated;
    });

    if (isAuto) {
      const app = await prisma.application.findUnique({ where: { usn: payment.studentUsn } });
      if (app) {
        sendWorkflowEmail(app.id, 'PAYMENT_CONFIRMATION', 'Automatic').catch(err => console.error("Auto pay confirmation email error:", err));
      }
    }

    io.emit('data_updated');
    io.emit('PAYMENT_STATUS_CHANGED', { studentUsn: payment.studentUsn, status: 'APPROVED', paymentId: payment.id });
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to approve payment' });
  }
});

// Reject single payment
app.put('/api/payments/:id/reject', async (req, res) => {
  try {
    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: req.params.id },
        data: {
          status: 'REJECTED',
          reviewedBy: req.body.reviewedBy || 'Admin',
          reviewedAt: new Date(),
          remarks: req.body.remarks || null
        }
      });

      await tx.auditLog.create({
        data: {
          adminName: req.body.reviewedBy || 'Admin',
          action: 'PAYMENT_REJECTED',
          details: `Rejected payment from ${updated.studentName} (UTR: ${updated.utrNumber})`
        }
      });

      return updated;
    });

    io.emit('data_updated');
    io.emit('PAYMENT_STATUS_CHANGED', { studentUsn: payment.studentUsn, status: 'REJECTED', paymentId: payment.id });
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reject payment' });
  }
});

// Bulk approve payments
app.post('/api/payments/bulk-approve', async (req, res) => {
  try {
    const { ids, reviewedBy } = req.body;
    const emailMode = await getEmailMode();
    const isAuto = emailMode === 'Automatic';

    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewedBy || 'Admin',
          reviewedAt: new Date(),
          emailStatus: isAuto ? 'SENT' : 'PENDING'
        }
      });

      await tx.auditLog.create({
        data: {
          adminName: reviewedBy || 'Admin',
          action: 'BULK_PAYMENT_APPROVED',
          details: `Bulk approved ${ids.length} payments`
        }
      });
    });

    // Send real emails
    const payments = await prisma.payment.findMany({ where: { id: { in: ids } } });
    if (isAuto) {
      for (const p of payments) {
        const app = await prisma.application.findUnique({ where: { usn: p.studentUsn } });
        if (app) {
          sendWorkflowEmail(app.id, 'PAYMENT_CONFIRMATION', 'Automatic').catch(err => console.error("Auto bulk pay confirmation email error:", err));
        }
      }
    }

    io.emit('data_updated');
    for (const p of payments) {
      io.emit('PAYMENT_STATUS_CHANGED', { studentUsn: p.studentUsn, status: 'APPROVED', paymentId: p.id });
    }
    res.json({ success: true, count: ids.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to bulk approve' });
  }
});

// Bulk reject payments
app.post('/api/payments/bulk-reject', async (req, res) => {
  try {
    const { ids, reviewedBy } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'REJECTED',
          reviewedBy: reviewedBy || 'Admin',
          reviewedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          adminName: reviewedBy || 'Admin',
          action: 'BULK_PAYMENT_REJECTED',
          details: `Bulk rejected ${ids.length} payments`
        }
      });
    });

    io.emit('data_updated');
    const rejectedPayments = await prisma.payment.findMany({ where: { id: { in: ids } } });
    for (const p of rejectedPayments) {
      io.emit('PAYMENT_STATUS_CHANGED', { studentUsn: p.studentUsn, status: 'REJECTED', paymentId: p.id });
    }
    res.json({ success: true, count: ids.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to bulk reject' });
  }
});

// Send payment reminder
app.post('/api/payments/:id/reminder', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const app = await prisma.application.findUnique({ where: { usn: payment.studentUsn } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found for student USN' });
    }

    // Send using template system and write history
    await sendWorkflowEmail(app.id, 'PAYMENT_REMINDER', 'Manual');

    await prisma.payment.update({
      where: { id: req.params.id },
      data: { emailStatus: 'SENT' }
    });

    await prisma.auditLog.create({
      data: {
        adminName: 'Admin',
        action: 'PAYMENT_REMINDER_SENT',
        details: `Sent payment reminder to ${payment.studentName} (USN: ${payment.studentUsn})`
      }
    });

    io.emit('data_updated');
    res.json({ success: true, message: `Reminder sent to ${payment.studentName}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to send reminder' });
  }
});

// Export payments as CSV
app.get('/api/payments/export-csv', async (req, res) => {
  try {
    const { status, block, hostel } = req.query;
    const where: Record<string, string> = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (block) where.block = String(block);
    if (hostel) where.hostelName = String(hostel);

    const payments = await prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' } });

    const headers = 'Student Name,Student USN,Hostel,Block,Room Number,UTR Number,Payment Date,Payment Status\n';
    const rows = payments.map((p: any) =>
      `"${p.studentName}","${p.studentUsn}","${p.hostelName}","${p.block}","${p.roomNumber}","${p.utrNumber}","${new Date(p.paymentDate).toLocaleDateString('en-IN')}","${p.status}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(headers + rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

app.post("/api/emails/send", async (req, res) => {
  try {
    const { action, studentId, email, usn, subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let appRecord = null;
    if (studentId) {
      appRecord = await prisma.application.findUnique({ where: { id: studentId } });
    }
    if (!appRecord && usn) {
      appRecord = await prisma.application.findUnique({ where: { usn } });
    }
    if (!appRecord && email) {
      appRecord = await prisma.application.findFirst({ where: { email } });
    }

    const studentEmail = appRecord?.email || email;
    const fatherEmail = appRecord?.fatherEmail || null;
    const motherEmail = appRecord?.motherEmail || null;
    const guardianEmail = appRecord?.guardianEmail || null;

    const targets: { role: 'student' | 'father' | 'mother' | 'guardian'; email: string }[] = [];
    if (studentEmail) targets.push({ role: 'student', email: studentEmail });
    if (fatherEmail) targets.push({ role: 'father', email: fatherEmail });
    if (motherEmail) targets.push({ role: 'mother', email: motherEmail });

    if (!fatherEmail && !motherEmail && guardianEmail) {
      targets.push({ role: 'guardian', email: guardianEmail });
    }

    const results: Record<string, { email: string; sent: boolean }> = {};
    let anySentSuccess = false;

    for (const t of targets) {
      const sent = await sendRealEmail(t.email, subject, body.replace(/\n/g, "<br>"));
      results[t.role] = { email: t.email, sent };
      if (sent) anySentSuccess = true;
    }

    const finalStatus = anySentSuccess ? 'Sent' : 'Failed';

    if (appRecord) {
      await prisma.emailHistory.create({
        data: {
          studentId: appRecord.id,
          studentName: appRecord.studentName,
          usn: appRecord.usn,
          email: appRecord.email,
          workflow: getWorkflowHistoryName(action),
          subject,
          body,
          status: finalStatus,
          mode: 'Manual'
        }
      });

      await prisma.application.update({
        where: { id: appRecord.id },
        data: {
          studentEmailSent: results.student ? results.student.sent : appRecord.studentEmailSent,
          fatherEmailSent: results.father ? results.father.sent : appRecord.fatherEmailSent,
          motherEmailSent: results.mother ? results.mother.sent : (results.guardian ? results.guardian.sent : appRecord.motherEmailSent),
          studentEmailSentAt: results.student?.sent ? new Date() : appRecord.studentEmailSentAt,
          fatherEmailSentAt: results.father?.sent ? new Date() : appRecord.fatherEmailSentAt,
          motherEmailSentAt: (results.mother?.sent || results.guardian?.sent) ? new Date() : appRecord.motherEmailSentAt,
        }
      });
    }

    return res.json({
      success: true,
      message: "Emails processed",
      results
    });
  } catch (err: any) {
    console.error("Email API error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
});

// ==================== STUDENT PORTAL ENDPOINTS ====================

// Student Login API using Exact Name & Phone Number
app.post('/api/student/login', async (req, res) => {
  try {
    const { studentName, phoneNumber } = req.body;

    if (!studentName || !phoneNumber) {
      return res.status(400).json({ error: 'Name and Phone Number are required for student login.' });
    }

    const cleanName = String(studentName).trim();
    const cleanPhone = String(phoneNumber).trim();

    // 1. Try finding application matching phone number first
    const apps = await prisma.application.findMany({
      where: { phoneNumber: cleanPhone },
      include: {
        allocations: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    // Match exact or case-insensitive student name
    let application = apps.find(
      a => a.studentName.trim().toLowerCase() === cleanName.toLowerCase()
    );

    // If not found by phone, search by student name
    if (!application) {
      const nameApps = await prisma.application.findMany({
        where: {
          studentName: {
            contains: cleanName
          }
        }
      });

      application = nameApps.find(
        a => a.phoneNumber.trim() === cleanPhone || a.studentName.trim().toLowerCase() === cleanName.toLowerCase()
      );
    }

    if (!application) {
      return res.status(404).json({
        error: 'No student application found matching this Name and Phone Number. Please check your credentials or apply to join.'
      });
    }

    return res.json({
      success: true,
      usn: application.usn,
      studentName: application.studentName,
      phoneNumber: application.phoneNumber,
      application
    });

  } catch (error: any) {
    console.error('Student login error:', error);
    res.status(500).json({ error: error.message || 'Server error during student login' });
  }
});

// Get comprehensive student status by USN (used by student portal)
app.get('/api/student/status/:usn', async (req, res) => {
  try {
    const { usn } = req.params;
    // Find application by USN
    const application = await prisma.application.findUnique({
      where: { usn },
      include: {
        documents: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            bed: {
              include: {
                room: {
                  include: { block: true }
                }
              }
            }
          }
        }
      }
    });

    if (!application) {
      return res.json({ found: false, applicationState: 'not_applied' });
    }

    // Determine application state from real DB status
    let applicationState: string = 'applied'; // PENDING, APPROVED, HOLD
    if (application.status === 'REJECTED') {
      applicationState = 'rejected';
    } else if (application.status === 'HOLD') {
      applicationState = 'on_hold';
    } else if (application.status === 'ALLOCATED' && application.allocations.length > 0) {
      applicationState = 'room_allotted';
    }

    // Check payments for this student
    const payments = await prisma.payment.findMany({
      where: { studentUsn: usn },
      orderBy: { createdAt: 'desc' }
    });

    // If any payment is approved and room is allotted, student is 'paid'
    const hasApprovedPayment = payments.some(p => p.status === 'APPROVED');
    if (hasApprovedPayment && applicationState === 'room_allotted') {
      applicationState = 'paid';
    }

    // Build hostel info from allocation data
    let hostelInfo = null;
    if (application.allocations.length > 0) {
      const alloc = application.allocations[0];
      const allocDate = new Date(alloc.allocatedAt);
      hostelInfo = {
        hostel: 'OM SAI PG',
        block: alloc.bed.room.block.name,
        floor: alloc.bed.room.floor,
        room: alloc.bed.room.roomNo,
        bed: alloc.bed.bedNo.toString(),
        sharing: alloc.bed.room.type,
        admissionDate: allocDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      };
    }

    const photoDoc = application.documents.find((d: any) => d.name === "Passport Photo");
    const passportPhoto = photoDoc ? photoDoc.url : null;

    res.json({
      found: true,
      applicationState,
      application: {
        id: application.id,
        studentName: application.studentName,
        usn: application.usn,
        email: application.email,
        phone: application.phoneNumber,
        department: application.department,
        gender: application.gender,
        status: application.status,
        appliedAt: application.appliedAt,
        yearSem: application.yearSem,
        address: application.address,
        fatherName: application.fatherName,
        holdReason: application.holdReason,
        passportPhoto,
        photoUrl: passportPhoto
      },
      hostelInfo,
      payments
    });  } catch (error) {
    console.error('Student status error:', error);
    res.status(500).json({ error: 'Failed to fetch student status' });
  }
});

// Student submits payment info (after filling Google Form + bank transfer)
app.post('/api/student/payment', async (req, res) => {
  try {
    const { studentName, studentUsn, utrNumber, paymentDate, hostelName, block, floor, roomNumber, screenshotUrl } = req.body;

    if (!studentUsn || !utrNumber) {
      return res.status(400).json({ error: 'USN and UTR Number are required' });
    }

    if (!screenshotUrl) {
      return res.status(400).json({ error: 'Payment Screenshot is mandatory' });
    }

    // Look up real application + allocation data from DB to get accurate info
    const application = await prisma.application.findUnique({
      where: { usn: studentUsn },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            bed: {
              include: {
                room: {
                  include: { block: true }
                }
              }
            }
          }
        }
      }
    });

    // Use real data from DB if available, fallback to what frontend sent
    const realName = application?.studentName || studentName || 'Student';
    let realHostel = hostelName || 'OM SAI PG';
    let realBlock = block ? String(block) : '-';
    let realFloor = floor ? String(floor) : '-';
    let realRoom = roomNumber ? String(roomNumber) : '-';

    if (application?.allocations && application.allocations.length > 0) {
      const alloc = application.allocations[0];
      realHostel = 'OM SAI PG';
      realBlock = alloc.bed.room.block.name;
      realFloor = String(alloc.bed.room.floor);
      realRoom = alloc.bed.room.roomNo;
    }

    // Upsert payment to handle re-submission or duplicate UTR gracefully
    const existing = await prisma.payment.findUnique({ where: { utrNumber } });

    let payment;
    if (existing) {
      payment = await prisma.payment.update({
        where: { utrNumber },
        data: {
          studentName: realName,
          studentUsn,
          hostelName: realHostel,
          block: realBlock,
          floor: realFloor,
          roomNumber: realRoom,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          screenshotUrl: screenshotUrl || existing.screenshotUrl || null,
          status: 'PENDING_REVIEW'
        }
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          studentName: realName,
          studentUsn,
          hostelName: realHostel,
          block: realBlock,
          floor: realFloor,
          roomNumber: realRoom,
          utrNumber,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          screenshotUrl: screenshotUrl || null,
          status: 'PENDING_REVIEW',
          emailStatus: 'PENDING'
        }
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        adminName: realName,
        action: 'PAYMENT_SUBMITTED',
        details: `Google Form payment submission UTR: ${utrNumber} by ${realName} (${studentUsn}) | Hostel: ${realHostel} Block: ${realBlock} Room: ${realRoom}`
      }
    });

    // Emit socket events for real-time sync across both portals
    io.emit('data_updated');
    io.emit('PAYMENT_SUBMITTED', { studentUsn, utrNumber, status: 'PENDING_REVIEW' });

    res.status(201).json(payment);
  } catch (error: any) {
    console.error('Student payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit payment' });
  }
});

// ==================== SYSTEM SETTINGS (GOOGLE FORM URL) ====================

const DEFAULT_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeGj_HFh1FvceJCVuQhY7L4dY74CjjjjHccehN69MDOg6-Egw/viewform?usp=dialog';

app.get('/api/settings/google-form', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'GOOGLE_FORM_URL' }
    });
    res.json({ url: setting?.value || DEFAULT_GOOGLE_FORM_URL });
  } catch (error) {
    res.json({ url: DEFAULT_GOOGLE_FORM_URL });
  }
});

app.post('/api/settings/google-form', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key: 'GOOGLE_FORM_URL' },
      update: { value: url.trim() },
      create: { key: 'GOOGLE_FORM_URL', value: url.trim() }
    });

    await prisma.auditLog.create({
      data: {
        adminName: 'Admin',
        action: 'GOOGLE_FORM_URL_UPDATED',
        details: `Updated Google Form link to: ${url.trim()}`
      }
    });

    io.emit('GOOGLE_FORM_UPDATED', { url: updated.value });
    io.emit('data_updated');

    res.json({ success: true, url: updated.value });
  } catch (error: any) {
    console.error('Update Google Form URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to update Google Form URL' });
  }
});

// ==================== GOOGLE SHEETS INTEGRATION & SYNC ====================

function getGoogleSheetCsvUrl(sheetUrl: string): string {
  try {
    const url = new URL(sheetUrl);
    const pathParts = url.pathname.split('/');
    const dIndex = pathParts.indexOf('d');
    if (dIndex !== -1 && pathParts[dIndex + 1]) {
      const docId = pathParts[dIndex + 1];
      let csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
      const gidMatch = url.hash.match(/gid=(\d+)/) || url.search.match(/gid=(\d+)/);
      if (gidMatch && gidMatch[1]) {
        csvUrl += `&gid=${gidMatch[1]}`;
      }
      return csvUrl;
    }
  } catch (e) {
    console.error('Error parsing sheet URL:', e);
  }
  return sheetUrl;
}

function getSpreadsheetId(sheetUrl: string): string | null {
  try {
    const url = new URL(sheetUrl);
    const pathParts = url.pathname.split('/');
    const dIndex = pathParts.indexOf('d');
    if (dIndex !== -1 && pathParts[dIndex + 1]) {
      return pathParts[dIndex + 1];
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

function parseCsv(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let entry = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(entry.trim());
      entry = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(entry.trim());
      result.push(row);
      row = [];
      entry = '';
    } else {
      entry += char;
    }
  }
  
  if (row.length > 0 || entry) {
    row.push(entry.trim());
    result.push(row);
  }
  
  return result.filter(r => r.length > 0 && r.some(cell => cell !== ''));
}

function getDirectScreenshotUrl(url: string): string {
  if (!url) return '';
  url = url.trim();
  if (url.includes('drive.google.com')) {
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (dMatch && dMatch[1]) || (idMatch && idMatch[1]);
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  return url;
}

async function getServiceAccountToken(clientEmail: string, privateKey: string): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedClaim}`;
  
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const signature = signer.sign(formattedKey, 'base64url');
  
  const jwt = `${signInput}.${signature}`;
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data.access_token;
}

async function fetchPrivateSheetData(spreadsheetId: string, apiKey: string): Promise<string[][] | null> {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`);
  if (!metaRes.ok) {
    throw new Error(`Failed to fetch spreadsheet metadata: ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();
  const firstSheetTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';
  
  const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A:Z?key=${apiKey}`);
  if (!valRes.ok) {
    throw new Error(`Failed to fetch spreadsheet values: ${valRes.statusText}`);
  }
  const data = await valRes.json();
  return data.values || null;
}

async function fetchSheetDataWithToken(spreadsheetId: string, accessToken: string): Promise<string[][] | null> {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!metaRes.ok) {
    throw new Error(`Failed to fetch spreadsheet metadata: ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();
  const firstSheetTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';
  
  const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A:Z`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!valRes.ok) {
    throw new Error(`Failed to fetch spreadsheet values: ${valRes.statusText}`);
  }
  const data = await valRes.json();
  return data.values || null;
}

async function fetchSheetRows(sheetUrl: string): Promise<string[][] | null> {
  const spreadsheetId = getSpreadsheetId(sheetUrl);
  if (!spreadsheetId) {
    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const text = await res.text();
    return parseCsv(text);
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (saEmail && saKey) {
    console.log('Production Auth Mode: Using Google Service Account...');
    try {
      const token = await getServiceAccountToken(saEmail, saKey);
      const rows = await fetchSheetDataWithToken(spreadsheetId, token);
      if (rows) return rows;
    } catch (err) {
      console.error('Service Account sync failed, falling back...', err);
    }
  }

  if (apiKey) {
    console.log('Production Auth Mode: Using Google API Key...');
    try {
      const rows = await fetchPrivateSheetData(spreadsheetId, apiKey);
      if (rows) return rows;
    } catch (err) {
      console.error('API Key sync failed, falling back...', err);
    }
  }

  console.log('Dev/Test Mode: Fetching public sheet CSV...');
  const csvUrl = getGoogleSheetCsvUrl(sheetUrl);
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch public CSV: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseCsv(csvText);
}

let isSyncing = false;
async function syncGoogleSheetPayments(): Promise<{ success: boolean; importedCount: number; skippedCount: number; error?: string }> {
  if (isSyncing) return { success: false, importedCount: 0, skippedCount: 0, error: 'Sync already in progress' };
  isSyncing = true;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'GOOGLE_SHEET_URL' }
    });
    if (!setting || !setting.value || !setting.value.trim()) {
      return { success: false, importedCount: 0, skippedCount: 0, error: 'Google Sheet URL not configured' };
    }

    const rows = await fetchSheetRows(setting.value.trim());
    if (!rows || rows.length < 2) {
      return { success: true, importedCount: 0, skippedCount: 0 };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    let timestampIdx = -1;
    let nameIdx = -1;
    let usnIdx = -1;
    let hostelIdx = -1;
    let blockIdx = -1;
    let floorIdx = -1;
    let roomIdx = -1;
    let utrIdx = -1;
    let paymentDateIdx = -1;
    let screenshotIdx = -1;

    for (let i = 0; i < headers.length; i++) {
      const h = headers[i];
      if (h.includes('timestamp') || h.includes('submitted at')) timestampIdx = i;
      else if (h.includes('usn') || h.includes('roll number') || h.includes('registration')) usnIdx = i;
      else if (h.includes('hostel') || h.includes('wing')) hostelIdx = i;
      else if (h.includes('name') || h.includes('student')) nameIdx = i;
      else if (h.includes('block')) blockIdx = i;
      else if (h.includes('floor')) floorIdx = i;
      else if (h.includes('room')) roomIdx = i;
      else if (h.includes('utr') || h.includes('transaction id') || h.includes('ref')) utrIdx = i;
      else if (h.includes('payment date') || h.includes('date of payment') || h.includes('transaction date')) paymentDateIdx = i;
      else if (h.includes('screenshot') || h.includes('proof') || h.includes('upload') || h.includes('file')) screenshotIdx = i;
    }

    // Default positional mapping if header parsing fails
    if (usnIdx === -1 && rows[0].length > 2) usnIdx = 2;
    if (utrIdx === -1 && rows[0].length > 7) utrIdx = 7;
    if (nameIdx === -1 && rows[0].length > 1) nameIdx = 1;

    if (utrIdx === -1) {
      return { success: false, importedCount: 0, skippedCount: 0, error: 'Could not identify UTR/Transaction ID column in sheet.' };
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const utr = row[utrIdx] ? row[utrIdx].trim() : '';
      if (!utr) {
        skippedCount++;
        continue;
      }

      // Check duplicate
      const existing = await prisma.payment.findUnique({
        where: { utrNumber: utr }
      });
      if (existing) {
        skippedCount++;
        continue;
      }

      const studentUsn = usnIdx !== -1 && row[usnIdx] ? row[usnIdx].trim() : '';
      const studentName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : 'Unknown';
      const hostelName = hostelIdx !== -1 && row[hostelIdx] ? row[hostelIdx].trim() : 'OM SAI PG';
      const block = blockIdx !== -1 && row[blockIdx] ? row[blockIdx].trim() : '-';
      const floor = floorIdx !== -1 && row[floorIdx] ? row[floorIdx].trim() : '-';
      const roomNumber = roomIdx !== -1 && row[roomIdx] ? row[roomIdx].trim() : '-';
      const screenshotUrl = screenshotIdx !== -1 && row[screenshotIdx] ? getDirectScreenshotUrl(row[screenshotIdx]) : null;

      let paymentDate = new Date();
      if (paymentDateIdx !== -1 && row[paymentDateIdx]) {
        const parsedDate = new Date(row[paymentDateIdx].trim());
        if (!isNaN(parsedDate.getTime())) paymentDate = parsedDate;
      } else if (timestampIdx !== -1 && row[timestampIdx]) {
        const parsedDate = new Date(row[timestampIdx].trim());
        if (!isNaN(parsedDate.getTime())) paymentDate = parsedDate;
      }

      await prisma.payment.create({
        data: {
          studentName,
          studentUsn,
          hostelName,
          block,
          floor,
          roomNumber,
          utrNumber: utr,
          paymentDate,
          screenshotUrl,
          status: 'PENDING_REVIEW',
          emailStatus: 'PENDING'
        }
      });

      await prisma.auditLog.create({
        data: {
          adminName: 'Google Sheets Sync',
          action: 'PAYMENT_IMPORTED',
          details: `Imported payment submission UTR: ${utr} for ${studentName} (${studentUsn}) from Google Sheet.`
        }
      });

      importedCount++;
    }

    if (importedCount > 0) {
      io.emit('data_updated');
    }

    return { success: true, importedCount, skippedCount };
  } catch (error: any) {
    console.error('Error syncing Google Sheet payments:', error);
    return { success: false, importedCount: 0, skippedCount: 0, error: error.message || 'Sync failed' };
  } finally {
    isSyncing = false;
  }
}

// Google Sheet URL Setting and Sync APIs
app.get('/api/settings/google-sheet', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'GOOGLE_SHEET_URL' }
    });
    res.json({ url: setting?.value || '' });
  } catch (error) {
    res.json({ url: '' });
  }
});

app.post('/api/settings/google-sheet', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key: 'GOOGLE_SHEET_URL' },
      update: { value: url.trim() },
      create: { key: 'GOOGLE_SHEET_URL', value: url.trim() }
    });

    await prisma.auditLog.create({
      data: {
        adminName: 'Admin',
        action: 'GOOGLE_SHEET_URL_UPDATED',
        details: `Updated Google Sheet link to: ${url.trim()}`
      }
    });

    io.emit('GOOGLE_SHEET_UPDATED', { url: updated.value });
    io.emit('data_updated');

    // Trigger sync immediately in background
    syncGoogleSheetPayments().catch(console.error);

    res.json({ success: true, url: updated.value });
  } catch (error: any) {
    console.error('Update Google Sheet URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to update Google Sheet URL' });
  }
});

app.post('/api/payments/sync', async (req, res) => {
  try {
    const result = await syncGoogleSheetPayments();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

// Setup optional periodic background synchronization if specified in .env
if (process.env.GOOGLE_SHEET_SYNC_INTERVAL_MS) {
  const ms = Number(process.env.GOOGLE_SHEET_SYNC_INTERVAL_MS);
  if (!isNaN(ms) && ms > 0) {
    console.log(`Setting up background Google Sheet sync interval: ${ms} ms`);
    setInterval(() => {
      syncGoogleSheetPayments().catch(console.error);
    }, ms);
  }
}


// ==================== STUDENT DASHBOARD CONTROLS ====================

// Facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});
app.post('/api/facilities', async (req, res) => {
  try {
    const facility = await prisma.facility.create({ data: req.body });
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create facility' });
  }
});
app.delete('/api/facilities/:id', async (req, res) => {
  try {
    await prisma.facility.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete facility' });
  }
});

app.put('/api/facilities/:id', async (req, res) => {
  try {
    const facility = await prisma.facility.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update facility' });
  }
});

// Feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({ data: req.body });
    io.emit('data_updated');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});
app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = await prisma.complaint.create({ data: req.body });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});
app.put('/api/complaints/:id/status', async (req, res) => {
  try {
    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { 
        status: req.body.status,
        resolvedAt: req.body.status === 'Resolved' ? new Date() : null
      }
    });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Social Connect
app.get('/api/social', async (req, res) => {
  try {
    const posts = await prisma.socialPost.findMany();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social posts' });
  }
});
app.post('/api/social', async (req, res) => {
  try {
    const post = await prisma.socialPost.create({ data: req.body });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create social post' });
  }
});
app.delete('/api/social/:id', async (req, res) => {
  try {
    await prisma.socialPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Leave Applications
app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await prisma.leaveApplication.findMany();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave applications' });
  }
});
app.post('/api/leaves', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.fromDate) data.fromDate = new Date(data.fromDate);
    if (data.toDate) data.toDate = new Date(data.toDate);
    const leave = await prisma.leaveApplication.create({ data });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit leave application' });
  }
});
app.put('/api/leaves/:id/status', async (req, res) => {
  try {
    const leave = await prisma.leaveApplication.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave application' });
  }
});

// --- Notice (Circular) APIs ---
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, notices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/notices', async (req, res) => {
  try {
    const { title, desc, date, category, priority, author, fileSize } = req.body;
    const notice = await prisma.notice.create({
      data: { title, desc, date, category, priority, author, fileSize: fileSize || 'Unknown' }
    });
    res.json({ success: true, notice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Settings (Mess Menu) APIs ---
app.get('/api/settings/mess-menu', async (req, res) => {
  try {
    let setting = await prisma.systemSetting.findUnique({
      where: { key: 'MESS_MENU' }
    });
    if (!setting) {
      // Default empty structure if not found
      setting = await prisma.systemSetting.create({
        data: {
          key: 'MESS_MENU',
          value: JSON.stringify({})
        }
      });
    }
    res.json({ success: true, menu: JSON.parse(setting.value) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/settings/mess-menu', async (req, res) => {
  try {
    const { menu } = req.body;
    await prisma.systemSetting.upsert({
      where: { key: 'MESS_MENU' },
      update: { value: JSON.stringify(menu) },
      create: { key: 'MESS_MENU', value: JSON.stringify(menu) }
    });
    res.json({ success: true, message: 'Mess menu updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EMAIL AUTOMATION SYSTEM ====================

const BACKEND_DEFAULT_TEMPLATES = {
  ALLOCATION: {
    subject: 'Hostel Bed Allocation Confirmed - {name}',
    body: 'Dear {name} (USN: {usn}),\n\nWe are pleased to inform you that you have been allocated a bed in Block {block}, Room {room} for this academic block. Please complete the admission formalities and pay the hostel fees within 3 working days.\n\nBest regards,\nHostel Administration Board'
  },
  REJECTION: {
    subject: 'Hostel Accommodation Application Status Update',
    body: 'Dear {name} (USN: {usn}),\n\nThank you for your application seeking accommodation in our hostels. We regret to inform you that due to high demand and limited bed availability, we are unable to allot a bed to you at this time. Your application remains on the waitlist.\n\nBest regards,\nHostel Admissions Board'
  },
  PAYMENT_CONFIRMATION: {
    subject: 'Hostel Fee Payment Receipt Confirmation',
    body: 'Dear {name} (USN: {usn}),\n\nThis is to confirm that your fee payment for the hostel accommodation has been successfully received and credited to your account. Your room allocation is now fully active.\n\nBest regards,\nHostel Accounts Department'
  },
  PAYMENT_REMINDER: {
    subject: 'IMPORTANT: Pending Hostel Fee Payment Reminder',
    body: 'Dear {name} (USN: {usn}),\n\nThis is a friendly reminder that your hostel fees for this semester are currently unpaid/overdue. Please clear the pending dues immediately to secure and maintain your room allocation.\n\nBest regards,\nHostel Accounts Department'
  },
  ANNUAL_FEE_REMINDER: {
    subject: 'Notice: Annual Hostel Fee Payment Schedule',
    body: 'Dear {name} (USN: {usn}),\n\nThis is to notify all hostellers that the annual hostel fee schedule for the upcoming academic year is now open. Kindly complete the payment before the deadline to ensure reservation of your block and room.\n\nBest regards,\nHostel Management Team'
  }
};

function getWorkflowHistoryName(key: string): string {
  switch (key) {
    case 'ALLOCATION': return 'Allocation';
    case 'REJECTION': return 'Rejection';
    case 'PAYMENT_CONFIRMATION': return 'Payment Confirmation';
    case 'PAYMENT_REMINDER': return 'Payment Reminder';
    case 'ANNUAL_FEE_REMINDER': return 'Annual Hostel Fee Reminder';
    default: return key;
  }
}

async function getEmailMode(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'EMAIL_MODE' }
    });
    return setting?.value || 'Manual';
  } catch (error) {
    return 'Manual';
  }
}

async function getEmailTemplate(key: string) {
  const dbTemplate = await prisma.emailTemplate.findUnique({
    where: { key }
  });
  if (dbTemplate) {
    return { subject: dbTemplate.subject, body: dbTemplate.body };
  }
  return BACKEND_DEFAULT_TEMPLATES[key as keyof typeof BACKEND_DEFAULT_TEMPLATES];
}

function replacePlaceholders(text: string, student: any, allocation?: any) {
  if (!text) return '';
  const blockName = allocation?.bed?.room?.block?.name || student.blockName || '';
  const roomNo = allocation?.bed?.room?.roomNo || student.roomNo || '';
  const floorNo = allocation?.bed?.room?.floor?.toString() || student.floor || '';
  const bedNo = allocation?.bed?.bedNo || student.bedNo || '';
  
  return text
    // Double curly brace placeholders
    .replace(/\{\{StudentName\}\}/g, student.studentName || '')
    .replace(/\{\{name\}\}/g, student.studentName || '')
    .replace(/\{\{USN\}\}/g, student.usn || '')
    .replace(/\{\{usn\}\}/g, student.usn || '')
    .replace(/\{\{Email\}\}/g, student.email || '')
    .replace(/\{\{email\}\}/g, student.email || '')
    .replace(/\{\{Block\}\}/g, blockName)
    .replace(/\{\{block\}\}/g, blockName)
    .replace(/\{\{Floor\}\}/g, floorNo)
    .replace(/\{\{floor\}\}/g, floorNo)
    .replace(/\{\{Room\}\}/g, roomNo)
    .replace(/\{\{room\}\}/g, roomNo)
    .replace(/\{\{Bed\}\}/g, bedNo)
    .replace(/\{\{bed\}\}/g, bedNo)
    // Single curly brace placeholders
    .replace(/\{name\}/g, student.studentName || '')
    .replace(/\{usn\}/g, student.usn || '')
    .replace(/\{email\}/g, student.email || '')
    .replace(/\{block\}/g, blockName)
    .replace(/\{floor\}/g, floorNo)
    .replace(/\{room\}/g, roomNo)
    .replace(/\{bed\}/g, bedNo);
}

async function sendWorkflowEmail(studentId: string, action: string, mode: 'Manual' | 'Automatic' = 'Automatic'): Promise<boolean> {
  try {
    const student = await prisma.application.findUnique({ where: { id: studentId } });
    if (!student) {
      console.error(`sendWorkflowEmail error: Student not found with ID ${studentId}`);
      return false;
    }

    const workflowName = getWorkflowHistoryName(action);

    // Check if already sent
    const sentRecord = await prisma.emailHistory.findFirst({
      where: {
        studentId: student.id,
        workflow: workflowName,
        status: 'Sent'
      }
    });
    if (sentRecord) {
      console.log(`sendWorkflowEmail: Email already sent for student ${student.studentName} (${workflowName})`);
      return false;
    }

    const template = await getEmailTemplate(action);
    if (!template) {
      console.error(`sendWorkflowEmail error: No template found for action ${action}`);
      return false;
    }

    const allocation = await prisma.allocation.findFirst({
      where: { applicationId: student.id, status: 'ACTIVE' },
      include: { bed: { include: { room: { include: { block: true } } } } }
    });

    const subject = replacePlaceholders(template.subject, student, allocation);
    const body = replacePlaceholders(template.body, student, allocation);

    const studentEmail = student.email;
    const fatherEmail = student.fatherEmail || null;
    const motherEmail = student.motherEmail || null;
    const guardianEmail = student.guardianEmail || null;

    const targets: { role: 'student' | 'father' | 'mother' | 'guardian'; email: string }[] = [];
    if (studentEmail) targets.push({ role: 'student', email: studentEmail });
    if (fatherEmail) targets.push({ role: 'father', email: fatherEmail });
    if (motherEmail) targets.push({ role: 'mother', email: motherEmail });
    if (!fatherEmail && !motherEmail && guardianEmail) {
      targets.push({ role: 'guardian', email: guardianEmail });
    }

    const results: Record<string, { email: string; sent: boolean }> = {};
    let anySentSuccess = false;
    for (const t of targets) {
      const sent = await sendRealEmail(t.email, subject, body.replace(/\n/g, "<br>"));
      results[t.role] = { email: t.email, sent };
      if (sent) anySentSuccess = true;
    }

    const finalStatus = anySentSuccess ? 'Sent' : 'Failed';

    await prisma.emailHistory.create({
      data: {
        studentId: student.id,
        studentName: student.studentName,
        usn: student.usn,
        email: student.email,
        workflow: workflowName,
        subject,
        body,
        status: finalStatus,
        mode
      }
    });

    await prisma.application.update({
      where: { id: student.id },
      data: {
        studentEmailSent: results.student ? results.student.sent : student.studentEmailSent,
        fatherEmailSent: results.father ? results.father.sent : student.fatherEmailSent,
        motherEmailSent: results.mother ? results.mother.sent : (results.guardian ? results.guardian.sent : student.motherEmailSent),
        studentEmailSentAt: results.student?.sent ? new Date() : student.studentEmailSentAt,
        fatherEmailSentAt: results.father?.sent ? new Date() : student.fatherEmailSentAt,
        motherEmailSentAt: (results.mother?.sent || results.guardian?.sent) ? new Date() : student.motherEmailSentAt,
      }
    });

    console.log(`sendWorkflowEmail finished: student=${student.studentName}, status=${finalStatus}`);
    return anySentSuccess;
  } catch (error) {
    console.error(`Failed to send workflow email for student ${studentId}: ${error}`);
    return false;
  }
}

type PendingDispatch = {
  studentId: string;
  workflow: string;
};

async function getPendingDispatches(): Promise<PendingDispatch[]> {
  const dispatches: PendingDispatch[] = [];
  const applications = await prisma.application.findMany();

  for (const app of applications) {
    if (app.status === 'ALLOCATED') {
      // Allocation email
      const hasAllocation = await prisma.emailHistory.findFirst({
        where: { studentId: app.id, workflow: 'Allocation', status: 'Sent' }
      });
      if (!hasAllocation) {
        dispatches.push({ studentId: app.id, workflow: 'ALLOCATION' });
      }

      // Payment Confirmation
      const hasPayConf = await prisma.emailHistory.findFirst({
        where: { studentId: app.id, workflow: 'Payment Confirmation', status: 'Sent' }
      });
      if (!hasPayConf) {
        const approvedPayment = await prisma.payment.findFirst({
          where: { studentUsn: app.usn, status: 'APPROVED' }
        });
        if (approvedPayment) {
          dispatches.push({ studentId: app.id, workflow: 'PAYMENT_CONFIRMATION' });
        }
      }

      // Payment Reminder
      const hasPayReminder = await prisma.emailHistory.findFirst({
        where: { studentId: app.id, workflow: 'Payment Reminder', status: 'Sent' }
      });
      if (!hasPayReminder) {
        const approvedPayment = await prisma.payment.findFirst({
          where: { studentUsn: app.usn, status: 'APPROVED' }
        });
        if (!approvedPayment) {
          dispatches.push({ studentId: app.id, workflow: 'PAYMENT_REMINDER' });
        }
      }

      // Annual Fee Reminder
      const hasAnnualReminder = await prisma.emailHistory.findFirst({
        where: { studentId: app.id, workflow: 'Annual Hostel Fee Reminder', status: 'Sent' }
      });
      if (!hasAnnualReminder) {
        dispatches.push({ studentId: app.id, workflow: 'ANNUAL_FEE_REMINDER' });
      }
    } else if (app.status === 'REJECTED') {
      // Rejection email
      const hasRejection = await prisma.emailHistory.findFirst({
        where: { studentId: app.id, workflow: 'Rejection', status: 'Sent' }
      });
      if (!hasRejection) {
        dispatches.push({ studentId: app.id, workflow: 'REJECTION' });
      }
    }
  }

  return dispatches;
}

async function processPendingEmails() {
  try {
    console.log("Starting processPendingEmails...");
    const dispatches = await getPendingDispatches();
    const total = dispatches.length;
    console.log(`Found ${total} pending dispatches.`);

    if (total === 0) {
      io.emit('bulk_email_complete', {
        summary: {
          ALLOCATION: { sent: 0, failed: 0 },
          REJECTION: { sent: 0, failed: 0 },
          PAYMENT_CONFIRMATION: { sent: 0, failed: 0 },
          PAYMENT_REMINDER: { sent: 0, failed: 0 },
          ANNUAL_FEE_REMINDER: { sent: 0, failed: 0 }
        }
      });
      console.log("Finished processPendingEmails (0 dispatches).");
      return;
    }

    const summary = {
      ALLOCATION: { sent: 0, failed: 0 },
      REJECTION: { sent: 0, failed: 0 },
      PAYMENT_CONFIRMATION: { sent: 0, failed: 0 },
      PAYMENT_REMINDER: { sent: 0, failed: 0 },
      ANNUAL_FEE_REMINDER: { sent: 0, failed: 0 }
    };

    let processed = 0;
    for (const d of dispatches) {
      console.log(`processPendingEmails: sending ${d.workflow} for student ID ${d.studentId} (${processed + 1}/${total})`);
      
      // Send real-time progress update
      io.emit('bulk_email_progress', {
        current: processed,
        total: total,
        workflow: getWorkflowHistoryName(d.workflow)
      });

      const success = await sendWorkflowEmail(d.studentId, d.workflow, 'Automatic');
      
      const key = d.workflow as keyof typeof summary;
      if (success) {
        summary[key].sent++;
      } else {
        summary[key].failed++;
      }

      processed++;
    }

    // Send final progress update
    io.emit('bulk_email_progress', {
      current: total,
      total: total,
      workflow: 'Complete'
    });

    // Send completion summary
    io.emit('bulk_email_complete', { summary });
    console.log(`Finished processPendingEmails. Summary: ${JSON.stringify(summary)}`);
  } catch (error) {
    console.error(`Error processing pending emails: ${error}`);
  }
}

app.get('/api/settings/email-pending-count', async (req, res) => {
  try {
    const dispatches = await getPendingDispatches();
    res.json({ pendingCount: dispatches.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch pending count' });
  }
});

app.get('/api/settings/email-mode', async (req, res) => {
  try {
    const mode = await getEmailMode();
    res.json({ mode });
  } catch (error) {
    res.json({ mode: 'Manual' });
  }
});

app.post('/api/settings/email-mode', async (req, res) => {
  try {
    const { mode } = req.body;
    if (mode !== 'Manual' && mode !== 'Automatic') {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key: 'EMAIL_MODE' },
      update: { value: mode },
      create: { key: 'EMAIL_MODE', value: mode }
    });

    await prisma.auditLog.create({
      data: {
        adminName: 'Admin',
        action: 'EMAIL_MODE_UPDATED',
        details: `Updated Email Mode to: ${mode}`
      }
    });

    io.emit('data_updated');

    if (mode === 'Automatic') {
      processPendingEmails().catch(err => console.error("Error processing pending emails:", err));
    }

    res.json({ mode: updated.value });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update email mode' });
  }
});

app.get('/api/email-templates/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const template = await prisma.emailTemplate.findUnique({
      where: { key }
    });
    if (template) {
      res.json(template);
    } else {
      const defaultTmpl = BACKEND_DEFAULT_TEMPLATES[key as keyof typeof BACKEND_DEFAULT_TEMPLATES];
      res.json({ key, subject: defaultTmpl?.subject || '', body: defaultTmpl?.body || '' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

app.post('/api/email-templates', async (req, res) => {
  try {
    const { key, subject, body } = req.body;
    if (!key || !subject || !body) {
      return res.status(400).json({ error: 'Key, subject, and body are required' });
    }

    const updated = await prisma.emailTemplate.upsert({
      where: { key },
      update: { subject, body },
      create: { key, subject, body }
    });

    await prisma.auditLog.create({
      data: {
        adminName: 'Admin',
        action: 'EMAIL_TEMPLATE_UPDATED',
        details: `Updated Email Template for ${key}`
      }
    });

    io.emit('data_updated');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save email template' });
  }
});

app.get('/api/email-history', async (req, res) => {
  try {
    const history = await prisma.emailHistory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const formatted = history.map(h => {
      const d = new Date(h.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        id: h.id,
        studentName: h.studentName,
        usn: h.usn,
        email: h.email,
        workflow: h.workflow,
        subject: h.subject,
        date: dateStr,
        time: timeStr,
        status: h.status,
        mode: h.mode
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

// ─── Facilities CRUD ─────────────────────────────────────────────────────────

// GET all facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// POST create facility
app.post('/api/facilities', async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const facility = await prisma.facility.create({ data: { title, description, imageUrl: imageUrl || null } });
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

// PUT update facility
app.put('/api/facilities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl } = req.body;
    const facility = await prisma.facility.update({
      where: { id },
      data: { title, description, imageUrl: imageUrl || null }
    });
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update facility' });
  }
});

// DELETE facility
app.delete('/api/facilities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.facility.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete facility' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});


// --- Social Groups API ---
app.get('/api/social-groups', async (req, res) => {
  try {
    const groups = await prisma.socialGroup.findMany();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social groups' });
  }
});

app.post('/api/social-groups', async (req, res) => {
  try {
    const group = await prisma.socialGroup.create({ data: req.body });
    io.emit('data_updated');
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create social group' });
  }
});

app.delete('/api/social-groups/:id', async (req, res) => {
  try {
    await prisma.socialGroup.delete({ where: { id: req.params.id } });
    io.emit('data_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete social group' });
  }
});

// --- Chat Messages API ---
app.get('/api/chat-messages/:groupId', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { groupId: req.params.groupId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat-messages', async (req, res) => {
  try {
    const msg = await prisma.chatMessage.create({ data: req.body });
    io.emit('new_chat_message', msg);
    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});
