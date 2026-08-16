import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Trash2, 
  X,
  Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    enablePushNotifications 
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">
              Notifikasi & Peringatan Absensi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Enable Push */}
        <div className="my-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
          <div className="text-xs text-indigo-800 font-medium">
            Aktifkan Push Notifikasi Browser saat absen tepat waktu
          </div>
          <button
            onClick={enablePushNotifications}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all whitespace-nowrap ml-2"
          >
            Izinkan
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada notifikasi saat ini.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-2xl border transition-all text-xs cursor-pointer ${
                  notif.read
                    ? 'bg-slate-50 border-slate-100 text-slate-500'
                    : 'bg-white border-slate-200 shadow-xs text-slate-900'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {notif.type === 'SUCCESS' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'WARNING' && (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'INFO' && (
                    <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={clearAllNotifications}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Semua</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
