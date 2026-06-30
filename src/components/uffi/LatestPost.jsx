import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LatestPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await fetch('https://uffiservice.com/wp-json/wp/v2/posts?per_page=1&_embed');
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setPost(data[0]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching latest post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const FallbackContent = () => (
    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center">
         <Newspaper className="w-12 h-12 text-gray-300" />
      </div>
      <div className="flex-1">
         <div className="flex items-center gap-3 mb-3">
             <span className="bg-[#FF6600]/10 text-[#FF6600] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#FF6600]/20">
                Uffi Service Blog
             </span>
         </div>
         <h3 className="text-[20px] leading-[1.4] font-bold text-[#222] mb-3">
           Uffi Service Blog
         </h3>
         <p className="text-gray-600 text-sm mb-6 leading-relaxed">
           Maintenance, renovations, and property services in London.
         </p>
         <Button 
            onClick={() => window.open('https://uffiservice.com', '_blank')}
            className="bg-[#FF6600] hover:bg-[#e55c00] text-white font-medium px-6 py-2 h-auto rounded-lg transition-all duration-300 shadow-lg shadow-orange-900/10 flex items-center gap-2 group-hover:translate-x-1 border-none"
         >
            Explore our Blog <ArrowRight className="w-4 h-4" />
         </Button>
      </div>
    </div>
  );

  return (
    <section className="py-12 px-4 bg-[#0a0a0a] relative border-b border-white/5">
      <div className="max-w-4xl mx-auto">
        <div id="latest-post-uffi" className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-[#e0e0e0] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
               <Loader2 className="w-8 h-8 text-[#FF6600] animate-spin mb-4" />
               <p className="text-gray-500 font-medium">Loading latest news...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-[25px] rounded-xl border border-[#e0e0e0] shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:border-[#FF6600]/30 transition-all group relative overflow-hidden"
            >
              {error || !post ? (
                <FallbackContent />
              ) : (
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                   {post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] ? (
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                         <img 
                            src={post._embedded['wp:featuredmedia'][0].source_url} 
                            alt={post.title.rendered} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         />
                      </div>
                   ) : (
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-100 flex items-center justify-center">
                         <Newspaper className="w-12 h-12 text-gray-300" />
                      </div>
                   )}

                   <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <span className="bg-[#FF6600]/10 text-[#FF6600] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#FF6600]/20">
                               Latest News
                            </span>
                         </div>
                         <div className="text-gray-400 text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.date)}
                         </div>
                      </div>

                      <h3 
                        className="text-[20px] leading-[1.4] font-bold text-[#222] mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      
                      <div 
                        className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />

                      <Button 
                        onClick={() => window.open(post.link, '_blank')}
                        className="bg-[#FF6600] hover:bg-[#e55c00] text-white font-medium px-6 py-2 h-auto rounded-lg transition-all duration-300 shadow-lg shadow-orange-900/10 flex items-center gap-2 group-hover:translate-x-1 border-none"
                      >
                        Read Full Article <ArrowRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestPost;