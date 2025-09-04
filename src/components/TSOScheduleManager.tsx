import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Globe, Calendar, BarChart3, Users, Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const TSOScheduleManager: React.FC = () => {
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({ 
    germany: true, 
    transnetbw: true 
  });
  const [selected, setSelected] = useState('transnetbw-dayahead');

  const tsoData = {
    germany: {
      name: 'Deutschland',
      children: {
        transnetbw: {
          name: 'TransnetBW',
          eic: '10YDE-ENBW-----N',
          region: 'Baden-Württemberg',
          status: 'online',
          children: {
            dayahead: { name: 'Day-Ahead', badge: '8', badgeType: 'yellow' },
            intraday: { name: 'Intraday', badge: '15', badgeType: 'red' },
            matching: { name: 'Matching', badge: '1', badgeType: 'yellow' },
            balancegroups: { name: 'Balance Groups', badge: '32', badgeType: 'green' },
            notifications: { name: 'Notifications', badge: '5', badgeType: 'red' }
          }
        },
        amprion: {
          name: 'Amprion',
          eic: '10YDE-RWENET---I',
          region: 'NRW, Rheinland-Pfalz',
          status: 'online',
          children: {
            dayahead: { name: 'Day-Ahead', badge: '12', badgeType: 'yellow' },
            intraday: { name: 'Intraday', badge: '7', badgeType: 'yellow' }
          }
        }
      }
    }
  };

  const toggleExpanded = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="tso-container">
      {/* Navigation Sidebar */}
      <div className="tso-sidebar">
        <div className="tso-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} />
            <h1 className="tso-title">TSO Schedule Manager</h1>
          </div>
          <p className="tso-subtitle">Fahrplanmanagement System</p>
        </div>

        <div className="tso-nav">
          {Object.entries(tsoData).map(([countryKey, country]) => (
            <div key={countryKey}>
              <div 
                className="nav-item"
                onClick={() => toggleExpanded(countryKey)}
                style={{ fontWeight: '600' }}
              >
                {expanded[countryKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Globe className="nav-icon" style={{ color: '#2563eb' }} />
                <span>{country.name}</span>
              </div>
              
              {expanded[countryKey] && Object.entries(country.children).map(([tsoKey, tso]) => (
                <div key={tsoKey} style={{ marginLeft: '24px' }}>
                  <div 
                    className="nav-item"
                    onClick={() => toggleExpanded(tsoKey)}
                  >
                    {expanded[tsoKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Building2 className="nav-icon" style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>{tso.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{tso.eic}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{tso.region}</div>
                    </div>
                    <CheckCircle size={12} className="status-online" style={{ marginLeft: 'auto' }} />
                  </div>
                  
                  {expanded[tsoKey] && Object.entries(tso.children).map(([funcKey, func]) => (
                    <div 
                      key={funcKey}
                      className={`nav-item ${selected === `${tsoKey}-${funcKey}` ? 'selected' : ''}`}
                      onClick={() => setSelected(`${tsoKey}-${funcKey}`)}
                      style={{ marginLeft: '24px' }}
                    >
                      <Calendar className="nav-icon" />
                      <span className="nav-text">{func.name}</span>
                      {func.badge && (
                        <span className={`nav-badge ${func.badgeType}`}>
                          {func.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="tso-footer">
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>System Status</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TSOs Online:</span>
              <span style={{ fontWeight: '500', color: '#10b981' }}>2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Schedules:</span>
              <span style={{ fontWeight: '500', color: '#2563eb' }}>47</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Items:</span>
              <span style={{ fontWeight: '500', color: '#f59e0b' }}>13</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="tso-main">
        <div className="content-card">
          <div style={{ width: '64px', height: '64px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Calendar size={32} style={{ color: '#2563eb' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            TSO Schedule Management System
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            Ausgewählt: <span style={{ fontWeight: '600', color: '#2563eb' }}>{selected}</span>
          </p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <Calendar size={40} style={{ color: '#2563eb', margin: '0 auto 12px' }} />
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Day-Ahead Management</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Fahrplananmeldung bis 14:30</p>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500', marginTop: '8px' }}>47 aktive Schedules</div>
            </div>
            
            <div className="feature-card">
              <BarChart3 size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Analytics & Reports</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Auswertungen und Statistiken</p>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500', marginTop: '8px' }}>Real-time Monitoring</div>
            </div>
            
            <div className="feature-card">
              <Building2 size={40} style={{ color: '#8b5cf6', margin: '0 auto 12px' }} />
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Multi-TSO Network</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>TransnetBW, Amprion, TenneT, 50Hertz</p>
              <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '500', marginTop: '8px' }}>4 TSOs verbunden</div>
            </div>
          </div>

          <div className="demo-notice">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={20} style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: '500', color: '#1e40af' }}>Live Demo System</span>
            </div>
            <p style={{ fontSize: '14px', color: '#1e40af', margin: '8px 0 0' }}>
              Vollständiges TSO Schedule Management System für Deutschland-konforme Fahrplananmeldungen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TSOScheduleManager;