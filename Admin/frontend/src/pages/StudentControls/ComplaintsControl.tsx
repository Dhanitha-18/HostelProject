import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ComplaintsControl() {
  const queryClient = useQueryClient();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/complaints');
      if (!res.ok) throw new Error('Failed to fetch complaints');
      return res.json();
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint status updated');
    }
  });

  if (isLoading) return <div className="text-slate-500">Loading complaints...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Student Complaints</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Room & Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints?.map((complaint: any) => (
              <tr key={complaint.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <div className="font-medium text-slate-800">{complaint.studentName}</div>
                  <div className="text-xs text-slate-500">{complaint.usn}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-800">Room {complaint.roomNo}</div>
                  <div className="text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-full mt-1">{complaint.category}</div>
                </td>
                <td className="p-4 max-w-xs text-slate-600">{complaint.description}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={complaint.status}
                    onChange={(e) => updateStatus.mutate({ id: complaint.id, status: e.target.value })}
                    className="p-1.5 text-xs font-medium bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
            {complaints?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No complaints found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
