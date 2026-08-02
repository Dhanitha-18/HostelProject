import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Download, Filter, FileSpreadsheet, ChevronDown, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../lib/api';

const getPhotoUrl = (url: string) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

const formatSubmissionDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Not Available';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Not Available';
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  
  return `${day} ${month} ${year} • ${strTime}`;
};

const displayVal = (val: any) => {
  if (val === undefined || val === null || String(val).trim() === '' || val === '-') return 'Not Available';
  return val;
};

export default function StudentDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications_all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/applications');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments_all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/payments');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const isLoading = isLoadingApps || isLoadingPayments;

  const enrichedApplications = useMemo(() => {
    if (!applications) return [];
    return applications.map((app: any) => {
      // Find latest payment for this application (payments are sorted desc by default from backend)
      const appPayment = payments?.find((p: any) => p.studentUsn === app.usn);
      return {
        ...app,
        latestPayment: appPayment || null
      };
    });
  }, [applications, payments]);

  // Extract unique blocks for the filter dropdown
  const uniqueBlocks = useMemo(() => {
    if (!applications) return [];
    const blocks = new Set<string>();
    applications.forEach((app: any) => {
      if (app.allocations && app.allocations.length > 0) {
        const alloc = app.allocations[0];
        if (alloc.bed?.room?.block?.name) {
          blocks.add(alloc.bed.room.block.name);
        }
      }
    });
    return Array.from(blocks).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (!enrichedApplications) return [];
    return enrichedApplications.filter((app: any) => {
      // Apply Search
      const searchStr = searchQuery.toLowerCase();
      const formattedId = app.id.startsWith('APP-') ? app.id : `APP-2026-${app.id.slice(0, 6).toUpperCase()}`;
      const matchesSearch = 
        app.studentName.toLowerCase().includes(searchStr) || 
        app.usn.toLowerCase().includes(searchStr) ||
        app.phoneNumber.includes(searchStr) ||
        app.email.toLowerCase().includes(searchStr) ||
        formattedId.toLowerCase().includes(searchStr);
      
      if (!matchesSearch) return false;

      // Apply Status Filter
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

      // Apply Gender Filter
      if (genderFilter !== 'ALL' && app.gender !== genderFilter) return false;

      // Apply Block Filter
      if (blockFilter !== 'ALL') {
        const blockName = app.allocations?.[0]?.bed?.room?.block?.name;
        if (blockName !== blockFilter) return false;
      }

      return true;
    });
  }, [enrichedApplications, searchQuery, statusFilter, genderFilter, blockFilter]);

  const handleExportExcel = () => {
    if (!filteredApplications || filteredApplications.length === 0) return;
    
    const headers = [
      'App ID', 'Student Name', 'USN', 'BMSIT ID', 'Gender', 'Branch', 'Sem', 'DOB', 
      'Phone', 'Email', 'Address', 
      'Quota', 'Rank', 'Blood Group', 'Nationality', 'Religion', 'Aadhaar',
      'Father Name', 'Father Phone', 'Father Email', 'Father Occupation',
      'Mother Name', 'Mother Phone', 'Mother Email', 'Mother Occupation',
      'Guardian Name', 'Guardian Phone', 'Guardian Email', 
      'Emergency Contact', 'Category', 'Hostel Pref', 
      'Medical Info', 'Allergies', 'Medication', 'Remarks', 'Status', 'Hold Reason', 'Applied At', 
      'Allocated Block', 'Allocated Room', 'Allocated Bed',
      'UTR Number', 'Payment Date', 'Payment Status'
    ];

    const rows = filteredApplications.map((app: any) => {
      const alloc = app.allocations?.[0];
      const block = alloc?.bed?.room?.block?.name || '';
      const room = alloc?.bed?.room?.roomNo || '';
      const bed = alloc?.bed?.bedNo || '';
      
      return [
        app.id.startsWith('APP-') ? app.id : `APP-2026-${app.id.slice(0, 6).toUpperCase()}`,
        app.studentName,
        app.usn,
        app.bmsitId || '',
        app.gender,
        app.department,
        app.yearSem,
        new Date(app.dob).toLocaleDateString(),
        app.phoneNumber,
        app.email,
        app.address || '',
        app.quota || '',
        app.rank || '',
        app.bloodGroup || '',
        app.nationality || '',
        app.religion || '',
        app.aadhaar || '',
        app.fatherName,
        app.fatherPhone,
        app.fatherEmail || '',
        app.fatherOcc || '',
        app.motherName || '',
        app.motherPhone || '',
        app.motherEmail || '',
        app.motherOcc || '',
        app.guardianName || '',
        app.guardianPhone || '',
        app.guardianEmail || '',
        app.emergencyContact || '',
        app.category || '',
        app.hostelPref,
        app.medicalInfo || '',
        app.allergies || '',
        app.medication || '',
        app.remarks || '',
        app.status,
        app.holdReason || '',
        new Date(app.appliedAt || app.createdAt).toLocaleString(),
        block,
        room,
        bed,
        app.latestPayment?.utrNumber || '',
        app.latestPayment?.paymentDate ? new Date(app.latestPayment.paymentDate).toLocaleDateString() : '',
        app.latestPayment?.status || ''
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    const colWidths = headers.map(header => ({ wch: Math.max(header.length + 2, 12) }));
    colWidths[1].wch = 25; // Student Name
    colWidths[8].wch = 15; // Phone
    colWidths[9].wch = 30; // Email
    colWidths[10].wch = 40; // Address
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    XLSX.writeFile(workbook, "Student_Database.xlsx");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-rose-100 text-rose-700';
      case 'ALLOCATED': return 'bg-indigo-100 text-indigo-700';
      case 'TRANSFERRED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Filters Row */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center space-x-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name, USN, phone, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700 placeholder:font-normal" 
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="REJECTED">Rejected</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>

            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center space-x-2">
              <select 
                value={genderFilter} 
                onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Boys</option>
                <option value="FEMALE">Girls</option>
              </select>
            </div>

            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center space-x-2">
              <select 
                value={blockFilter} 
                onChange={(e) => setBlockFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Blocks</option>
                {uniqueBlocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </div>
          </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-200 overflow-hidden relative font-sans">
        
        {/* Spreadsheet Toolbar Header */}
        <div className="bg-[#312E81] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-indigo-50" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-white">Student Applications & Database Sheet</h3>
              <p className="text-[11px] text-indigo-200 font-medium mt-0.5">Real-time consolidated spreadsheet of all student admissions and status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Total Entries: {filteredApplications.length}
            </span>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Sheet (.XLSX)</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 text-slate-500 border-t border-indigo-100">
            <Search className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-lg">No matching records found.</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] custom-scrollbar border-t border-indigo-100">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-indigo-50 shadow-sm z-20">
                <tr className="border-b border-indigo-200">
                  <th className="p-3 w-10 text-center border-r border-indigo-200/50"></th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">#</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50 sticky left-0 bg-indigo-50 shadow-[1px_0_0_rgba(199,210,254,0.5)] z-30">Student Name</th>


                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">USN</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Branch</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Sem</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Hostel Pref</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Allocated Block</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Room</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Bed</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">UTR Number</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Phone</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Email</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Gender</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">BMSIT ID</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">DOB</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Category</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Applied At</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Address</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Quota</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Rank</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Blood Group</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Nationality</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Religion</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Aadhaar</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Father's Name</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Father's Phone</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Father's Email</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Father's Occ</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Mother's Name</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Mother's Phone</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Mother's Email</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Mother's Occ</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Guardian's Name</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Guardian's Phone</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Guardian's Email</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Emergency Contact</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Medical Info</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Allergies</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Medication</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Remarks</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider border-r border-indigo-200/50">Hold Reason</th>
                  <th className="p-3 text-[10px] font-black text-indigo-900 uppercase tracking-wider">App ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredApplications.map((app: any, idx: number) => {
                  const alloc = app.allocations?.[0];
                  const blockName = alloc?.bed?.room?.block?.name || '-';
                  const roomNo = alloc?.bed?.room?.roomNo || '-';
                  const bedNo = alloc?.bed?.bedNo || '-';

                  return (
                    <React.Fragment key={app.id}>
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)}
                      >
                        <td className="p-3 text-center border-r border-slate-100">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                            {expandedRow === app.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="p-3 border-r border-slate-100">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                            <span 
                              className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${getStatusColor(app.status)} shadow-sm border border-white`}
                              title={`Application: ${app.status}`}
                            >
                              {app.status.charAt(0).toUpperCase()}
                            </span>
                            <span 
                              className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${app.latestPayment?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'} shadow-sm border border-white`}
                              title={app.latestPayment ? `Payment: ${app.latestPayment.status}` : 'Payment: Pending'}
                            >
                              P
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm font-bold text-slate-800 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-indigo-50/50 shadow-[1px_0_0_rgba(241,245,249,1)] group-hover:shadow-[1px_0_0_rgba(199,210,254,0.5)] z-10 transition-colors">{app.studentName}</td>

                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.usn}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.department}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 text-center">{app.yearSem}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.hostelPref}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{blockName}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 text-center">{roomNo}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 text-center">{bedNo}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.latestPayment?.utrNumber || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.phoneNumber}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.email}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.gender}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.bmsitId || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{new Date(app.dob).toLocaleDateString()}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.category || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{new Date(app.appliedAt || app.createdAt).toLocaleString()}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={app.address}>{app.address}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.quota || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.rank || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.bloodGroup || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.nationality || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.religion || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.aadhaar || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.fatherName}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.fatherPhone}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.fatherEmail || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.fatherOcc || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.motherName || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.motherPhone || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.motherEmail || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.motherOcc || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.guardianName || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.guardianPhone || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.guardianEmail || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.emergencyContact || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={app.medicalInfo}>{app.medicalInfo || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={app.allergies}>{app.allergies || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={app.medication}>{app.medication || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={app.remarks}>{app.remarks || '-'}</td>
                        <td className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-100">{app.holdReason || '-'}</td>
                        <td className="p-3 text-xs font-mono font-medium text-slate-400 border-r border-slate-100">
                          {app.id.startsWith('APP-') ? app.id : `APP-2026-${app.id.slice(0, 6).toUpperCase()}`}
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedRow === app.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50/80 border-b border-slate-200 shadow-inner overflow-hidden"
                          >
                            <td colSpan={43} className="p-0">
                              <div className="p-6">
                                <h4 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-200 pb-2">Full Application Details</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                  {/* Left Col: Photo */}
                                  <div className="lg:col-span-1 flex flex-col items-center justify-center bg-slate-100/50 rounded-2xl p-4 border border-slate-200">
                                    <div className="w-32 h-40 rounded-xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center overflow-hidden shadow-sm relative">
                                      {app.photoUrl || app.passportPhoto ? (
                                        <img 
                                          src={getPhotoUrl(app.photoUrl || app.passportPhoto)} 
                                          alt={app.studentName} 
                                          className="w-full h-full object-cover" 
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                          <User className="w-12 h-12 text-slate-300" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">No Photo</span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-3">
                                      Passport Size Photograph
                                    </span>
                                  </div>

                                  {/* Right Col: Fields Grid */}
                                  <div className="lg:col-span-3 space-y-6">
                                    {/* Student Information */}
                                    <div className="space-y-3">
                                      <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Student Information</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Student Name</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.studentName)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Application ID</p>
                                          <p className="text-sm font-semibold text-indigo-600 font-mono font-bold">{app.id.startsWith('APP-') ? app.id : `APP-2026-${app.id.slice(0, 6).toUpperCase()}`}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Application Submission Date</p>
                                          <p className="text-sm font-semibold text-slate-800">{formatSubmissionDate(app.appliedAt || app.createdAt)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">USN</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.usn)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Student Email</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.email)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Phone Number</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.phoneNumber)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Gender</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.gender)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Date of Birth</p>
                                          <p className="text-sm font-semibold text-slate-800">{app.dob ? new Date(app.dob).toLocaleDateString('en-IN') : 'Not Available'}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Department</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.department)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Semester</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.yearSem)}</p>
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                                          <p className="text-sm font-semibold text-slate-800 whitespace-normal">{displayVal(app.address)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Parent Information */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                      <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Parent Information</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Father Name</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.fatherName)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Father Phone</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.fatherPhone)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Father Email</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.fatherEmail)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Mother Name</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.motherName)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Mother Phone</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.motherPhone)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Mother Email</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.motherEmail)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Guardian Name</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.guardianName)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Guardian Phone</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.guardianPhone)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Guardian Email</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.guardianEmail)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Hostel & Allocation Information */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                      <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Hostel & Allocation Information</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Hostel Preference</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.hostelPref)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Emergency Contact</p>
                                          <p className="text-sm font-semibold text-slate-800">{displayVal(app.emergencyContact)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Medical Information</p>
                                          <p className="text-sm font-semibold text-slate-800 whitespace-normal">{displayVal(app.medicalInfo)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Remarks</p>
                                          <p className="text-sm font-semibold text-slate-800 whitespace-normal">{displayVal(app.remarks)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Current Status</p>
                                          <p className="text-sm font-semibold text-slate-800">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                              app.status === 'ALLOCATED' ? 'bg-emerald-100 text-emerald-800' :
                                              app.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-800' :
                                              app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                              'bg-amber-100 text-amber-800'
                                            }`}>{app.status}</span>
                                          </p>
                                        </div>
                                        {app.status === 'ALLOCATED' && (
                                          <>
                                            <div className="space-y-1">
                                              <p className="text-xs font-bold text-slate-500 uppercase">Allocated Block</p>
                                              <p className="text-sm font-semibold text-slate-800">{displayVal(blockName)}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs font-bold text-slate-500 uppercase">Allocated Room & Bed</p>
                                              <p className="text-sm font-semibold text-slate-800">{roomNo !== '-' ? `Room ${roomNo}, Bed ${bedNo}` : 'Not Available'}</p>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 8px;
          border: 3px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}} />
    </div>
  );
}
