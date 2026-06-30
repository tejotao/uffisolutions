import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

const Opportunities = () => {
  const { t, getTranslationObject } = useLanguage();
  const { toast } = useToast();
  const jobs = getTranslationObject('opportunities.jobs') || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: t('opportunities.form.success'),
      description: "We'll review your application and get back to you soon.",
      className: "bg-green-500 border-none text-white"
    });
    
    setIsSubmitting(false);
    e.target.reset();
  };

  const inputClasses = "bg-gray-900/50 border-gray-800 text-white mt-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all";
  const labelClasses = "text-gray-300 text-sm font-medium";

  return (
    <>
      <Helmet>
        <title>{t('nav.opportunities')} - UffiSolutions</title>
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Hero */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
              <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-white">{t('opportunities.title')}</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('opportunities.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16 px-4 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {jobs.map((job, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.type}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-6">{job.description}</p>
                  
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, ridx) => (
                        <li key={ridx} className="flex items-center text-gray-400 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border-0"
                  >
                    {t('opportunities.apply_title')} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="application-form" className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">{t('opportunities.apply_title')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className={labelClasses}>{t('opportunities.form.name')}</Label>
                    <Input id="name" required className={inputClasses} />
                  </div>
                  <div>
                    <Label htmlFor="email" className={labelClasses}>{t('opportunities.form.email')}</Label>
                    <Input id="email" type="email" required className={inputClasses} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" className={labelClasses}>{t('opportunities.form.role')}</Label>
                  <div className="relative">
                    <select id="role" className="w-full mt-2 bg-gray-900/50 border border-gray-800 text-white rounded-md px-3 py-2 h-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer">
                      <option value="">Select a role...</option>
                      {jobs.map((job, i) => (
                        <option key={i} value={job.title}>{job.title}</option>
                      ))}
                      <option value="other">Other / General Application</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolio" className={labelClasses}>{t('opportunities.form.portfolio')}</Label>
                  <Input id="portfolio" placeholder="https://..." className={inputClasses} />
                </div>

                <div>
                  <Label htmlFor="cover" className={labelClasses}>{t('opportunities.form.cover_letter')}</Label>
                  <textarea id="cover" rows={4} className="w-full mt-2 bg-gray-900/50 border border-gray-800 text-white rounded-md px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                    </span>
                  ) : (
                    t('opportunities.form.submit')
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Opportunities;