import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Megaphone, Calendar, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialControl() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'groups' | 'announcements'>('groups');
  
  // Announcements State
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [postData, setPostData] = useState({ title: '', content: '', type: 'Announcement', author: 'Admin' });

  // Groups State
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupData, setGroupData] = useState({ name: '', desc: '', iconName: 'MessageSquare', badge: '' });

  // Queries
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['social'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/social');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    }
  });

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['social-groups'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/social-groups');
      if (!res.ok) throw new Error('Failed to fetch groups');
      return res.json();
    }
  });

  // Post Mutations
  const createPostMutation = useMutation({
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
      setIsAddingPost(false);
      setPostData({ title: '', content: '', type: 'Announcement', author: 'Admin' });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/social/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Post deleted');
    }
  });

  // Group Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('http://localhost:5000/api/social-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-groups'] });
      toast.success('Group created successfully');
      setIsAddingGroup(false);
      setGroupData({ name: '', desc: '', iconName: 'MessageSquare', badge: '' });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/social-groups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-groups'] });
      toast.success('Group deleted');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Social Connect & Announcements</h2>
      </div>

      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'groups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Chat Groups
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'announcements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Announcements
        </button>
      </div>

      {activeTab === 'groups' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingGroup(!isAddingGroup)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Chat Group
            </button>
          </div>

          {isAddingGroup && (
            <form onSubmit={(e) => { e.preventDefault(); createGroupMutation.mutate(groupData); }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                  <input required type="text" value={groupData.name} onChange={e => setGroupData({ ...groupData, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. general-lounge" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                  <select value={groupData.iconName} onChange={e => setGroupData({ ...groupData, iconName: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="MessageSquare">Message Square</option>
                    <option value="Users">Users</option>
                    <option value="ShoppingBag">Shopping Bag</option>
                    <option value="HelpCircle">Help Circle</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Megaphone">Megaphone</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input required type="text" value={groupData.desc} onChange={e => setGroupData({ ...groupData, desc: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Badge (Optional)</label>
                <input type="text" value={groupData.badge} onChange={e => setGroupData({ ...groupData, badge: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. New, Active" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingGroup(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={createGroupMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Save Group</button>
              </div>
            </form>
          )}

          {loadingGroups ? (
            <div className="text-slate-500">Loading groups...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups?.map((group: any) => (
                <div key={group.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-6 h-6" />
                      </div>
                      <button onClick={() => deleteGroupMutation.mutate(group.id)} className="text-slate-400 hover:text-red-500 transition p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      #{group.name}
                      {group.badge && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">{group.badge}</span>}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{group.desc}</p>
                  </div>
                </div>
              ))}
              {groups?.length === 0 && <p className="text-slate-500 col-span-full text-center py-8">No groups created yet.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingPost(!isAddingPost)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
            >
              <Plus className="w-4 h-4" /> Create Announcement
            </button>
          </div>

          {isAddingPost && (
            <form onSubmit={(e) => { e.preventDefault(); createPostMutation.mutate(postData); }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input required type="text" value={postData.title} onChange={e => setPostData({ ...postData, title: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={postData.type} onChange={e => setPostData({ ...postData, type: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea required value={postData.content} onChange={e => setPostData({ ...postData, content: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingPost(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={createPostMutation.isPending} className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition">Publish</button>
              </div>
            </form>
          )}

          {loadingPosts ? (
            <div className="text-slate-500">Loading announcements...</div>
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
                      <button onClick={() => deletePostMutation.mutate(post.id)} className="text-slate-400 hover:text-red-500 transition p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))}
              {posts?.length === 0 && <p className="text-slate-500 text-center py-8">No announcements created yet.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
