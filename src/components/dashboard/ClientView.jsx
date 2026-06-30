import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, ShoppingBag, Play, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

function ClientView() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkPurchaseStatus();
    fetchData();
  }, []);

  // Hack: Check for purchase success via URL
  const checkPurchaseStatus = async () => {
    const pendingId = sessionStorage.getItem('pending_purchase_content_id');
    
    // Simple heuristic: if we have a pending ID and the URL looks like a return...
    // In production, a webhook would handle this securely.
    // Here we trust the return for the UX demo.
    if (pendingId) {
       setProcessing(true);
       try {
         // Verify we haven't already processed it
         const { data: existing } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', pendingId)
            .single();

         if (!existing) {
            const { error } = await supabase.from('purchases').insert({
               user_id: user.id,
               content_id: pendingId,
               amount: 0, // We don't know amount here without webhook
               status: 'completed',
               created_at: new Date()
            });
            
            if (!error) {
               toast({
                  title: "Purchase Confirmed!",
                  description: "Your content has been unlocked successfully.",
                  className: "bg-green-600 text-white border-none"
               });
            }
         }
       } catch (e) {
         console.error("Purchase processing error", e);
       } finally {
         sessionStorage.removeItem('pending_purchase_content_id');
         setProcessing(false);
         // Refresh data to show unlocked content
         fetchData();
       }
    }
  };

  const fetchData = async () => {
    try {
      const [contentRes, purchaseRes] = await Promise.all([
        supabase.from('contents').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('content_id').eq('user_id', user.id)
      ]);

      setContents(contentRes.data || []);
      setPurchases(purchaseRes.data?.map(p => p.content_id) || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (content) => {
    if (!content.stripe_link) {
      toast({ variant: "destructive", title: "Unavailable", description: "Payment link not configured." });
      return;
    }
    
    sessionStorage.setItem('pending_purchase_content_id', content.id);
    window.location.href = content.stripe_link;
  };

  if (loading || processing) {
    return (
      <div className="flex items-center justify-center h-64">
         <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-500">Loading your content library...</p>
         </div>
      </div>
    );
  }

  return (
    <div>
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Content Library</h1>
          <p className="text-gray-500 dark:text-gray-400">Premium guides, videos, and resources to grow your business.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map(content => {
             const isUnlocked = purchases.includes(content.id);
             
             return (
               <motion.div 
                 key={content.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={`
                    relative overflow-hidden rounded-2xl border transition-all duration-300
                    ${isUnlocked 
                       ? 'bg-white dark:bg-gray-900 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                       : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-90 hover:opacity-100'
                    }
                 `}
               >
                  {/* Thumbnail Area */}
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 relative group">
                     {content.thumbnail_url ? (
                        <img src={content.thumbnail_url} alt={content.title} className={`w-full h-full object-cover ${!isUnlocked && 'grayscale contrast-75'}`} />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                     )}
                     
                     {/* Overlay Status */}
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity group-hover:bg-black/50">
                        {isUnlocked ? (
                           <div className="bg-green-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transform group-hover:scale-110 transition-transform">
                              <Unlock className="w-4 h-4" /> Unlocked
                           </div>
                        ) : (
                           <div className="bg-gray-900/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                              <Lock className="w-4 h-4" /> Premium
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="p-6">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{content.title}</h3>
                        {!isUnlocked && (
                           <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">
                              ${content.price}
                           </span>
                        )}
                     </div>
                     
                     <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3">{content.description}</p>

                     {isUnlocked ? (
                        <Button 
                           className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                           onClick={() => window.open(content.content_url, '_blank')}
                        >
                           <Play className="w-4 h-4 mr-2" /> Access Content
                        </Button>
                     ) : (
                        <Button 
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                           onClick={() => handleBuy(content)}
                        >
                           <ShoppingBag className="w-4 h-4 mr-2" /> Unlock Now
                        </Button>
                     )}
                  </div>
               </motion.div>
             );
          })}
       </div>
    </div>
  );
}

export default ClientView;