import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Users, Settings, LogOut, 
  Moon, Sun, Globe, Search, Bell, Menu, X, Box 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

// Import provided management components
import AddClientDialog from '@/components/admin/AddClientDialog';
import AddPackageDialog from '@/components/admin/AddPackageDialog';
import ClientsTable from '@/components/admin/ClientsTable';
import InventoryTable from '@/components/admin/InventoryTable';
import { calculateBaseFee, calculateStorageFee } from '@/lib/feeCalculations';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg mb-1
      ${active 
        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
  >
    <Icon className="w-5 h-5 min-w-[20px]" />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-none"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </motion.div>
);

function ClientDashboard() {
  const { user, signOut } = useAuth();
  const { language, changeLanguage } = useLanguage();
  
  const [activeSection, setActiveSection] = useState('overview');
  const [isDark, setIsDark] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data State
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Clients (Profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) throw profilesError;

      // 2. Fetch Packages with Client data
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*, client:profiles(name, suite)')
        .order('created_at', { ascending: false });

      if (packagesError) throw packagesError;

      // Process Packages for UI
      const processedPackages = packagesData.map(pkg => ({
        id: pkg.id,
        tracking: pkg.tracking_number,
        weight: pkg.weight_kg,
        status: pkg.status,
        receivedDate: pkg.received_date,
        clientName: pkg.client?.name || 'Unknown',
        suite: pkg.client?.suite || pkg.client?.suite_number || 'N/A',
        shippingCost: pkg.shipping_cost,
        finalTracking: pkg.final_tracking_number,
        baseFee: calculateBaseFee(pkg.weight_kg),
        storageFee: calculateStorageFee(pkg.received_date, pkg.status),
        extraServices: pkg.extra_services || []
      }));

      setClients(profilesData || []);
      setPackages(processedPackages || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ 
        variant: "destructive", 
        title: "Error Loading Data", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddClient = async (formData) => {
    try {
      // In a real app, this would create a user in Supabase Auth + Profile
      // For this demo, we'll just insert into profiles if RLS allows, or mock it
      // Note: Usually creating a user requires admin auth API or sign up
      
      toast({ title: "Processing", description: "Adding client to database..." });
      
      // Mocking auth ID generation for demo since we can't create auth users from client easily without edge function
      const mockId = crypto.randomUUID(); 
      
      const { error } = await supabase.from('profiles').insert({
        id: mockId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'client',
        suite: `UK-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate suite
        created_at: new Date(),
        updated_at: new Date()
      });

      if (error) throw error;

      toast({ title: "Success", description: "Client added successfully" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not add client. RLS policy may restrict this." });
    }
  };

  const handleAddPackage = async (pkgData) => {
    try {
      const { error } = await supabase.from('packages').insert({
        client_id: pkgData.clientId,
        tracking_number: pkgData.tracking,
        weight_kg: pkgData.weight,
        items_description: pkgData.items,
        status: 'Recebido',
        received_date: pkgData.receivedDate,
        created_at: new Date()
      });

      if (error) throw error;

      toast({ title: "Success", description: "Package registered successfully" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleUpdatePackage = async (updatedPkg) => {
    try {
      const { error } = await supabase.from('packages').update({
        status: updatedPkg.status,
        weight_kg: updatedPkg.weight,
        shipping_cost: updatedPkg.shippingCost,
        final_tracking_number: updatedPkg.finalTracking,
        extra_services: updatedPkg.extraServices
      }).eq('id', updatedPkg.id);

      if (error) throw error;

      toast({ title: "Success", description: "Package updated" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  // Styles for Dark/Light mode
  const themeClass = isDark ? 'dark' : '';
  
  return (
    <div className={themeClass}>
      <Helmet><title>Admin Dashboard - UffiSolutions</title></Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans flex overflow-hidden">
        
        {/* Sidebar */}
        <aside 
          className={`fixed md:relative z-40 h-full bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 
            ${isSidebarCollapsed ? 'w-20' : 'w-72'} 
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800/50">
              <Box className="w-8 h-8 text-blue-600 mr-3" />
              {!isSidebarCollapsed && (
                <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                  Uffi<span className="text-blue-600">Admin</span>
                </span>
              )}
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Overview" 
                active={activeSection === 'overview'} 
                onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem 
                icon={Package} 
                label="Manage Items" 
                active={activeSection === 'items'} 
                onClick={() => { setActiveSection('items'); setMobileMenuOpen(false); }}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem 
                icon={Users} 
                label="Manage Users" 
                active={activeSection === 'users'} 
                onClick={() => { setActiveSection('users'); setMobileMenuOpen(false); }}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem 
                icon={Settings} 
                label="Settings" 
                active={activeSection === 'settings'} 
                onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
                collapsed={isSidebarCollapsed}
              />
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800/50">
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 mb-4'}`}>
                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.[0] || 'A'}
                 </div>
                 {!isSidebarCollapsed && (
                    <div className="overflow-hidden">
                       <p className="font-medium truncate text-sm">{user?.name || 'Admin User'}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                 )}
              </div>
              <Button 
                variant="outline" 
                className={`w-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 ${isSidebarCollapsed ? 'px-0' : ''}`}
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                {!isSidebarCollapsed && <span className="ml-2">Logout</span>}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
          
          {/* Top Header */}
          <header className="h-20 bg-white/80 dark:bg-[#111111]/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 md:px-8">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
              <button 
                className="hidden md:block p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeSection.replace('-', ' ')}</h1>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Language Toggle - Mock functionality */}
              <button 
                 onClick={() => changeLanguage(language === 'en' ? 'pt' : 'en')}
                 className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                 <Globe className="w-5 h-5" />
                 <span className="hidden md:inline">{language === 'en' ? 'EN' : 'PT'}</span>
              </button>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2" />
              
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
             <AnimatePresence mode="wait">
                {activeSection === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <StatCard title="Total Packages" value={packages.length} icon={Package} color="bg-blue-500" />
                       <StatCard title="Active Clients" value={clients.length} icon={Users} color="bg-purple-500" />
                       <StatCard title="Pending Actions" value={packages.filter(p => p.status === 'Recebido').length} icon={Bell} color="bg-orange-500" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                       <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recent Inventory</h3>
                       <InventoryTable packages={packages.slice(0, 5)} clients={clients} onUpdate={handleUpdatePackage} />
                       <div className="mt-4 text-center">
                          <Button variant="link" onClick={() => setActiveSection('items')}>View All Items</Button>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'items' && (
                  <motion.div 
                    key="items"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
                          <p className="text-gray-500 dark:text-gray-400">Track and manage client packages</p>
                       </div>
                       <AddPackageDialog clients={clients} onAdd={handleAddPackage} />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
                       <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
                          <Search className="w-5 h-5 text-gray-400" />
                          <Input placeholder="Search tracking, client..." className="max-w-md bg-transparent border-none focus-visible:ring-0 px-0 h-auto" />
                       </div>
                       <InventoryTable packages={packages} clients={clients} onUpdate={handleUpdatePackage} />
                    </div>
                  </motion.div>
                )}

                {activeSection === 'users' && (
                  <motion.div 
                    key="users"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Client Directory</h2>
                          <p className="text-gray-500 dark:text-gray-400">Manage registered users and profiles</p>
                       </div>
                       <AddClientDialog onAdd={handleAddClient} />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                       <ClientsTable clients={clients} />
                    </div>
                  </motion.div>
                )}

                {activeSection === 'settings' && (
                   <motion.div 
                    key="settings"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-[60vh] text-gray-500"
                   >
                      <div className="text-center">
                         <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
                         <h3 className="text-xl font-bold mb-2">System Settings</h3>
                         <p>Configuration options coming soon.</p>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;