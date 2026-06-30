import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('uffi_cookie_consent');
    if (!consent) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('uffi_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('uffi_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 print:hidden"
        >
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-[#d4af37]/20 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-300 text-sm leading-relaxed">
              <h4 className="text-white font-bold mb-1">We value your privacy</h4>
              <p>
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
               <Button 
                 onClick={handleDecline} 
                 variant="outline" 
                 className="border-gray-700 text-gray-300 hover:bg-gray-800"
               >
                 Decline
               </Button>
               <Button 
                 onClick={handleAccept}
                 className="bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold"
               >
                 Accept All
               </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;