
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          
          {/* Column 1: Company Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <img 
                src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/e257475657c0a2becd0112e6e5cfeb2a.png" 
                alt="UffiSolutions Logo" 
                className="h-6 sm:h-8 w-auto object-contain"
              />
              <h3 className="text-2xl font-black text-white tracking-tight">
                Uffi<span className="text-[#f59e0b]">Solutions</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              {t('messages.trade_name')}
            </p>
            <a 
              href="mailto:us@uffisphere.com" 
              className="inline-block text-gray-400 hover:text-[#f59e0b] transition-colors text-xs mb-4"
            >
              us@uffisphere.com
            </a>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Company Number: 16827147</p>
              <p>Registered in England and Wales</p>
            </div>
          </div>

          {/* Column 2: Partners */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('messages.partners')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://hubukbox.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">
                  HubUKBox
                </a>
              </li>
              <li>
                <a href="https://tjsnitram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">
                  TJSnitram<sup>®</sup>
                </a>
              </li>
              <li>
                <a href="https://uffisphere.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">
                  Uffisphere
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="text-center sm:text-left lg:text-right">
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('messages.legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/termos" className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">
                  {t('messages.terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-gray-400 hover:text-[#f59e0b] transition-colors text-sm">
                  {t('messages.privacy')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-800/50 pt-8 flex items-center justify-center text-center">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {currentYear} UffiSolutions. {t('messages.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
