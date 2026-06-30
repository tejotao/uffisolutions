import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, FileText, File, Link as LinkIcon, Download, ExternalLink, Headphones as Headset, BookOpen, PenTool } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ContentItem({ item }) {
  const [showPreview, setShowPreview] = useState(false);

  const getDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const getGoogleDriveEmbedUrl = (url) => {
    const id = getDriveId(url);
    if (!id) return url;
    return `https://drive.google.com/file/d/${id}/preview`;
  };

  const getGoogleDriveDownloadUrl = (url) => {
    const id = getDriveId(url);
    if (!id) return url;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  };

  const handleNoUrl = () => {
    toast({
      title: "Conteúdo Indisponível",
      description: "Em breve! O conteúdo está sendo preparado. 🚀"
    });
  };

  if (!item.url && item.type !== 'text') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[200px]"
      >
        <div className="text-gray-500 mb-4 opacity-50">
          <BookOpen size={48} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
        <p className="text-[#f59e0b] font-medium">Em breve! O conteúdo está sendo preparado. 🚀</p>
      </motion.div>
    );
  }

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <div 
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: item.url || item.content_text || '' }}
          />
        );
      
      case 'video':
      case 'audio':
        return (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#2a2a2a] shadow-lg">
            <iframe 
              src={item.url.includes('drive.google.com') ? getGoogleDriveEmbedUrl(item.url) : item.url} 
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
              title={item.title}
            ></iframe>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <File size={18} />
                {showPreview ? 'Ocultar PDF' : 'Visualizar PDF'}
              </button>
              {item.url.includes('drive.google.com') && (
                <a 
                  href={getGoogleDriveDownloadUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  <Download size={18} />
                  Baixar
                </a>
              )}
            </div>
            
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative w-full aspect-[1/1.4] bg-black rounded-xl overflow-hidden border border-[#2a2a2a] shadow-lg"
                >
                  <iframe 
                    src={getGoogleDriveEmbedUrl(item.url)} 
                    className="absolute top-0 left-0 w-full h-full"
                    allowFullScreen
                    title={item.title}
                  ></iframe>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'notebook':
      case 'exercise':
      case 'link':
        return (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white px-6 py-3 rounded-xl font-bold transition-colors border border-[#3a3a3a]"
          >
            Acessar {item.type === 'notebook' ? 'NotebookLM' : item.type === 'exercise' ? 'Exercício' : 'Link'}
            <ExternalLink size={18} className="text-[#f59e0b]" />
          </a>
        );

      default:
        return <p className="text-gray-400">Tipo de conteúdo não suportado.</p>;
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'video': return <PlayCircle className="text-blue-400" size={24} />;
      case 'audio': return <Headset className="text-purple-400" size={24} />;
      case 'pdf': return <File className="text-red-400" size={24} />;
      case 'notebook': return <BookOpen className="text-emerald-400" size={24} />;
      case 'exercise': return <PenTool className="text-amber-400" size={24} />;
      case 'text': return <FileText className="text-gray-400" size={24} />;
      case 'link': return <LinkIcon className="text-cyan-400" size={24} />;
      default: return <FileText className="text-gray-400" size={24} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl mb-6 shadow-md"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-[#2a2a2a] p-3 rounded-xl">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {item.title}
            {item.is_preview && (
              <span className="text-[10px] uppercase bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                Preview
              </span>
            )}
          </h3>
          {item.description && (
            <p className="text-gray-400 mt-1 text-sm">{item.description}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
        {renderContent()}
      </div>
    </motion.div>
  );
}