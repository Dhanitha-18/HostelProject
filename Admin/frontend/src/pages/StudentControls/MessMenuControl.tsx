import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Utensils, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export default function MessMenuControl() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [editData, setEditData] = useState({ name: '', desc: '', type: 'Veg', img: '', time: '' });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['mess-menu'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/settings/mess-menu');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      return data.menu;
    },
    onSuccess: (data) => {
      if (data && data[selectedDay] && data[selectedDay][selectedMeal]) {
        setEditData(data[selectedDay][selectedMeal]);
      }
    }
  });

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    if (menuData && menuData[day] && menuData[day][selectedMeal]) {
      setEditData(menuData[day][selectedMeal]);
    } else {
      setEditData({ name: '', desc: '', type: 'Veg', img: '', time: '' });
    }
  };

  const handleMealChange = (meal: string) => {
    setSelectedMeal(meal);
    if (menuData && menuData[selectedDay] && menuData[selectedDay][meal]) {
      setEditData(menuData[selectedDay][meal]);
    } else {
      setEditData({ name: '', desc: '', type: 'Veg', img: '', time: '' });
    }
  };

  const mutation = useMutation({
    mutationFn: async (updatedMenu: any) => {
      const res = await fetch('http://localhost:5000/api/settings/mess-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updatedMenu })
      });
      if (!res.ok) throw new Error('Failed to save menu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-menu'] });
      toast.success('Menu updated successfully');
    },
    onError: () => toast.error('Failed to update menu')
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('photo', file);

    const toastId = toast.loading('Uploading image...');
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setEditData(prev => ({ ...prev, img: 'http://localhost:5000' + data.imageUrl }));
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleSave = () => {
    if (!menuData) return;
    const updatedMenu = { ...menuData };
    if (!updatedMenu[selectedDay]) updatedMenu[selectedDay] = {};
    updatedMenu[selectedDay][selectedMeal] = editData;
    mutation.mutate(updatedMenu);
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mess Menu Control</h1>
          <p className="text-slate-500">Update the weekly mess menu for students</p>
        </div>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Select Day</h3>
            <div className="space-y-1">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedDay === day ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Select Meal</h3>
            <div className="space-y-1">
              {MEALS.map(meal => (
                <button
                  key={meal}
                  onClick={() => handleMealChange(meal)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedMeal === meal ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedDay} - {selectedMeal}</h2>
                <p className="text-sm text-slate-500">Edit the details below</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="e.g., Aloo Paratha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={editData.desc || ''}
                  onChange={e => setEditData({ ...editData, desc: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg h-24"
                  placeholder="Describe the meal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={editData.type || 'Veg'}
                    onChange={e => setEditData({ ...editData, type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    value={editData.time || ''}
                    onChange={e => setEditData({ ...editData, time: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="e.g., 7:30 AM - 9:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.img || ''}
                    onChange={e => setEditData({ ...editData, img: e.target.value })}
                    className="flex-1 p-2 border border-slate-300 rounded-lg"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-300 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-semibold">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
