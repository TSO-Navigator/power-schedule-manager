import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Clock, MessageSquare, RefreshCw } from 'lucide-react';

interface CommunicationMessage {
  id: string;
  timestamp: string;
  direction: 'outbound' | 'inbound';
  messageType: string;
  sender: string;
  receiver: string;
  status: string;
  totalMW: number;
  businessTypes: string[];
  responses: {
    type: string;
    time: string;
    status: string;
    text: string;
  }[];
}

const CommunicationOverview: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [communicationData] = useState<CommunicationMessage[]>([
    {
      id: 'MSG-20240904-001',
      timestamp: '2024-09-04T13:52:15Z',
      direction: 'outbound',
      messageType: 'Schedule',
      sender: 'BG-ENBW-001',
      receiver: 'TransnetBW',
      status: 'acknowledged',
      totalMW: 1245.5,
      businessTypes: ['A01', 'A04', 'A06'],
      responses: [
        { type: 'ACK', time: '13:52:18', status: 'success', text: 'Message fully accepted' }
      ]
    },
    {
      id: 'MSG-20240904-002',
      timestamp: '2024-09-04T13:45:22Z',
      direction: 'outbound',
      messageType: 'Schedule',
      sender: 'BG-SOLAR-15',
      receiver: 'TransnetBW',
      status: 'confirmed',
      totalMW: 85.2,
      businessTypes: ['A01'],
      responses: [
        { type: 'ACK', time: '13:45:24', status: 'success', text: 'Message accepted' },
        { type: 'CNF', time: '13:48:15', status: 'success', text: 'Schedule confirmed' }
      ]
    },
    {
      id: 'MSG-20240904-003',
      timestamp: '2024-09-04T13:38:45Z',
      direction: 'outbound',
      messageType: 'Schedule',
      sender: 'BG-WIND-07',
      receiver: 'TransnetBW',
      status: 'anomaly',
      totalMW: 420.8,
      businessTypes: ['A01', 'A04'],
      responses: [
        { type: 'ACK', time: '13:38:48', status: 'success', text: 'Message accepted' },
        { type: 'ANO', time: '13:42:12', status: 'warning', text: 'Time series not matching' }
      ]
    },
    {
      id: 'MSG-20240904-004',
      timestamp: '2024-09-04T13:35:12Z',
      direction: 'inbound',
      messageType: 'CNF',
      sender: 'Amprion',
      receiver: 'TransnetBW',
      status: 'processed',
      totalMW: 156.0,
      businessTypes: ['A06'],
      responses: []
    },
    {
      id: 'MSG-20240904-005',
      timestamp: '2024-09-04T13:28:33Z',
      direction: 'outbound',
      messageType: 'StatusRequest',
      sender: 'BG-HYDRO-02',
      receiver: 'TransnetBW',
      status: 'responded',
      totalMW: 0,
      businessTypes: [],
      responses: [
        { type: 'CNF', time: '13:28:35', status: 'success', text: 'Status provided' }
      ]
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'acknowledged':
      case 'confirmed':
      case 'processed':
      case 'responded':
        return <CheckCircle size={16} className="status-online" />;
      case 'anomaly':
        return <AlertTriangle size={16} className="status-warning" />;
      default:
        return <Clock size={16} className="status-active" />;
    }
  };

  const stats = {
    total: communicationData.length,
    outbound: communicationData.filter(m => m.direction === 'outbound').length,
    inbound: communicationData.filter(m => m.direction === 'inbound').length,
    pending: 0,
    anomalies: communicationData.filter(m => m.status === 'anomaly').length
  };

  return (
    <div className="comm-container">
      {/* Header */}
      <div className="comm-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="comm-title">Communication Overview</h1>
            <p className="comm-subtitle">Real-time tracking of schedule messages and responses</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="message-time">
              {formatTime(currentTime.toISOString())}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`auto-refresh-btn ${!autoRefresh ? 'inactive' : ''}`}
            >
              <RefreshCw size={16} />
              Auto Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="comm-stats">
        <div className="comm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>Total Messages</p>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#1f2937' }}>{stats.total}</p>
            </div>
            <MessageSquare size={36} style={{ color: '#3b82f6' }} />
          </div>
        </div>

        <div className="comm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>Outbound</p>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#3b82f6' }}>{stats.outbound}</p>
            </div>
            <ArrowRight size={36} style={{ color: '#3b82f6' }} />
          </div>
        </div>

        <div className="comm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>Inbound</p>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#10b981' }}>{stats.inbound}</p>
            </div>
            <ArrowLeft size={36} style={{ color: '#10b981' }} />
          </div>
        </div>

        <div className="comm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>Anomalies</p>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#ef4444' }}>{stats.anomalies}</p>
            </div>
            <AlertTriangle size={36} style={{ color: '#ef4444' }} />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="comm-messages">
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1f2937' }}>Message Timeline</h2>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {communicationData.map((message) => (
            <div key={message.id} className="comm-message">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {/* Direction Icon */}
                <div style={{ 
                  marginTop: '4px', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  background: message.direction === 'outbound' ? '#dbeafe' : '#dcfce7' 
                }}>
                  {message.direction === 'outbound' ? 
                    <ArrowRight size={18} style={{ color: '#3b82f6' }} /> : 
                    <ArrowLeft size={18} style={{ color: '#10b981' }} />
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div className="message-header">
                    <h3 className="message-id">{message.id}</h3>
                    <span className={`status-badge status-${message.status}`}>{message.status}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    <div style={{ marginLeft: 'auto' }}>
                      {getStatusIcon(message.status)}
                    </div>
                  </div>

                  <div className="message-grid">
                    <div className="message-field">
                      <span className="message-label">Type:</span>
                      <span className="message-value">{message.messageType}</span>
                    </div>
                    <div className="message-field">
                      <span className="message-label">Route:</span>
                      <span className="message-value">{message.sender} → {message.receiver}</span>
                    </div>
                    {message.totalMW > 0 && (
                      <div className="message-field">
                        <span className="message-label">MW:</span>
                        <span className="message-value">{message.totalMW.toLocaleString('de-DE')}</span>
                      </div>
                    )}
                  </div>

                  {/* Business Types */}
                  {message.businessTypes.length > 0 && (
                    <div className="business-types-container">
                      <div className="business-types-label">Business Types</div>
                      <div>
                        {message.businessTypes.map((type) => (
                          <span key={type} className="business-type">{type}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Responses */}
                  {message.responses.length > 0 && (
                    <div className="response-chain">
                      <div className="response-header">
                        <span>Responses</span>
                        <span className="response-count">{message.responses.length}</span>
                      </div>
                      {message.responses.map((response, index) => (
                        <div key={index} className="response-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              color: '#3b82f6',
                              background: '#dbeafe',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {response.type}
                            </span>
                            <span className="message-time">{response.time}</span>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
                              {response.text}
                            </span>
                          </div>
                          {getStatusIcon(response.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunicationOverview;