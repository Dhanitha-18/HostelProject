import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';

export default function FeedbackControl() {
  const { data: feedbackList, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/feedback');
      if (!res.ok) throw new Error('Failed to fetch feedback');
      return res.json();
    }
  });

  if (isLoading) return <div className="text-slate-500">Loading feedback...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Student Feedback</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbackList?.map((feedback: any) => (
          <div key={feedback.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{feedback.studentName}</h3>
                <p className="text-xs text-slate-500">{feedback.usn}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>
            <p className="text-slate-600 text-sm">{feedback.message}</p>
            <p className="text-xs text-slate-400 mt-4 text-right">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {feedbackList?.length === 0 && <p className="text-slate-500 col-span-full">No feedback received yet.</p>}
      </div>
    </div>
  );
}
