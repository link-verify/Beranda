import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { StoreQrDisplay } from './components/StoreQrDisplay';
import { EmployeeManagement } from './components/EmployeeManagement';
import { AttendanceReports } from './components/AttendanceReports';
import { StoreLocationSettings } from './components/StoreLocationSettings';
import { EmployeeMobileView } from './components/EmployeeMobileView';
import { NotificationModal } from './components/NotificationModal';

function MainAppContent() {
  const { role } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kiosk' | 'employees' | 'reports' | 'location'>('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Universal Navbar with Quick Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 pb-12">
        {role === 'ADMIN' ? (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                onGoToKiosk={() => setActiveTab('kiosk')}
                onGoToReports={() => setActiveTab('reports')}
                onGoToEmployees={() => setActiveTab('employees')}
                onGoToLocation={() => setActiveTab('location')}
              />
            )}
            {activeTab === 'kiosk' && <StoreQrDisplay />}
            {activeTab === 'employees' && <EmployeeManagement />}
            {activeTab === 'reports' && <AttendanceReports />}
            {activeTab === 'location' && <StoreLocationSettings />}
          </>
        ) : (
          <EmployeeMobileView />
        )}
      </main>

      {/* Notification Drawer / Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
