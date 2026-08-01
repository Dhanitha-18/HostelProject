import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image as ImageIcon, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function FacilitiesControl() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' });

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/facilities');
      if (!res.ok) throw new Error('Failed to fetch facilities');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('http://localhost:5000/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast.success('Facility added successfully');
      setIsAdding(false);
      setFormData({ title: '', description: '', imageUrl: '' });
    },
    onError: () => toast.error('Failed to add facility')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/facilities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast.success('Facility deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`http://localhost:5000/api/facilities/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast.success('Facility updated successfully');
      setIsAdding(false);
      setEditId(null);
      setFormData({ title: '', description: '', imageUrl: '' });
    },
    onError: () => toast.error('Failed to update facility')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('photo', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, imageUrl: `http://localhost:5000${data.imageUrl}` }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Hostel Facilities</h2>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ title: '', description: '', imageUrl: '' });
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Facility</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Facility Name</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image Upload</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            {formData.imageUrl && <p className="text-xs text-green-600 mt-1">Image ready: {formData.imageUrl.split('/').pop()}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setIsAdding(false); setEditId(null); setFormData({ title: '', description: '', imageUrl: '' }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              {editId ? 'Update Facility' : 'Save Facility'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities?.map((facility: any) => (
            <div key={facility.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
              <div className="h-48 bg-slate-100 relative">
                {facility.imageUrl ? (
                  <img src={facility.imageUrl} alt={facility.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditId(facility.id);
                      setFormData({ title: facility.title, description: facility.description, imageUrl: facility.imageUrl || '' });
                      setIsAdding(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-2 bg-white/80 backdrop-blur-sm text-blue-500 rounded-full hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(facility.id)}
                    className="p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-1">{facility.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{facility.description}</p>
              </div>
            </div>
          ))}
          {facilities?.length === 0 && <p className="text-slate-500 col-span-full">No facilities added yet.</p>}
        </div>
      )}
    </div>
  );
}
