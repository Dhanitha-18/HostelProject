import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Megaphone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialControl() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'Announcement', author: 'Admin' });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/social');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('http://localhost:5000/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Post created successfully');
      setIsAdding(false);
      setFormData({ title: '', content: '', type: 'Announcement', author: 'Admin' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/social/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Post deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Social Connect & Announcements</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Publish</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-slate-500">Loading posts...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts?.map((post: any) => (
            <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
              <div className={`p-3 rounded-xl h-fit ${post.type === 'Announcement' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {post.type === 'Announcement' ? <Megaphone className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{post.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(post.id)} className="text-slate-400 hover:text-red-500 transition p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          ))}
          {posts?.length === 0 && <p className="text-slate-500 text-center py-8">No posts created yet.</p>}
        </div>
      )}
    </div>
  );
}
