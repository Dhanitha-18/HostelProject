import React, { useState, useRef, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { socket } from '../../lib/socket';
import { 
  Send, ShieldAlert, Heart, Plus, ShoppingBag, 
  Search, Pin, Tag, MessageSquare, Megaphone, Users, HelpCircle, Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  usn: string;
  roomNo: string;
  message: string;
  time: string;
  isSelf: boolean;
  likes: number;
  likedByMe?: boolean;
  price?: string;
  categoryTag?: string;
  imgUrl?: string;
  groupId?: string;
}

interface Channel {
  id: string;
  name: string;
  iconName: string;
  desc: string;
  badge?: string;
}

const getIcon = (name: string) => {
  switch (name) {
    case 'Megaphone': return <Megaphone className="w-5 h-5" />;
    case 'Users': return <Users className="w-5 h-5" />;
    case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
    case 'HelpCircle': return <HelpCircle className="w-5 h-5" />;
    case 'Sparkles': return <Sparkles className="w-5 h-5" />;
    case 'MessageSquare':
    default: return <MessageSquare className="w-5 h-5" />;
  }
};

export const SocialConnect: React.FC = () => {
  const { student, hostel } = usePayment();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('announcements');
  const [channelMessages, setChannelMessages] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    fetch('http://localhost:5000/api/social-groups')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((g: any) => ({
            id: g.id,
            name: g.name,
            iconName: g.iconName || 'MessageSquare',
            desc: g.desc,
            badge: g.badge
          }));
          setChannels([{ id: 'announcements', name: 'admin-announcements', iconName: 'Megaphone', desc: 'Official notices', badge: 'New' }, ...formatted]);
        } else {
          setChannels([{ id: 'announcements', name: 'admin-announcements', iconName: 'Megaphone', desc: 'Official notices', badge: 'New' }]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!activeChannelId) return;
    if (activeChannelId === 'announcements') {
      fetch('http://localhost:5000/api/social')
        .then(res => res.json())
        .then(data => {
          const adminPosts: ChatMessage[] = data.map((d: any) => ({
            id: d.id,
            senderName: d.author,
            usn: 'ADMIN',
            roomNo: 'Office',
            message: `${d.title}\n\n${d.content}`,
            time: new Date(d.createdAt).toLocaleDateString(),
            isSelf: false,
            likes: 0,
            categoryTag: d.type
          }));
          setChannelMessages(prev => ({ ...prev, [activeChannelId]: adminPosts }));
        })
        .catch(err => console.error(err));
    } else {
      fetch(`http://localhost:5000/api/chat-messages/${activeChannelId}`)
        .then(res => res.json())
        .then(data => {
          const msgs = data.map((m: any) => ({
            ...m,
            isSelf: m.usn === student.usn
          }));
          setChannelMessages(prev => ({ ...prev, [activeChannelId]: msgs }));
        })
        .catch(err => console.error(err));
    }
  }, [activeChannelId, student.usn]);

  useEffect(() => {
    const handleNewMsg = (msg: any) => {
      setChannelMessages(prev => {
        const msgs = prev[msg.groupId] || [];
        if (msgs.find(m => m.id === msg.id)) return prev;
        return { ...prev, [msg.groupId]: [...msgs, { ...msg, isSelf: msg.usn === student.usn }] };
      });
    };
    const handleUpdate = () => {
      if (activeChannelId === 'announcements') {
        fetch('http://localhost:5000/api/social')
          .then(res => res.json())
          .then(data => {
            const adminPosts: ChatMessage[] = data.map((d: any) => ({
              id: d.id,
              senderName: d.author,
              usn: 'ADMIN',
              roomNo: 'Office',
              message: `${d.title}\n\n${d.content}`,
              time: new Date(d.createdAt).toLocaleDateString(),
              isSelf: false,
              likes: 0,
              categoryTag: d.type
            }));
            setChannelMessages(prev => ({ ...prev, announcements: adminPosts }));
          })
          .catch(err => console.error(err));
      }
    };
    socket.on('new_chat_message', handleNewMsg);
    socket.on('data_updated', handleUpdate);
    return () => {
      socket.off('new_chat_message', handleNewMsg);
      socket.off('data_updated', handleUpdate);
    };
  }, [activeChannelId, student.usn]);

  const [inputText, setInputText] = useState('');
  const [searchResident, setSearchResident] = useState('');

  const [pinnedMessages, setPinnedMessages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('hostel_pinned_messages');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedResident, setSelectedResident] = useState<{ name: string; usn: string; room: string; status: string } | null>(null);
  const [interestedItem, setInterestedItem] = useState<ChatMessage | null>(null);
  const [interestOfferMessage, setInterestOfferMessage] = useState('Hey! Is this item still available? I would like to buy it.');
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Books');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImagePreset, setItemImagePreset] = useState<string>('none');

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || { id: '', name: '', iconName: 'MessageSquare', desc: '' };
  const currentMessages = channelMessages[activeChannelId] || [];

  useEffect(() => {
    try {
      localStorage.setItem('hostel_pinned_messages', JSON.stringify(pinnedMessages));
    } catch (e) {
      console.error(e);
    }
  }, [pinnedMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages, activeChannelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || activeChannelId === 'announcements') return;

    const newMessage = {
      groupId: activeChannelId,
      senderName: student.name,
      usn: student.usn,
      roomNo: hostel ? `Room ${hostel.room}` : 'Room 304',
      message: inputText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      likes: 0
    };

    try {
      await fetch('http://localhost:5000/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      setInputText('');
    } catch (err) {}
  };

  const handleLikeMessage = (msgId: string) => {
    setChannelMessages(prev => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map(m => {
        if (m.id === msgId) {
          const isLiked = m.likedByMe;
          return {
            ...m,
            likes: isLiked ? m.likes - 1 : m.likes + 1,
            likedByMe: !isLiked
          };
        }
        return m;
      })
    }));
  };

  const handlePinMessage = (text: string) => {
    setPinnedMessages(prev => ({
      ...prev,
      [activeChannelId]: text
    }));
  };

  const handleBuyInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestedItem || activeChannelId === 'announcements') return;

    const inquiryMessage = {
      groupId: activeChannelId,
      senderName: student.name,
      usn: student.usn,
      roomNo: hostel ? `Room ${hostel.room}` : 'Room 304',
      message: `[INQUIRY] Hey ${interestedItem.senderName}, I am interested in your listing '${interestedItem.message.split(':')[0]}'. ${interestOfferMessage}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      likes: 0
    };

    try {
      await fetch('http://localhost:5000/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryMessage)
      });
      setInterestedItem(null);
      setInterestOfferMessage('Hey! Is this item still available? I would like to buy it.');
    } catch (err) {}
  };

  const handlePostMarketplaceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemPrice || activeChannelId === 'announcements') return;

    let finalImgUrl: string | undefined = undefined;
    if (itemImagePreset === 'book') finalImgUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';
    if (itemImagePreset === 'kettle') finalImgUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';
    if (itemImagePreset === 'chair') finalImgUrl = 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80';
    if (itemImagePreset === 'cycle') finalImgUrl = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80';

    const newListing = {
      groupId: activeChannelId,
      senderName: student.name,
      usn: student.usn,
      roomNo: hostel ? `Room ${hostel.room}` : 'Room 304',
      message: `${itemTitle}: ${itemDesc}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      likes: 1,
      price: `₹${itemPrice}`,
      categoryTag: itemCategory,
      imgUrl: finalImgUrl
    };

    try {
      await fetch('http://localhost:5000/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      setItemTitle('');
      setItemPrice('');
      setItemDesc('');
      setItemImagePreset('none');
      setShowMarketplaceModal(false);
    } catch (err) {}
  };

  const residentsList = [
    { name: 'Anish Deshpande', usn: '1BY24CS015', room: 'Room 204', status: 'Online' },
    { name: 'Rohan Sharma', usn: '1BY23IS048', room: 'Room 310', status: 'Online' },
    { name: 'Sanjay Kumar', usn: '1BY24EC102', room: 'Room 108', status: 'In Gym' },
    { name: 'Kavya Nair', usn: '1BY23EC088', room: 'Room 402', status: 'Online' },
    { name: 'Neha Reddy', usn: '1BY24AI012', room: 'Room 212', status: 'Studying' }
  ].filter(r => r.name.toLowerCase().includes(searchResident.toLowerCase()) || r.room.toLowerCase().includes(searchResident.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <HeroBanner 
        image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
        title="Hostel Lounge & Social Connect"
        subtitle="Multi-channel resident chatroom, marketplace, study groups, lost & found"
      />

      {/* Mobile Channel Selector Pills */}
      <div className="flex lg:hidden overflow-x-auto gap-2 p-2 bg-white border border-border rounded-xl shadow-soft">
        {channels.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannelId(ch.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeChannelId === ch.id 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {ch.name}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-4 h-[650px] sm:h-[700px]">
        
        {/* Left Column: Channels */}
        <div className="hidden lg:flex flex-col justify-between border-r border-border bg-slate-50/70 p-4 text-xs font-semibold overflow-y-auto">
          
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">Hostel Channels</span>
              <div className="space-y-1">
                {channels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                      activeChannelId === ch.id 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5">{getIcon(ch.iconName)}</div>
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.badge && (
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase ${
                        activeChannelId === ch.id ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                      }`}>
                        {ch.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">Resident Directory</span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by room..."
                  value={searchResident}
                  onChange={e => setSearchResident(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg pl-8 pr-2 py-1.5 text-[10.5px] font-semibold outline-none"
                />
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {residentsList.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedResident({ name: res.name, room: res.room, usn: res.usn, status: res.status })}
                    className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg text-[10.5px] cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{res.name}</span>
                      <span className="text-[9px] text-text-muted font-mono">{res.room}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" title={res.status} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1.5 border border-slate-800 mt-4">
            <div className="flex gap-1.5 items-center text-warning font-black text-[9px] uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Community Conduct</span>
            </div>
            <p className="text-[9.5px] text-slate-300 leading-relaxed font-medium">
              Respect all residents. Spamming, fake items, or harassment results in immediate portal suspension.
            </p>
          </div>

        </div>

        {/* Right Chat Area */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full bg-white min-h-0">
          
          <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  {activeChannel.name}
                </h3>
                <p className="text-[10px] text-text-muted font-semibold">{activeChannel.desc}</p>
              </div>
            </div>

            {activeChannelId !== 'announcements' && (
              <button
                onClick={() => setShowMarketplaceModal(true)}
                className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Post Item for Sale</span>
              </button>
            )}
          </div>

          {pinnedMessages[activeChannelId] && (
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{pinnedMessages[activeChannelId]}</span>
              </div>
              <button
                onClick={() => setPinnedMessages(prev => ({ ...prev, [activeChannelId]: '' }))}
                className="text-text-muted hover:text-slate-800 text-[10px]"
              >
                Clear Pin
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {currentMessages.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${msg.isSelf ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div 
                  onClick={() => setSelectedResident({ name: msg.senderName, room: msg.roomNo, usn: msg.usn, status: 'Active' })}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center font-black text-xs shrink-0 uppercase shadow-sm cursor-pointer hover:scale-105 transition-transform ${
                    msg.isSelf 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {msg.senderName.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-baseline gap-2 text-[10px] font-bold text-text-muted ${msg.isSelf ? 'justify-end' : ''}`}>
                    <span 
                      onClick={() => setSelectedResident({ name: msg.senderName, room: msg.roomNo, usn: msg.usn, status: 'Active' })}
                      className="text-slate-900 font-black cursor-pointer hover:underline"
                    >
                      {msg.senderName}
                    </span>
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{msg.roomNo}</span>
                    <span className="font-mono text-[9px]">{msg.time}</span>
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm border space-y-2 text-left ${
                    msg.isSelf 
                      ? 'bg-primary/5 text-slate-800 border-primary/20 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-border rounded-tl-none'
                  }`}>
                    
                    {msg.price && (
                      <div className="flex items-center justify-between bg-slate-900 text-white p-2 rounded-xl text-xs font-bold mb-1">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-warning" />
                          <span>FOR SALE</span>
                        </div>
                        <span className="font-mono text-success text-sm font-black">{msg.price}</span>
                      </div>
                    )}

                    <p>{msg.message}</p>

                    {msg.imgUrl && (
                      <div className="rounded-xl overflow-hidden max-w-xs border border-border">
                        <img src={msg.imgUrl} alt="Listing" className="w-full h-36 object-cover" />
                      </div>
                    )}

                    <div className={`flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg transition-colors ${
                            msg.likedByMe 
                              ? 'text-danger bg-danger/10' 
                              : 'text-text-muted hover:text-danger'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${msg.likedByMe ? 'fill-danger' : ''}`} />
                          <span>{msg.likes}</span>
                        </button>

                        <button
                          onClick={() => handlePinMessage(msg.message)}
                          className="text-text-muted hover:text-primary font-bold px-1.5 py-0.5 rounded-lg transition-colors text-[9px]"
                          title="Pin as channel notice"
                        >
                          Pin
                        </button>

                        {msg.price && !msg.isSelf && (
                          <button
                            onClick={() => setInterestedItem(msg)}
                            className="bg-primary text-white font-bold px-2 py-0.5 rounded-lg transition-colors text-[9px]"
                          >
                            Buy/Inquire
                          </button>
                        )}
                      </div>

                      <span className="text-[9.5px] text-text-muted font-mono">
                        {msg.categoryTag ? `#${msg.categoryTag}` : ''}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendMessage} className="h-16 border-t border-border flex items-center px-4 gap-3 bg-white shrink-0">
            <input 
              type="text" 
              placeholder={activeChannelId === 'announcements' ? "Only Admins can post announcements..." : `Message #${activeChannel.name}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={activeChannelId === 'announcements'}
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            
            <button
              type="submit"
              disabled={activeChannelId === 'announcements'}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

      {showMarketplaceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">Post Item for Sale / Exchange</h3>
                <p className="text-xs text-text-muted font-semibold mt-0.5">Visible to all hostel residents in #{activeChannel.name}</p>
              </div>
              <button 
                onClick={() => setShowMarketplaceModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostMarketplaceItem} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Study Lamp / Physics Textbook"
                  value={itemTitle}
                  onChange={e => setItemTitle(e.target.value)}
                  required
                  className="w-full border border-border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="350"
                    value={itemPrice}
                    onChange={e => setItemPrice(e.target.value)}
                    required
                    className="w-full border border-border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    className="w-full border border-border rounded-xl p-2.5 font-bold bg-white outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Books">Textbooks & Notes</option>
                    <option value="Appliance">Electronics & Kettle</option>
                    <option value="Furniture">Chair / Mattress</option>
                    <option value="Sports">Cycle / Badminton</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Item Description</label>
                <textarea
                  rows={3}
                  placeholder="Mention age, condition, and room contact details..."
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  className="w-full border border-border rounded-xl p-2.5 font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Publish Listing</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedResident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">Resident Profile</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">Verified hostel resident card</p>
              </div>
              <button 
                onClick={() => setSelectedResident(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3 pt-2 text-xs font-semibold">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl mx-auto border border-primary/20 shadow-sm uppercase">
                {selectedResident.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{selectedResident.name}</h4>
                <span className="text-[10px] text-text-muted font-mono">{selectedResident.usn}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-left">
                <div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Room Number</span>
                  <span className="text-slate-800 font-bold">{selectedResident.room}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Status / Activity</span>
                  <span className="text-success font-black flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                    {selectedResident.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {interestedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">Express Purchase Interest</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">An inquiry message will be sent in #{activeChannel.name}</p>
              </div>
              <button 
                onClick={() => setInterestedItem(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl space-y-1.5 text-xs text-left">
              <div><strong>Seller:</strong> {interestedItem.senderName} ({interestedItem.roomNo})</div>
              <div><strong>Item:</strong> {interestedItem.message.split(':')[0]}</div>
              <div><strong>Price:</strong> <span className="font-mono text-success font-black">{interestedItem.price}</span></div>
            </div>

            <form onSubmit={handleBuyInquirySubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Your Message / Offer Details</label>
                <textarea
                  rows={2}
                  value={interestOfferMessage}
                  onChange={e => setInterestOfferMessage(e.target.value)}
                  className="w-full border border-border rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Buy Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
