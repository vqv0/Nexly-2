import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { postsManager } from '../utils/postsManager';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ShieldAlert, 
  Trash2, 
  Eye, 
  User, 
  Calendar, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Report {
  id: string;
  postId: string;
  reason: string;
  timestamp: string;
  reporterId?: string;
  postSnapshot: any;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadReports();

    const handleUpdate = () => loadReports();
    window.addEventListener('nexly-reports-update', handleUpdate);
    return () => window.removeEventListener('nexly-reports-update', handleUpdate);
  }, [navigate]);

  const loadReports = () => {
    const data = postsManager.getReportedPosts();
    setReports(data.reverse()); // Show newest first
  };

  const handleDeletePost = (postId: string, reportId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta publicación y cerrar el reporte?')) {
      postsManager.deletePost(postId);
      postsManager.deleteReport(reportId);
      toast.success('Publicación eliminada y reporte cerrado');
      if (selectedReport?.id === reportId) setSelectedReport(null);
    }
  };

  const handleDismissReport = (reportId: string) => {
    postsManager.deleteReport(reportId);
    toast.success('Reporte descartado');
    if (selectedReport?.id === reportId) setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      <AdminNavbar />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 expensive-bg">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CENTRO DE <span className="text-red-500">REPORTES</span></h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">
            Gestión y moderación de contenido reportado por usuarios
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-5 space-y-4">
            <AnimatePresence mode="popLayout">
              {reports.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No hay reportes pendientes</p>
                </motion.div>
              ) : (
                reports.map((report) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedReport(report)}
                    className={`cursor-pointer group p-4 rounded-2xl border transition-all duration-300 ${
                      selectedReport?.id === report.id
                        ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/10'
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-white/5 px-2 py-1 rounded-md text-gray-500 group-hover:text-white transition-colors">
                        ID: {report.postId.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="font-bold text-sm mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
                      {report.reason}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-bold border-b border-white/10">{report.postSnapshot.userName}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Report Detail */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedReport ? (
                <motion.div
                  key={selectedReport.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="sticky top-24"
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-3xl overflow-hidden rounded-3xl border-t-red-500/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-1">
                            Detalles del <span className="text-red-500">Reporte</span>
                          </CardTitle>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auditoría de Moderación</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="rounded-xl font-bold uppercase tracking-tight text-[10px] h-9"
                            onClick={() => handleDeletePost(selectedReport.postId, selectedReport.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Eliminar Post
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-xl font-bold uppercase tracking-tight text-[10px] h-9 border-white/10 hover:bg-white/5"
                            onClick={() => handleDismissReport(selectedReport.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-2 text-emerald-500" />
                            Descartar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Motivo del Reporte</span>
                          </div>
                          <p className="font-bold text-sm text-red-200">{selectedReport.reason}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Fecha y Hora</span>
                          </div>
                          <p className="font-bold text-sm break-all">
                            {new Date(selectedReport.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8">
                      <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/5 relative group">
                        <div className="absolute top-4 right-4 text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded-md text-gray-400">Snapshot Original</div>
                        
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 font-black text-xl italic text-purple-400">
                            {selectedReport.postSnapshot.userName?.[0]}
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-tight">{selectedReport.postSnapshot.userName}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Publicado: {selectedReport.postSnapshot.time}</p>
                          </div>
                        </div>

                        <p className="text-lg leading-relaxed mb-6 font-medium">
                          {selectedReport.postSnapshot.content}
                        </p>

                        {selectedReport.postSnapshot.image && (
                          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                              src={selectedReport.postSnapshot.image} 
                              alt="Reported content" 
                              className="w-full h-auto object-cover max-h-[400px]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Reportado por</p>
                            <p className="text-xs font-black uppercase tracking-tight">ID: {selectedReport.reporterId || 'Usuario Anónimo'}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/10"
                          onClick={() => selectedReport.reporterId && navigate(`/admin/users?user=${selectedReport.reporterId}`)}
                        >
                          Ver Perfil <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10 p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Selecciona un reporte</h3>
                  <p className="text-gray-500 text-sm max-w-xs font-medium">
                    Haz clic en un reporte de la lista para ver los detalles del contenido y tomar acciones de moderación.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
