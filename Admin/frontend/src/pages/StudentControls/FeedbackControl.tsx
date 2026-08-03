import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Trash2, Plus, X, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackControl() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [newFeedback, setNewFeedback] = useState({
    periodName: 'August 2026',
    ratings: {} as Record<string, number>,
    comments: ''
  });

  const { data: categories = [], isLoading: isLoadingCats } = useQuery({
    queryKey: ['feedbackCategories'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/feedback-categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  // Initialize newFeedback ratings when categories load
  useEffect(() => {
    if (categories.length > 0 && Object.keys(newFeedback.ratings).length === 0) {
      const initialRatings: Record<string, number> = {};
      categories.forEach((cat: any) => initialRatings[cat.name] = 5);
      setNewFeedback(prev => ({ ...prev, ratings: initialRatings }));
    }
  }, [categories]);

  const { data: feedbackList, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/feedback');
      if (!res.ok) throw new Error('Failed to fetch feedback');
      const data = await res.json();
      return data.map((item: any) => {
        let parsed = {};
        try {
          parsed = typeof item.ratings === 'string' ? JSON.parse(item.ratings) : item.ratings;
        } catch(e) {}
        return { ...item, parsedRatings: parsed };
      });
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('http://localhost:5000/api/feedback-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to add category');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Category added successfully');
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['feedbackCategories'] });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/feedback-categories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['feedbackCategories'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/feedback/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete feedback');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Feedback deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Anonymous Admin',
          usn: 'ADMIN-ENTRY',
          periodName: data.periodName,
          ratings: data.ratings,
          comments: data.comments
        })
      });
      if (!res.ok) throw new Error('Failed to add feedback');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Feedback added successfully');
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    }
  });

  if (isLoading || isLoadingCats) return <div className="text-slate-500 font-bold p-8 text-center animate-pulse">Loading feedback submissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Feedback</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Real-time submissions and manual overrides</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100 flex items-center">
            Total Received: {feedbackList?.length || 0}
          </div>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Settings2 className="w-4 h-4" />
            Manage Categories
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Feedback
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {feedbackList?.map((feedback: any) => (
          <div key={feedback.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 hover:shadow-md transition-shadow relative group">
            
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this feedback?')) {
                  deleteMutation.mutate(feedback.id);
                }
              }}
              className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
              title="Delete Feedback"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-start border-b border-slate-100 pb-3 pr-10">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{feedback.studentName || 'Anonymous'}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{feedback.usn || 'N/A'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {feedback.periodName}
                </span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                  {new Date(feedback.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(feedback.parsedRatings || {}).map(([catName, ratingValue]) => (
                <div key={catName} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-600 capitalize truncate mr-2" title={catName}>{catName}</span>
                  <span className="font-black text-amber-500 flex items-center gap-1 shrink-0"><Star className="w-3.5 h-3.5 fill-amber-500" /> {ratingValue as number}/5</span>
                </div>
              ))}
            </div>

            {feedback.comments && (
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50 mt-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Additional Comments</span>
                </div>
                <p className="text-xs text-slate-700 italic">"{feedback.comments}"</p>
              </div>
            )}
            
          </div>
        ))}
        {feedbackList?.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No feedback received yet.</p>
            <p className="text-xs text-slate-400 mt-1">When students submit feedback, it will appear here.</p>
          </div>
        )}
      </div>

      {/* Add Manual Feedback Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Add Anonymous Feedback
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Period</label>
                <input type="text" value={newFeedback.periodName} onChange={e => setNewFeedback({...newFeedback, periodName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat: any) => (
                  <div key={cat.id}>
                    <label className="block text-xs font-bold text-slate-700 mb-1 capitalize truncate" title={cat.name}>{cat.name}</label>
                    <select 
                      value={newFeedback.ratings[cat.name] || 5}
                      onChange={e => setNewFeedback(prev => ({
                        ...prev, 
                        ratings: { ...prev.ratings, [cat.name]: parseInt(e.target.value) }
                      }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comments</label>
                <textarea 
                  value={newFeedback.comments} 
                  onChange={e => setNewFeedback({...newFeedback, comments: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  rows={3} 
                  placeholder="Optional comments..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => addMutation.mutate(newFeedback)}
                disabled={addMutation.isPending}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {addMutation.isPending ? 'Adding...' : 'Save Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                Manage Categories
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="font-bold text-sm text-slate-700 capitalize">{cat.name}</span>
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this category? Current feedback won\\'t be affected, but future forms won\\'t show it.')) {
                          deleteCategoryMutation.mutate(cat.id);
                        }
                      }}
                      className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-sm text-slate-500 text-center">No categories exist.</p>}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">Add New Category</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="e.g. Gym Quality"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCategoryName) addCategoryMutation.mutate(newCategoryName);
                    }}
                  />
                  <button 
                    onClick={() => addCategoryMutation.mutate(newCategoryName)}
                    disabled={!newCategoryName || addCategoryMutation.isPending}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
