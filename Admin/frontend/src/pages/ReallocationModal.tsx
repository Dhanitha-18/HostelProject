import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

interface ReallocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocationId: string;
  gender: 'FEMALE' | 'MALE';
  studentName: string;
}

export default function ReallocationModal({ isOpen, onClose, allocationId, gender, studentName }: ReallocationModalProps) {
  const queryClient = useQueryClient();
  const adminName = useAuthStore((state) => state.name) || 'Super Admin';
  const [blockId, setBlockId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [bedId, setBedId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const { data: blocks = [], isLoading: loadingBlocks } = useQuery({
    queryKey: ['blocks'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/blocks');
      if (!res.ok) throw new Error('Failed to fetch blocks');
      return res.json();
    },
    enabled: isOpen
  });

  const reallocateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:5000/api/reallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocationId, newBedId: bedId, adminName, reason })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Reallocation failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success(`Successfully reallocated bed for ${studentName}!`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Reallocation failed');
    }
  });

  const handleReallocate = () => {
    if (!bedId) return toast.warning('Please select a new bed');
    reallocateMutation.mutate();
  };

  const selectedBlock = blocks.find((b: any) => b.id === blockId);
  const selectedRoom = selectedBlock?.rooms?.find((r: any) => r.id === roomId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reallocate Student</DialogTitle>
          <DialogDescription>
            Move <b>{studentName}</b> to a new bed. The old bed will be automatically freed.
          </DialogDescription>
        </DialogHeader>
        
        {loadingBlocks ? (
           <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reason for Reallocation (Optional)</Label>
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Room maintenance, dispute..."
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>New Block (Filtered by Gender: {gender})</Label>
              <Select value={blockId} onValueChange={(val) => { setBlockId(val); setRoomId(''); setBedId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.filter((b: any) => b.gender === gender).map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>New Room</Label>
              <Select value={roomId} onValueChange={(val) => { setRoomId(val); setBedId(''); }} disabled={!blockId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {selectedBlock?.rooms?.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      Floor {r.floor} - Room {r.roomNo} ({r.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>New Bed</Label>
              <Select value={bedId} onValueChange={setBedId} disabled={!roomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an available bed" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRoom?.beds?.filter((b: any) => b.status === 'AVAILABLE').map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>Bed {b.bedNo}</SelectItem>
                  ))}
                  {selectedRoom?.beds?.filter((b: any) => b.status === 'AVAILABLE').length === 0 && (
                    <SelectItem value="none" disabled>No beds available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={handleReallocate}
              disabled={!bedId || reallocateMutation.isPending}
            >
              {reallocateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              Confirm Reallocation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
