export interface Student {
  id?: string;
  applicationId?: string;
  name: string;
  usn: string;
  department: string;
  semester: number;
  email: string;
  phone: string;
  address: string;
  parentContact: string;
  year: number;
}

export interface HostelInfo {
  hostel: string;
  block: string;
  floor: number;
  room: string;
  bed: string;
  sharing: string;
  admissionDate: string;
}

export interface FeeComponent {
  component: string;
  amount: number;
}

export interface FeeSummary {
  total: number;
  paid: number;
  remaining: number;
  dueDate: string;
  components: FeeComponent[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'payment' | 'approval' | 'general';
  read: boolean;
}

export interface ReceiptItem {
  receiptNo: string;
  studentName: string;
  usn: string;
  department: string;
  hostelName: string;
  block: string;
  roomNo: string;
  bedNo: string;
  amountPaid: number;
  remainingAmount: number;
  paymentMethod: string;
  transactionId: string;
  refNo: string;
  date: string;
  status: 'Verified' | 'Pending' | 'Processing' | 'Successful';
}

export interface SupportContact {
  office: string;
  contact: string;
  timing: string;
}

export const mockStudent: Student = {
  name: "Dhanitha Machireddy",
  usn: "1TE24CS157",
  department: "Computer Science & Engineering",
  semester: 6,
  year: 3,
  email: "dhanitha.m@college.edu",
  phone: "+91 98765 43210",
  address: "Flat 402, Sunshine Apartments, Jubilee Hills, Hyderabad, 500033",
  parentContact: "+91 98765 01234 (Father)"
};

export const mockHostel: HostelInfo = {
  hostel: "OM SAI PG",
  block: "A",
  floor: 3,
  room: "304",
  bed: "1",
  sharing: "2 Sharing",
  admissionDate: "20 July 2026"
};

export const mockFees: FeeSummary = {
  total: 140000,
  paid: 0,
  remaining: 140000,
  dueDate: "30 July 2026",
  components: [
    { component: "Hostel Fee", amount: 95000 },
    { component: "Security Deposit", amount: 15000 },
    { component: "Mess Fee", amount: 30000 }
  ]
};

export const mockNotifications: NotificationItem[] = [];

export const mockReceipts: ReceiptItem[] = [
  {
    receiptNo: "REC-2026-8941",
    studentName: "Dhanitha Machireddy",
    usn: "1TE24CS157",
    department: "Computer Science & Engineering",
    hostelName: "Main Girls Hostel",
    block: "A",
    roomNo: "203",
    bedNo: "2",
    amountPaid: 10000,
    remainingAmount: 70000,
    paymentMethod: "Net Banking (SBI)",
    transactionId: "TXN5839201948",
    refNo: "REF7839401",
    date: "05 July 2026",
    status: "Verified"
  },
  {
    receiptNo: "REC-2026-7839",
    studentName: "Dhanitha Machireddy",
    usn: "1TE24CS157",
    department: "Computer Science & Engineering",
    hostelName: "Main Girls Hostel",
    block: "A",
    roomNo: "203",
    bedNo: "2",
    amountPaid: 5000,
    remainingAmount: 75000,
    paymentMethod: "UPI (Google Pay)",
    transactionId: "TXN1029485736",
    refNo: "REF1029485",
    date: "08 July 2026",
    status: "Verified"
  }
];

export const mockSupportContacts: SupportContact[] = [
  {
    office: "Accounts Office",
    contact: "+91 80 2699 1234",
    timing: "Monday-Friday, 9 AM - 5 PM"
  },
  {
    office: "Hostel Office",
    contact: "+91 80 2699 5678",
    timing: "Monday-Saturday, 9 AM - 6 PM"
  },
  {
    office: "Emergency Warden",
    contact: "+91 98450 11223",
    timing: "24/7 Support"
  },
  {
    office: "Technical Support",
    contact: "+91 80 2699 9000",
    timing: "Monday-Friday, 9 AM - 5 PM"
  }
];
