import React, { useState } from 'react';
import { Home, MessageSquare, Edit3, BarChart3, Settings } from 'lucide-react';
import TSOScheduleManager from './TSOScheduleManager';
import CommunicationOverview from './CommunicationOverview';
import ScheduleEditor from './ScheduleEditor';
import '../styles/components/MainNavigation.css';

const MainNavigation: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', name: 'Scheduling Overview', icon: <Home size={20} />, description: 'Hauptübersicht' },
    { id: 'communication', name: 'Communication', icon: <MessageSquare size={20} />, description: 'Message Tracking' },
    { id: 'editor', name: 'Schedule Editor', icon: <Edit3 size={20} />, description: 'Fahrplan bearbeiten' },
    { id: 'settings', name: 'Settings', icon: <Settings size={20} />, description: 'Einstellungen' },
  ];

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return <TSOScheduleManager />;
      case 'communication':
        return <CommunicationOverview />;
      case 'editor':
        return <ScheduleEditor />;
      case 'settings':
        return <SettingsPlaceholder />;
      default:
        return <TSOScheduleManager />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{ 
        background: 'linear-gradient(to right, #1e40af, #3b82f6)', 
        color: 'white', 
        padding: '0 24px',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '48px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Home size={18} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              Power Schedule Manager
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== item.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Live Demo System
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderContent()}
      </div>
    </div>
  );
};

const SettingsPlaceholder: React.FC = () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
    <div style={{ textAlign: 'center', maxWidth: '500px', padding: '48px' }}>
      <Settings size={64} style={{ color: '#64748b', margin: '0 auto 24px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
        System Settings
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
        Konfiguration der TSO-Verbindungen, Benutzereinstellungen und 
        System-Parameter für optimale Performance.
      </p>
      <div style={{ 
        background: '#f1f5f9', 
        border: '1px solid #cbd5e1', 
        borderRadius: '8px', 
        padding: '16px',
        fontSize: '14px',
        color: '#334155'
      }}>
        ⚙️ <strong>Features:</strong> TSO-Config, User Management, System Health
      </div>
    </div>
  </div>
);

export default MainNavigation;