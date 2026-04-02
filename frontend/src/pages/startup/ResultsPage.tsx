import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useStartupStore } from '../../store/startupStore';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Download } from 'lucide-react';
import { Accordion } from '../../components/ui/Accordion';
import { JsonRenderer } from '../../components/ui/JsonRenderer';

const AGENTS = [
  { id: 'market_research', label: 'Market Research', emoji: '📊' },
  { id: 'competitor_analysis', label: 'Competitor Analysis', emoji: '🔍' },
  { id: 'positioning', label: 'Brand Positioning', emoji: '🎯' },
  { id: 'landing_page', label: 'Landing Page', emoji: '🌐' },
  { id: 'ad_copy', label: 'Ad Copy Generation', emoji: '📢' },
  { id: 'email_marketing', label: 'Email Outreach', emoji: '✉️' }
];

export const ResultsPage = () => {
  const { id } = useParams();
  const { status, results, updateResults } = useStartupStore();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/startup/${id}/status`);
        updateResults(data.status, data.results);
        if (data.status === 'completed') clearInterval(interval);
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, updateResults]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/startup/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'StartupPitch.docx';
      if (contentDisposition) {
         const match = contentDisposition.match(/filename="?([^"]+)"?/);
         if (match && match[1]) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download document");
    } finally {
      setDownloading(false);
    }
  };

  const progressCount = Object.keys(results).length;
  const progressPercent = Math.min((progressCount / AGENTS.length) * 100, 100);
  const isComplete = status === 'completed' || progressPercent === 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="glass p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
           <div>
             <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
               {isComplete ? <CheckCircle2 className="text-emerald-500 w-8 h-8" /> : <Loader2 className="text-blue-500 animate-spin w-8 h-8" />}
               {isComplete ? 'AI Generation Complete!' : 'AI Agents Work in Progress...'}
             </h2>
             <p className="text-slate-500 mt-1">Our specialized agents are building your startup assets.</p>
           </div>
           
           {isComplete && (
             <button
               onClick={handleDownload}
               disabled={downloading}
               className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-75 whitespace-nowrap"
             >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {downloading ? "Preparing Document..." : "Download DOCX"}
             </button>
           )}
        </div>
        
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-2">
           <motion.div 
             className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
             initial={{ width: 0 }}
             animate={{ width: `${progressPercent}%` }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
           />
        </div>
        <div className="text-right text-sm font-bold text-slate-400 mb-8">{Math.round(progressPercent)}% Compiled</div>
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
           {AGENTS.map((agent) => {
             const isDone = !!results[agent.id];
             return (
               <div key={agent.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all duration-500 ${isDone ? 'bg-blue-50/50 border-blue-200 shadow-sm scale-105' : 'bg-transparent border-slate-100 opacity-60'}`}>
                 <span className="text-xl">{agent.emoji}</span>
                 <span className="text-xs font-semibold text-slate-700 leading-tight">{agent.label}</span>
               </div>
             )
           })}
        </div>
      </div>

      <div className="space-y-4">
        {AGENTS.map((agent) => {
           const data = results[agent.id];
           if (!data) return null;
           
           return (
             <motion.div key={agent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
               <Accordion title={<><span className="text-2xl">{agent.emoji}</span> {agent.label}</>} defaultOpen={agent.id === 'market_research'}>
                 <JsonRenderer data={data} />
               </Accordion>
             </motion.div>
           );
        })}
      </div>
    </div>
  );
};
