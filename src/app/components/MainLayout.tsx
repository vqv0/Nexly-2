import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { motion, AnimatePresence } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex bg-[#050505] min-h-screen selection:bg-blue-500/30">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden lg:block flex-shrink-0"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-1 min-h-screen relative pb-24 lg:pb-0 transition-all duration-300`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`hidden lg:flex fixed top-5 z-[60] p-2.5 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all duration-300 backdrop-blur-xl shadow-lg ${
            sidebarOpen ? 'left-[248px]' : 'left-4'
          }`}
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-8 pt-6 lg:pt-8"
        >
          <Outlet />
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
