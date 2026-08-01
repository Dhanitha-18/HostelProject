import React, { useState } from 'react';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { 
  Send, ThumbsUp, CheckCircle, Clock, Filter, Search, 
  PhoneCall, ShieldAlert, FileText, ChevronRight, CheckCircle2
} from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  message: string;
  time: string;
}

interface ComplaintItem {
  id: string;
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  upvotes: number;
  assignedTechnician?: string;
  estimatedResolution?: string;
  location: string;
  upvotedByMe?: boolean;
  comments?: CommentItem[];
  imageUrl?: string;
}

// Ticket ID Helper: format any raw string / UUID into a short, clean, unique ticket ID like #TKT-1042
export const formatTicketId = (rawId: string): string => {
  if (!rawId) return '#TKT-1001';
  const cleanId = rawId.trim();
  
  if (cleanId.startsWith('#TKT-')) return cleanId;
  if (cleanId.startsWith('#CMP-') || cleanId.startsWith('#TCK-')) {
    return cleanId.replace(/^#CMP-|^#TCK-/, '#TKT-');
  }
  if (cleanId.startsWith('CMP-') || cleanId.startsWith('TKT-') || cleanId.startsWith('TCK-')) {
    return `#${cleanId.replace(/^CMP-|^TCK-/, 'TKT-')}`;
  }
  
  // If it's a long UUID string (e.g., "f972051a-98bb-4d2e-8745-daaf45c545e3")
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = (hash * 31 + cleanId.charCodeAt(i)) % 9000;
  }
  const ticketNum = 1000 + Math.abs(hash);
  return `#TKT-${ticketNum}`;
};

const INITIAL_COMPLAINTS: ComplaintItem[] = [
  {
    id: '#TKT-1042',
    category: 'Wi-Fi Network',
    subject: 'Frequent connection drops on 3rd Floor Corridor',
    description: 'The Wi-Fi access point in Block A, third floor corridor keeps restarting every 15 minutes, affecting study hours.',
    priority: 'High',
    date: '16 July 2026',
    status: 'In Progress',
    upvotes: 14,
    assignedTechnician: 'Ramesh Kumar (Network Engineer)',
    estimatedResolution: 'Today by 5:00 PM',
    location: 'Block A - Floor 3',
    upvotedByMe: false,
    comments: [
      { id: 'c1', author: 'Warden Smith', message: 'Technician has been notified and is checking the router wiring.', time: '17 July 2026, 10:00 AM' },
      { id: 'c2', author: 'Anish (You)', message: 'Thanks for the quick response. It still dropped once around 11:30.', time: '17 July 2026, 12:00 PM' }
    ]
  },
  {
    id: '#TKT-1004',
    category: 'Plumbing',
    subject: 'Leakage in Washroom Room 304',
    description: 'The washbasin tap has a minor leakage causing water pooling on the floor during morning hours.',
    priority: 'Medium',
    date: '10 July 2026',
    status: 'Resolved',
    upvotes: 3,
    assignedTechnician: 'Suresh Plumber',
    estimatedResolution: 'Resolved on 11 July',
    location: 'Room 304',
    upvotedByMe: false,
    comments: [
      { id: 'c3', author: 'Suresh Plumber', message: 'Replaced the rubber washer. Please verify.', time: '11 July 2026, 3:00 PM' }
    ]
  },
  {
    id: '#TKT-1078',
    category: 'Electrical',
    subject: 'Corridor Light Flickering near Lift',
    description: 'Main corridor bulb near lift #2 is flickering constantly and buzzing loudly.',
    priority: 'Low',
    date: '18 July 2026',
    status: 'Pending',
    upvotes: 6,
    assignedTechnician: 'Pending Assignment',
    estimatedResolution: 'Within 24 Hours',
    location: 'Block B - 2nd Floor',
    upvotedByMe: false,
    comments: []
  }
];

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    try {
      const saved = localStorage.getItem('hostel_complaints');
      const list: ComplaintItem[] = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
      return list.map(item => ({
        ...item,
        id: formatTicketId(item.id)
      }));
    } catch {
      return INITIAL_COMPLAINTS.map(item => ({
        ...item,
        id: formatTicketId(item.id)
      }));
    }
  });
  
  // Filter, Search & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'priority'>('recent');

  // Form State
  const [category, setCategory] = useState('Wi-Fi Network');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [location, setLocation] = useState('Room 304');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState('');

  // Interactive UI Modal & Toast states
  const [activeTrackingComplaint, setActiveTrackingComplaint] = useState<ComplaintItem | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Save complaints to localStorage whenever modified
  React.useEffect(() => {
    try {
      localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.error(e);
    }
  }, [complaints]);

  // Handle Upvote
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal open
    setComplaints(complaints.map(cmp => {
      if (cmp.id === id) {
        const isUpvoted = cmp.upvotedByMe;
        return {
          ...cmp,
          upvotes: isUpvoted ? cmp.upvotes - 1 : cmp.upvotes + 1,
          upvotedByMe: !isUpvoted
        };
      }
      return cmp;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTrackingComplaint) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'Anish (You)',
      message: newCommentText.trim(),
      time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setComplaints(complaints.map(cmp => {
      if (cmp.id === activeTrackingComplaint.id) {
        const updatedComments = [...(cmp.comments || []), newComment];
        const updatedCmp = { ...cmp, comments: updatedComments };
        setActiveTrackingComplaint(updatedCmp);
        return updatedCmp;
      }
      return cmp;
    }));
    setNewCommentText('');
  };

  const handleSimulateFileSelect = () => {
    // Simulate image attach
    setAttachmentName('broken_switch.jpg');
    setAttachmentPreview('https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=150&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      alert("Please fill in the complaint subject and description.");
      return;
    }

    const generatedId = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: ComplaintItem = {
      id: generatedId,
      category,
      subject,
      description,
      priority,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'Pending',
      upvotes: 1,
      assignedTechnician: 'Assigning Duty Technician...',
      estimatedResolution: 'Within 12 Hours',
      location: location || 'Room 304',
      upvotedByMe: true,
      comments: [],
      imageUrl: attachmentPreview || undefined
    };

    setComplaints([newComplaint, ...complaints]);
    
    // Reset form
    setSubject('');
    setDescription('');
    setAttachmentName('');
    setAttachmentPreview('');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'High': return 'bg-warning/10 text-warning border-warning/20';
      case 'Critical': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filtered & Sorted List
  const filteredComplaints = complaints
    .filter(cmp => {
      const formattedId = formatTicketId(cmp.id);
      const matchesSearch = cmp.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cmp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            formattedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cmp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cmp.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || cmp.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || cmp.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      if (sortBy === 'priority') {
        const weight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return weight[b.priority] - weight[a.priority];
      }
      // recent: Compare IDs descending
      return b.id.localeCompare(a.id);
    });

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <HeroBanner 
        image="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80"
        title="Grievance & Maintenance Redressal"
        subtitle="Report room repairs, Wi-Fi outages & track technician resolution timeline"
      />

      {/* Toast Notification */}
      {isSuccessToast && (
        <div className="bg-success text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-xs">Grievance ticket submitted successfully! Maintenance warden notified.</span>
          </div>
          <button onClick={() => setIsSuccessToast(false)} className="text-white text-sm font-bold">✕</button>
        </div>
      )}

      {/* Top Quick Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-4 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Logged</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{totalCount} Tickets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border p-4 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-black text-blue-600 font-mono mt-0.5 block">{inProgressCount} Active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border p-4 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Resolved SLA</span>
            <span className="text-xl font-black text-success font-mono mt-0.5 block">{resolvedCount} Tickets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border p-4 rounded-2xl shadow-soft flex items-center justify-center">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="w-full bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS Repair</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Logged Complaints List & Filters */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-text uppercase tracking-wider">Complaint History Log</h3>
                <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Monitor progress & live technician assignment updates</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search complaint ID or topic..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold">
              <div className="flex items-center gap-1 text-[10px] text-text-muted uppercase font-bold tracking-wider mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'Pending', 'In Progress', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                      selectedStatus === st ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1 ml-auto">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-border rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
                >
                  <option value="recent">Sort: Recent</option>
                  <option value="upvotes">Sort: Upvotes</option>
                  <option value="priority">Sort: Priority</option>
                </select>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-border rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Wi-Fi Network">Wi-Fi Network</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Mess Food">Mess Food</option>
                </select>
              </div>
            </div>

            {/* Complaints Items Container */}
            <div className="space-y-4 pt-2">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl text-text-muted text-xs font-semibold">
                  No complaints found matching criteria.
                </div>
              ) : (
                filteredComplaints.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setActiveTrackingComplaint(item)}
                    className="border border-border rounded-2xl p-5 space-y-3 hover:border-primary/40 transition-all bg-white shadow-sm cursor-pointer group"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted">
                          <span className="text-primary font-mono font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[11px]">
                            {formatTicketId(item.id)}
                          </span>
                          <span>• {item.date}</span>
                          <span>• {item.location}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-850 leading-snug group-hover:text-primary transition-colors">
                          {item.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityStyle(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-text-muted leading-relaxed font-semibold line-clamp-2">{item.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-text-muted font-bold gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{item.category}</span>
                        {item.assignedTechnician && (
                          <span className="text-slate-600 font-mono text-[9.5px]">Assigned: {item.assignedTechnician}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Upvote Button */}
                        <button
                          type="button"
                          onClick={(e) => handleUpvote(item.id, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                            item.upvotedByMe 
                              ? 'bg-primary/10 text-primary border-primary/30' 
                              : 'bg-slate-50 text-slate-600 border-border hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${item.upvotedByMe ? 'fill-primary' : ''}`} />
                          <span>Me Too ({item.upvotes})</span>
                        </button>

                        <span className="text-primary font-bold flex items-center gap-1 text-[10.5px]">
                          Track Live Timeline <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Right 1 Column: File New Grievance Form */}
        <div className="bg-white border border-border p-6 rounded-2xl shadow-soft space-y-5 h-fit">
          <div>
            <h3 className="text-sm font-black text-text uppercase tracking-wider">File New Grievance</h3>
            <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Directly alerts hostel warden & maintenance team</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Wi-Fi Network">Wi-Fi Network</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Mess Food">Mess Food</option>
                <option value="Carpentry / Furniture">Carpentry / Furniture</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Priority *</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Location / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Room 304"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Subject Title *</label>
              <input
                type="text"
                placeholder="e.g. Broken wall socket near study desk"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Detailed Description *</label>
              <textarea
                rows={4}
                placeholder="Describe what happened, floor location, and timing..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl p-3 font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Photo Proof Attachment</label>
              <button
                type="button"
                onClick={handleSimulateFileSelect}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-border rounded-xl p-3 text-[11px] font-bold text-text-muted transition-colors flex items-center justify-center gap-2"
              >
                <span>{attachmentName ? `Attached: ${attachmentName}` : '+ Attach Simulated Photo'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>

          </form>

        </div>

      </div>

      {/* MODAL 1: Live Status Timeline & Technician Tracker */}
      {activeTrackingComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-border">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                  {formatTicketId(activeTrackingComplaint.id)}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1.5">{activeTrackingComplaint.subject}</h3>
                <p className="text-xs text-text-muted font-semibold mt-0.5">{activeTrackingComplaint.location} • {activeTrackingComplaint.date}</p>
              </div>
              <button 
                onClick={() => setActiveTrackingComplaint(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live Progress Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Ticket Resolution Lifecycle</h4>
              
              <div className="space-y-4 relative pl-6 border-l-2 border-slate-200">
                
                {/* Stage 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center text-white text-[8px] font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Ticket Registered & Warden Notified</span>
                    <span className="text-[10px] text-text-muted font-semibold">Log recorded in central hostel queue</span>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${
                    activeTrackingComplaint.status !== 'Pending' ? 'bg-success' : 'bg-slate-300'
                  }`}>
                    {activeTrackingComplaint.status !== 'Pending' ? '✓' : '2'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Technician Assigned</span>
                    <span className="text-[10px] text-text-muted font-semibold">
                      {activeTrackingComplaint.assignedTechnician || 'Assigned to maintenance technician'}
                    </span>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${
                    activeTrackingComplaint.status === 'Resolved' ? 'bg-success' : 'bg-slate-300'
                  }`}>
                    {activeTrackingComplaint.status === 'Resolved' ? '✓' : '3'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Work Inspection & Closure</span>
                    <span className="text-[10px] text-text-muted font-semibold">
                      Est. SLA: {activeTrackingComplaint.estimatedResolution || 'Within 24 Hours'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Comment Thread & Updates */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Discussion & Timeline Comments</h4>
              
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-thin text-xs text-left">
                {!activeTrackingComplaint.comments || activeTrackingComplaint.comments.length === 0 ? (
                  <div className="text-[11px] text-text-muted font-bold py-2 text-center">
                    No comments yet. Post an update below.
                  </div>
                ) : (
                  activeTrackingComplaint.comments.map(c => (
                    <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-semibold border border-slate-100">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-primary">{c.author}</span>
                        <span className="text-text-muted font-mono">{c.time}</span>
                      </div>
                      <p className="text-slate-800 text-[11px]">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for update or reply..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="flex-grow bg-slate-50 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-xl text-xs font-black transition-colors"
                >
                  Post
                </button>
              </form>
            </div>

            {/* Ticket Image Preview */}
            {activeTrackingComplaint.imageUrl && (
              <div className="space-y-1 border-t border-slate-100 pt-3 text-left">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Attached Photo Proof</span>
                <img src={activeTrackingComplaint.imageUrl} alt="Proof" className="w-full h-32 object-cover rounded-xl border border-border" />
              </div>
            )}

            {/* Technician Contact Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Assigned Technician</span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block">{activeTrackingComplaint.assignedTechnician || 'Duty Technician'}</span>
              </div>
              <a 
                href="tel:9876543210" 
                className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Technician</span>
              </a>
            </div>

            <button
              onClick={() => setActiveTrackingComplaint(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Emergency SOS Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center font-bold">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Emergency SOS Repair</h3>
                  <p className="text-xs text-text-muted font-semibold">Immediate dispatch for critical incidents</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-danger/5 border border-danger/20 p-4 rounded-xl space-y-2 text-xs font-semibold text-danger">
              <p>⚡ High priority dispatch for Water Pipe Burst, Main Line Short Circuit, or Gas Leakage.</p>
              <p>Duty Technician Hotline: <strong>+91 98860 12345</strong></p>
            </div>

            <button
              onClick={() => {
                alert("Emergency SOS Alert dispatched to Duty Warden & On-call Plumbing/Electrical team!");
                setShowEmergencyModal(false);
              }}
              className="w-full bg-danger hover:bg-danger-dark text-white font-black py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Dispatch Emergency Response Now</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
