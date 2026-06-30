import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Play, Plus, Trash2, Edit, ExternalLink, 
  Search, Settings, DollarSign, FileText, Video, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

function AdminView() {
  const [activeTab, setActiveTab] = useState('contents');
  
  return (
    <div className="h-full flex flex-col">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$12,450</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
           <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1,240</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
           <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Content Pieces</h3>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">48</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
           <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
            <Settings className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Operational</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('contents')}
          className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'contents' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Content Management
          {activeTab === 'contents' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          User Management
          {activeTab === 'users' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'contents' ? <ContentManager key="content-manager" /> : <UserManager key="user-manager" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ContentManager() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stripe_link: '',
    content_url: '',
    thumbnail_url: ''
  });

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('contents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load contents" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('contents').insert({
        ...formData,
        price: parseFloat(formData.price)
      });

      if (error) throw error;

      toast({ title: "Success", description: "Content created successfully" });
      setDialogOpen(false);
      setFormData({ title: '', description: '', price: '', stripe_link: '', content_url: '', thumbnail_url: '' });
      fetchContents();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    
    try {
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Content removed" });
      fetchContents();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete content" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search content..." className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Premium Content</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input 
                    type="number" 
                    required 
                    step="0.01"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-500 font-semibold">Stripe Payment Link</Label>
                <Input 
                  required 
                  placeholder="https://buy.stripe.com/..." 
                  value={formData.stripe_link} 
                  onChange={e => setFormData({...formData, stripe_link: e.target.value})} 
                  className="dark:bg-gray-800 dark:border-gray-700 border-blue-200"
                />
                <p className="text-xs text-gray-500">Paste the payment link from your Stripe Dashboard here.</p>
              </div>

              <div className="space-y-2">
                 <Label className="text-green-500 font-semibold">Content URL (Unlockable)</Label>
                 <Input 
                   required
                   placeholder="https://drive.google.com/... or Video URL"
                   value={formData.content_url}
                   onChange={e => setFormData({...formData, content_url: e.target.value})}
                   className="dark:bg-gray-800 dark:border-gray-700 border-green-200"
                 />
                 <p className="text-xs text-gray-500">The content the user gets after paying.</p>
              </div>

              <div className="space-y-2">
                 <Label>Thumbnail Image URL</Label>
                 <Input 
                   placeholder="https://images.unsplash.com/..."
                   value={formData.thumbnail_url}
                   onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                   className="dark:bg-gray-800 dark:border-gray-700"
                 />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create Content</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {contents.map(content => (
            <motion.div 
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden group hover:border-blue-500 transition-colors"
            >
               <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {content.thumbnail_url ? (
                    <img src={content.thumbnail_url} alt={content.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                       <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold backdrop-blur-sm">
                    ${content.price}
                  </div>
               </div>
               <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{content.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{content.description || "No description provided."}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500">
                           <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(content.id)} className="h-8 w-8 text-gray-400 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                     <a 
                        href={content.content_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                     >
                        View Source <ExternalLink className="w-3 h-3" />
                     </a>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('profiles').select('*');
      setUsers(data || []);
    }
    loadUsers();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
       <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
             <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
             {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                   <td className="py-3 px-4 text-gray-900 dark:text-white">{u.name || 'N/A'}</td>
                   <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                   <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                         {u.role}
                      </span>
                   </td>
                   <td className="py-3 px-4 text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );
}

export default AdminView;