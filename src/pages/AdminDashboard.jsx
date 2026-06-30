import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, Plus, Trash2, 
  Shield, LogOut, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const GuideManager = () => {
  const [guides, setGuides] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newGuide, setNewGuide] = useState({ 
    title: '', description: '', price: 0, category: 'Guide', 
    thumbnail_url: '', is_published: true 
  });

  const fetchGuides = async () => {
    const { data } = await supabase.from('guides').select('*').order('created_at', { ascending: false });
    setGuides(data || []);
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from('guides').insert(newGuide);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "Guide created successfully" });
      setIsOpen(false);
      fetchGuides();
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('guides').delete().eq('id', id);
    fetchGuides();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Content Library</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Content</Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader><DialogTitle>Add New Guide/Manual</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newGuide.title} onChange={e => setNewGuide({...newGuide, title: e.target.value})} className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  value={newGuide.category} 
                  onChange={e => setNewGuide({...newGuide, category: e.target.value})}
                  className="w-full bg-gray-800 border-gray-700 rounded-md p-2 text-sm"
                >
                  <option>Guide</option>
                  <option>Manual</option>
                  <option>Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" value={newGuide.price} onChange={e => setNewGuide({...newGuide, price: e.target.value})} className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input value={newGuide.thumbnail_url} onChange={e => setNewGuide({...newGuide, thumbnail_url: e.target.value})} className="bg-gray-800 border-gray-700" />
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600">Create Content</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map(guide => (
          <div key={guide.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
            <img src={guide.thumbnail_url || "https://via.placeholder.com/300"} alt={guide.title} className="w-full h-32 object-cover rounded-lg mb-3 bg-gray-800" />
            <h3 className="font-bold text-lg text-white">{guide.title}</h3>
            <div className="flex justify-between text-sm text-gray-400 mt-1 mb-4">
              <span>{guide.category}</span>
              <span>${guide.price}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(guide.id)} className="mt-auto">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserManager = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAuth = async (id, currentStatus) => {
    await supabase.from('profiles').update({ authorized: !currentStatus }).eq('id', id);
    toast({ title: "Updated", description: `User access ${!currentStatus ? 'granted' : 'revoked'}.` });
    fetchUsers();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
          <tr>
            <th className="p-4">User</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-800/50">
              <td className="p-4">
                <div className="font-medium text-white">{user.name || 'Unknown'}</div>
                <div className="text-xs">{user.id}</div>
              </td>
              <td className="p-4">
                <div>{user.email}</div>
                <div>{user.phone}</div>
              </td>
              <td className="p-4">
                {user.authorized ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" /> Authorized
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                    <XCircle className="w-3 h-3 mr-1" /> Restricted
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <Button 
                  size="sm" 
                  variant={user.authorized ? "destructive" : "default"}
                  onClick={() => toggleAuth(user.id, user.authorized)}
                  className={!user.authorized ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {user.authorized ? "Revoke Access" : "Authorize"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function AdminDashboard() {
  const { signOut } = useAuth();
  
  return (
    <>
      <Helmet><title>Admin Command - UffiSolutions</title></Helmet>
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              <span className="font-bold text-lg tracking-tight">Uffi<span className="text-red-500">Admin</span></span>
            </div>
            <Button variant="ghost" onClick={signOut} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="content" className="space-y-8">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="content" className="data-[state=active]:bg-gray-800">Content Management</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gray-800">User Access</TabsTrigger>
            </TabsList>

            <TabsContent value="content"><GuideManager /></TabsContent>
            <TabsContent value="users"><UserManager /></TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;