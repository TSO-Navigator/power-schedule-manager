import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Zap, Users, MapPin, Calendar, Clock, ChevronRight, Building2, Search, Filter, Globe } from 'lucide-react';
import '../styles/components/ScheduleEditor.css';

// Shared Types
interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  tsos: TSO[];
}

interface TSO {
  id: string;
  name: string;
  eicCode: string;
  countryId: string;
  balanceGroups: BalanceGroup[];
}

interface BalanceGroup {
  id: string;
  name: string;
  eicCode: string;
  responsibleParty: string;
  tsoId: string;
}

interface SchedulePosition {
  id: string;
  positionId: string;
  businessType: string;
  inParty: string;
  outParty: string;
  inArea: string;
  outArea: string;
  measurementUnit: string;
  intervals: number[];
  isActive: boolean;
}

interface Schedule {
  id: string;
  messageId: string;
  version: string;
  creationDate: string;
  sender: string;
  receiver: string;
  inDomain: string;
  outDomain: string;
  processType: string;
  businessType: string;
  schedulePeriodStart: string;
  schedulePeriodEnd: string;
  positions: SchedulePosition[];
}

interface ScheduleEditorProps {
  onScheduleSave?: (schedule: Schedule) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ onScheduleSave }) => {
  // State Management
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedTSO, setSelectedTSO] = useState<TSO | null>(null);
  const [selectedBalanceGroup, setSelectedBalanceGroup] = useState<BalanceGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'validation'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['germany']));
  const [expandedTSOs, setExpandedTSOs] = useState<Set<string>>(new Set());
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  
  // Schedule Storage (per Balance Group)
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({});

  // Mock Data Service
  const mockTSOService = {
    getCountries: (): Country[] => [
      {
        id: 'germany',
        name: 'Deutschland',
        code: 'DE',
        flag: '🇩🇪',
        tsos: [
          {
            id: 'amprion',
            name: 'Amprion',
            eicCode: '10X1001A1001A83F',
            countryId: 'germany',
            balanceGroups: [
              { id: 'amprion-bg1', name: 'Stadtwerke Düsseldorf', eicCode: '10X1001A1001A01N', responsibleParty: 'Stadtwerke Düsseldorf AG', tsoId: 'amprion' },
              { id: 'amprion-bg2', name: 'RWE Power', eicCode: '10X1001A1001A02M', responsibleParty: 'RWE Power AG', tsoId: 'amprion' },
              { id: 'amprion-bg3', name: 'STEAG Energy Services', eicCode: '10X1001A1001A03L', responsibleParty: 'STEAG Energy Services GmbH', tsoId: 'amprion' }
            ]
          },
          {
            id: 'tennet',
            name: 'TenneT',
            eicCode: '10X1001A1001A82H',
            countryId: 'germany',
            balanceGroups: [
              { id: 'tennet-bg1', name: 'E.ON Energy Trading', eicCode: '10X1001A1001A04K', responsibleParty: 'E.ON Energy Trading SE', tsoId: 'tennet' },
              { id: 'tennet-bg2', name: 'Vattenfall Europe', eicCode: '10X1001A1001A05J', responsibleParty: 'Vattenfall Europe Generation AG', tsoId: 'tennet' },
              { id: 'tennet-bg3', name: 'LEAG', eicCode: '10X1001A1001A06I', responsibleParty: 'LEAG Lausitz Energie AG', tsoId: 'tennet' }
            ]
          },
          {
            id: '50hertz',
            name: '50Hertz',
            eicCode: '10X1001A1001A74G',
            countryId: 'germany',
            balanceGroups: [
              { id: '50hertz-bg1', name: 'GASAG', eicCode: '10X1001A1001A07H', responsibleParty: 'GASAG AG', tsoId: '50hertz' },
              { id: '50hertz-bg2', name: 'Berliner Stadtwerke', eicCode: '10X1001A1001A08G', responsibleParty: 'Berliner Stadtwerke GmbH', tsoId: '50hertz' },
              { id: '50hertz-bg3', name: 'ENGIE Deutschland', eicCode: '10X1001A1001A09F', responsibleParty: 'ENGIE Deutschland AG', tsoId: '50hertz' }
            ]
          },
          {
            id: 'transnetbw',
            name: 'TransnetBW',
            eicCode: '10X1001A1001A63L',
            countryId: 'germany',
            balanceGroups: [
              { id: 'transnetbw-bg1', name: 'EnBW Trading', eicCode: '10X1001A1001A10A', responsibleParty: 'EnBW Trading GmbH', tsoId: 'transnetbw' },
              { id: 'transnetbw-bg2', name: 'MVV Energie', eicCode: '10X1001A1001A11Z', responsibleParty: 'MVV Energie AG', tsoId: 'transnetbw' },
              { id: 'transnetbw-bg3', name: 'Stadtwerke Stuttgart', eicCode: '10X1001A1001A12Y', responsibleParty: 'Stadtwerke Stuttgart GmbH', tsoId: 'transnetbw' }
            ]
          }
        ]
      },
      {
        id: 'austria',
        name: 'Österreich',
        code: 'AT',
        flag: '🇦🇹',
        tsos: [
          {
            id: 'apg',
            name: 'Austrian Power Grid',
            eicCode: '10X1001A1001A59C',
            countryId: 'austria',
            balanceGroups: [
              { id: 'apg-bg1', name: 'Verbund Trading', eicCode: '10X1001A1001A13X', responsibleParty: 'Verbund Trading AG', tsoId: 'apg' },
              { id: 'apg-bg2', name: 'Wien Energie', eicCode: '10X1001A1001A14W', responsibleParty: 'Wien Energie GmbH', tsoId: 'apg' },
              { id: 'apg-bg3', name: 'Hydro Balance', eicCode: '10X1001A1001A15V', responsibleParty: 'Austrian Hydro Power AG', tsoId: 'apg' }
            ]
          }
        ]
      },
      {
        id: 'switzerland',
        name: 'Schweiz',
        code: 'CH',
        flag: '🇨🇭',
        tsos: [
          {
            id: 'swissgrid',
            name: 'Swissgrid',
            eicCode: '10X1001A1001A39I',
            countryId: 'switzerland',
            balanceGroups: [
              { id: 'swissgrid-bg1', name: 'Axpo Trading', eicCode: '10X1001A1001A16U', responsibleParty: 'Axpo Trading AG', tsoId: 'swissgrid' },
              { id: 'swissgrid-bg2', name: 'BKW Energie', eicCode: '10X1001A1001A17T', responsibleParty: 'BKW Energie AG', tsoId: 'swissgrid' },
              { id: 'swissgrid-bg3', name: 'Alpine Balance', eicCode: '10X1001A1001A18S', responsibleParty: 'Swiss Alpine Power AG', tsoId: 'swissgrid' }
            ]
          }
        ]
      }
    ]
  };

  const [countries] = useState<Country[]>(mockTSOService.getCountries());

  // localStorage functions
  const saveSchedulesToStorage = useCallback((scheduleData: Record<string, Schedule>) => {
    try {
      localStorage.setItem('tso-schedules', JSON.stringify(scheduleData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  const loadSchedulesFromStorage = useCallback((): Record<string, Schedule> => {
    try {
      const stored = localStorage.getItem('tso-schedules');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return {};
    }
  }, []);

  const clearAllSchedules = useCallback(() => {
    setSchedules({});
    localStorage.removeItem('tso-schedules');
  }, []);

  // Load schedules from localStorage on component mount
  useEffect(() => {
    const loadedSchedules = loadSchedulesFromStorage();
    setSchedules(loadedSchedules);
  }, [loadSchedulesFromStorage]);

  // Save schedules to localStorage whenever schedules change
  useEffect(() => {
    saveSchedulesToStorage(schedules);
  }, [schedules, saveSchedulesToStorage]);

  // Helper function to create empty schedule
  const createEmptySchedule = (): Schedule => {
    const now = new Date();
    const scheduleDate = new Date(now);
    scheduleDate.setHours(0, 0, 0, 0);
    
    return {
      id: `schedule_${Date.now()}`,
      messageId: `SCH_${Date.now()}`,
      version: '1',
      creationDate: now.toISOString(),
      sender: selectedBalanceGroup?.eicCode || '',
      receiver: selectedTSO?.eicCode || '',
      inDomain: selectedCountry?.code || '',
      outDomain: selectedCountry?.code || '',
      processType: 'A01',
      businessType: 'A01',
      schedulePeriodStart: scheduleDate.toISOString(),
      schedulePeriodEnd: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      positions: []
    };
  };

  // Get current schedule for selected Balance Group
  const getCurrentSchedule = useCallback((): Schedule => {
    if (!selectedBalanceGroup) {
      return createEmptySchedule();
    }

    const existing = schedules[selectedBalanceGroup.id];
    if (existing) {
      return existing;
    }

    // Create new schedule for this balance group
    const newSchedule = createEmptySchedule();
    return newSchedule;
  }, [selectedBalanceGroup, schedules, selectedTSO, selectedCountry]);

  // Update current schedule
  const updateCurrentSchedule = useCallback((updates: Partial<Schedule>) => {
    if (!selectedBalanceGroup) return;

    setSchedules(prev => ({
      ...prev,
      [selectedBalanceGroup.id]: {
        ...getCurrentSchedule(),
        ...updates
      }
    }));
  }, [selectedBalanceGroup, getCurrentSchedule]);

  // Filter functions
  const filterBalanceGroups = (tso: TSO): BalanceGroup[] => {
    if (!searchTerm) return tso.balanceGroups;
    return tso.balanceGroups.filter(bg =>
      bg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bg.responsibleParty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bg.eicCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterTSOs = (country: Country): TSO[] => {
    if (!searchTerm) return country.tsos;
    return country.tsos.filter(tso =>
      tso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tso.eicCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tso.balanceGroups.some(bg => 
        bg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bg.responsibleParty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filterCountries = (): Country[] => {
    if (!searchTerm) return countries;
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.tsos.some(tso => 
        tso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tso.balanceGroups.some(bg => 
          bg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bg.responsibleParty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  };

  // Event Handlers
  const handleBalanceGroupSelect = useCallback((balanceGroup: BalanceGroup, tso: TSO, country: Country) => {
    setSelectedBalanceGroup(balanceGroup);
    setSelectedTSO(tso);
    setSelectedCountry(country);
    setExpandedPositions(new Set()); // Reset expanded positions when switching balance groups
    
    console.log('=== DEBUG ===');
    console.log('Selected Balance Group:', balanceGroup.id, balanceGroup.name);
    console.log('All schedules keys:', Object.keys(schedules));
    console.log('Current schedule positions:', schedules[balanceGroup.id]?.positions?.length || 0);
    console.log('localStorage content:', localStorage.getItem('tso-schedules'));
  }, [schedules]);

  const toggleCountryExpanded = (countryId: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryId)) {
        newSet.delete(countryId);
      } else {
        newSet.add(countryId);
      }
      return newSet;
    });
  };

  const toggleTSOExpanded = (tsoId: string) => {
    setExpandedTSOs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tsoId)) {
        newSet.delete(tsoId);
      } else {
        newSet.add(tsoId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allCountryIds = countries.map(c => c.id);
    const allTSOIds = countries.flatMap(c => c.tsos.map(t => t.id));
    setExpandedCountries(new Set(allCountryIds));
    setExpandedTSOs(new Set(allTSOIds));
  };

  const collapseAll = () => {
    setExpandedCountries(new Set());
    setExpandedTSOs(new Set());
  };

  // Position Management
  const addPosition = useCallback(() => {
    const currentSchedule = getCurrentSchedule();
    const newPosition: SchedulePosition = {
      id: `pos_${Date.now()}`,
      positionId: `POS_${currentSchedule.positions.length + 1}`,
      businessType: 'A01',
      inParty: selectedBalanceGroup?.eicCode || '',
      outParty: selectedTSO?.eicCode || '',
      inArea: selectedCountry?.code || '',
      outArea: selectedCountry?.code || '',
      measurementUnit: 'MAW',
      intervals: new Array(96).fill(0),
      isActive: true
    };

    updateCurrentSchedule({
      positions: [...currentSchedule.positions, newPosition]
    });

    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      newSet.add(newPosition.id);
      return newSet;
    });
  }, [getCurrentSchedule, updateCurrentSchedule, selectedBalanceGroup, selectedTSO, selectedCountry]);

  const duplicatePosition = useCallback((positionId: string) => {
    const currentSchedule = getCurrentSchedule();
    const originalPosition = currentSchedule.positions.find(p => p.id === positionId);
    if (!originalPosition) return;

    const newPosition: SchedulePosition = {
      ...originalPosition,
      id: `pos_${Date.now()}`,
      positionId: `${originalPosition.positionId}_COPY`
    };

    updateCurrentSchedule({
      positions: [...currentSchedule.positions, newPosition]
    });

    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      newSet.add(newPosition.id);
      return newSet;
    });
  }, [getCurrentSchedule, updateCurrentSchedule]);

  const removePosition = useCallback((positionId: string) => {
    const currentSchedule = getCurrentSchedule();
    updateCurrentSchedule({
      positions: currentSchedule.positions.filter(p => p.id !== positionId)
    });

    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      newSet.delete(positionId);
      return newSet;
    });
  }, [getCurrentSchedule, updateCurrentSchedule]);

  const updatePosition = useCallback((positionId: string, updates: Partial<SchedulePosition>) => {
    const currentSchedule = getCurrentSchedule();
    updateCurrentSchedule({
      positions: currentSchedule.positions.map(p => 
        p.id === positionId ? { ...p, ...updates } : p
      )
    });
  }, [getCurrentSchedule, updateCurrentSchedule]);

  const togglePositionExpanded = (positionId: string) => {
    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionId)) {
        newSet.delete(positionId);
      } else {
        newSet.add(positionId);
      }
      return newSet;
    });
  };

  // Template functions
  const applyTemplate = useCallback((template: 'flat50' | 'peak' | 'valley' | 'clear', positionId?: string) => {
    const currentSchedule = getCurrentSchedule();
    
    if (positionId) {
      // Apply to specific position
      const position = currentSchedule.positions.find(p => p.id === positionId);
      if (!position) return;

      let newIntervals: number[];
      switch (template) {
        case 'flat50':
          newIntervals = new Array(96).fill(50);
          break;
        case 'peak':
          newIntervals = Array.from({ length: 96 }, (_, i) => {
            const hour = Math.floor(i / 4);
            return hour >= 8 && hour <= 20 ? 100 : 20;
          });
          break;
        case 'valley':
          newIntervals = Array.from({ length: 96 }, (_, i) => {
            const hour = Math.floor(i / 4);
            return hour >= 22 || hour <= 6 ? 80 : 10;
          });
          break;
        case 'clear':
          newIntervals = new Array(96).fill(0);
          break;
        default:
          return;
      }

      updatePosition(positionId, { intervals: newIntervals });
    } else {
      // Apply to all positions
      const updatedPositions = currentSchedule.positions.map(position => {
        let newIntervals: number[];
        switch (template) {
          case 'flat50':
            newIntervals = new Array(96).fill(50);
            break;
          case 'peak':
            newIntervals = Array.from({ length: 96 }, (_, i) => {
              const hour = Math.floor(i / 4);
              return hour >= 8 && hour <= 20 ? 100 : 20;
            });
            break;
          case 'valley':
            newIntervals = Array.from({ length: 96 }, (_, i) => {
              const hour = Math.floor(i / 4);
              return hour >= 22 || hour <= 6 ? 80 : 10;
            });
            break;
          case 'clear':
            newIntervals = new Array(96).fill(0);
            break;
          default:
            return position;
        }
        return { ...position, intervals: newIntervals };
      });

      updateCurrentSchedule({ positions: updatedPositions });
    }
  }, [getCurrentSchedule, updateCurrentSchedule, updatePosition]);

  // Validation
  const validateSchedule = useCallback((): string[] => {
    const currentSchedule = getCurrentSchedule();
    const errors: string[] = [];

    if (!currentSchedule.sender) errors.push('Sender is required');
    if (!currentSchedule.receiver) errors.push('Receiver is required');
    if (currentSchedule.positions.length === 0) errors.push('At least one position is required');

    currentSchedule.positions.forEach((position, index) => {
      if (!position.positionId) errors.push(`Position ${index + 1}: Position ID is required`);
      if (!position.businessType) errors.push(`Position ${index + 1}: Business Type is required`);
      if (!position.inParty) errors.push(`Position ${index + 1}: In Party is required`);
      if (!position.outParty) errors.push(`Position ${index + 1}: Out Party is required`);
      
      const hasValues = position.intervals.some(val => val !== 0);
      if (!hasValues) errors.push(`Position ${index + 1}: No energy values defined`);
    });

    return errors;
  }, [getCurrentSchedule]);

  const saveSchedule = useCallback(() => {
    const currentSchedule = getCurrentSchedule();
    const errors = validateSchedule();
    
    if (errors.length > 0) {
      setActiveTab('validation');
      return;
    }

    onScheduleSave?.(currentSchedule);
  }, [getCurrentSchedule, validateSchedule, onScheduleSave]);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const currentSchedule = getCurrentSchedule();
    const totalEnergy = currentSchedule.positions.reduce((sum, pos) => 
      sum + pos.intervals.reduce((posSum, val) => posSum + val, 0), 0
    );
    
    const avgPower = totalEnergy / 96;
    const maxPower = Math.max(...currentSchedule.positions.flatMap(pos => pos.intervals));
    const minPower = Math.min(...currentSchedule.positions.flatMap(pos => pos.intervals));
    
    return {
      totalPositions: currentSchedule.positions.length,
      totalEnergy: Math.round(totalEnergy * 100) / 100,
      avgPower: Math.round(avgPower * 100) / 100,
      maxPower: Math.round(maxPower * 100) / 100,
      minPower: Math.round(minPower * 100) / 100
    };
  }, [getCurrentSchedule]);

  const renderHeader = () => (
    <header className="header">
      <div className="header__content">
        <div className="header__title">
          <h1>TSO Schedule Manager</h1>
          {selectedBalanceGroup && (
            <div className="header__breadcrumb">
              <span>{selectedCountry?.name}</span>
              <ChevronRight size={16} />
              <span>{selectedTSO?.name}</span>
              <ChevronRight size={16} />
              <span>{selectedBalanceGroup.name}</span>
            </div>
          )}
        </div>
        <div className="header__actions">
          <button onClick={clearAllSchedules} className="btn btn--danger btn--small">
            Clear All
          </button>
        </div>
      </div>
    </header>
  );

  const renderTreeNavigation = () => (
    <div className="tree-navigation">
      <div className="tree-navigation__header">
        <h3>TSO & Balance Groups</h3>
        <div className="tree-navigation__controls">
          <button onClick={expandAll} className="btn btn--secondary btn--small">
            Expand All
          </button>
          <button onClick={collapseAll} className="btn btn--secondary btn--small">
            Collapse All
          </button>
        </div>
      </div>

      <div className="tree-navigation__search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search countries, TSOs, or balance groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="search-input__clear"
          >
            ×
          </button>
        )}
      </div>

      <div className="tree-navigation__content">
        {filterCountries().map((country) => {
          const filteredTSOs = filterTSOs(country);
          if (filteredTSOs.length === 0) return null;

          const isCountryExpanded = expandedCountries.has(country.id);

          return (
            <div key={country.id} className="tree-node tree-node--country">
              <div 
                className="tree-node__header"
                onClick={() => toggleCountryExpanded(country.id)}
              >
                <div className="tree-node__toggle">
                  {isCountryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <Globe size={18} className="tree-node__icon" />
                <span className="tree-node__label">
                  {country.flag} {country.name}
                </span>
                <span className="tree-node__count">
                  {filteredTSOs.length} TSO{filteredTSOs.length !== 1 ? 's' : ''}
                </span>
              </div>

              {isCountryExpanded && (
                <div className="tree-node__children">
                  {filteredTSOs.map((tso) => {
                    const filteredBalanceGroups = filterBalanceGroups(tso);
                    if (filteredBalanceGroups.length === 0) return null;

                    const isTSOExpanded = expandedTSOs.has(tso.id);

                    return (
                      <div key={tso.id} className="tree-node tree-node--tso">
                        <div 
                          className="tree-node__header"
                          onClick={() => toggleTSOExpanded(tso.id)}
                        >
                          <div className="tree-node__toggle">
                            {isTSOExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          <Building2 size={18} className="tree-node__icon" />
                          <span className="tree-node__label">{tso.name}</span>
                          <span className="tree-node__count">
                            {filteredBalanceGroups.length} BG{filteredBalanceGroups.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {isTSOExpanded && (
                          <div className="tree-node__children">
                            {filteredBalanceGroups.map((balanceGroup) => (
                              <div 
                                key={balanceGroup.id} 
                                className={`tree-node tree-node--balance-group ${
                                  selectedBalanceGroup?.id === balanceGroup.id ? 'tree-node--selected' : ''
                                }`}
                                onClick={() => handleBalanceGroupSelect(balanceGroup, tso, country)}
                              >
                                <div className="tree-node__header">
                                  <Zap size={16} className="tree-node__icon" />
                                  <div className="tree-node__content">
                                    <span className="tree-node__label">{balanceGroup.name}</span>
                                    <span className="tree-node__subtitle">{balanceGroup.responsibleParty}</span>
                                    <span className="tree-node__code">{balanceGroup.eicCode}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tree-navigation__stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-item__label">Countries</span>
            <span className="stat-item__value">{filterCountries().length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">TSOs</span>
            <span className="stat-item__value">
              {filterCountries().reduce((sum, country) => sum + filterTSOs(country).length, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-item__label">Balance Groups</span>
            <span className="stat-item__value">
              {filterCountries().reduce((sum, country) => 
                sum + filterTSOs(country).reduce((tsoSum, tso) => 
                  tsoSum + filterBalanceGroups(tso).length, 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWelcomeMessage = () => (
    <div className="welcome-message">
      <div className="welcome-message__content">
        <h2>Welcome to TSO Schedule Manager</h2>
        <p>Select a Balance Group from the navigation to start creating schedules.</p>
        <div className="welcome-message__steps">
          <div className="step">
            <span className="step__number">1</span>
            <span className="step__text">Choose a country and TSO</span>
          </div>
          <div className="step">
            <span className="step__number">2</span>
            <span className="step__text">Select a Balance Group</span>
          </div>
          <div className="step">
            <span className="step__number">3</span>
            <span className="step__text">Create and manage positions</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabNavigation = () => {
    const currentSchedule = getCurrentSchedule();
    const errors = validateSchedule();

    return (
      <nav className="tab-navigation">
        <div className="tab-navigation__tabs">
          <button
            className={`tab-navigation__tab ${activeTab === 'overview' ? 'tab-navigation__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-navigation__tab ${activeTab === 'positions' ? 'tab-navigation__tab--active' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Positions
            <span className="tab-navigation__tab-counter">
              {currentSchedule.positions.length}
            </span>
          </button>
          <button
            className={`tab-navigation__tab ${activeTab === 'validation' ? 'tab-navigation__tab--active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            Validation
            {errors.length > 0 && (
              <span className="tab-navigation__tab-counter tab-navigation__tab-counter--error">
                {errors.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    );
  };

  const renderOverviewTab = () => {
    const currentSchedule = getCurrentSchedule();
    const stats = calculateStats();

    return (
      <div className="overview-tab">
        <div className="card">
          <div className="card__header">
            <h3>Schedule Information</h3>
          </div>
          <div className="card__content">
            <div className="form-grid">
              <div className="form-group">
                <label>Message ID</label>
                <input
                  type="text"
                  value={currentSchedule.messageId}
                  onChange={(e) => updateCurrentSchedule({ messageId: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Version</label>
                <input
                  type="text"
                  value={currentSchedule.version}
                  onChange={(e) => updateCurrentSchedule({ version: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Sender</label>
                <input
                  type="text"
                  value={currentSchedule.sender}
                  onChange={(e) => updateCurrentSchedule({ sender: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Receiver</label>
                <input
                  type="text"
                  value={currentSchedule.receiver}
                  onChange={(e) => updateCurrentSchedule({ receiver: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>In Domain</label>
                <input
                  type="text"
                  value={currentSchedule.inDomain}
                  onChange={(e) => updateCurrentSchedule({ inDomain: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Out Domain</label>
                <input
                  type="text"
                  value={currentSchedule.outDomain}
                  onChange={(e) => updateCurrentSchedule({ outDomain: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Statistics</h3>
          </div>
          <div className="card__content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-item__label">Total Positions</span>
                <span className="stat-item__value">{stats.totalPositions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item__label">Total Energy (MWh)</span>
                <span className="stat-item__value">{stats.totalEnergy}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item__label">Average Power (MW)</span>
                <span className="stat-item__value">{stats.avgPower}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item__label">Max Power (MW)</span>
                <span className="stat-item__value">{stats.maxPower}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPositionsTab = () => {
    const currentSchedule = getCurrentSchedule();

    return (
      <div className="positions-tab">
        <div className="positions-tab__header">
          <h3>Schedule Positions</h3>
          <div className="positions-tab__actions">
            <div className="template-buttons">
              <button onClick={() => applyTemplate('flat50')} className="btn btn--secondary btn--small">
                Flat 50MW
              </button>
              <button onClick={() => applyTemplate('peak')} className="btn btn--secondary btn--small">
                Peak Load
              </button>
              <button onClick={() => applyTemplate('valley')} className="btn btn--secondary btn--small">
                Valley Fill
              </button>
              <button onClick={() => applyTemplate('clear')} className="btn btn--secondary btn--small">
                Clear All
              </button>
            </div>
            <button onClick={addPosition} className="btn btn--primary">
              <Plus size={16} />
              Add Position
            </button>
          </div>
        </div>

        <div className="positions-list">
          {currentSchedule.positions.length === 0 ? (
            <div className="empty-state">
              <p>No positions created yet. Click "Add Position" to get started.</p>
            </div>
          ) : (
            currentSchedule.positions.map((position, index) => {
              const isExpanded = expandedPositions.has(position.id);
              
              return (
                <div key={position.id} className="position-card">
                  <div className="position-card__header">
                    <div className="position-card__title">
                      <button
                        onClick={() => togglePositionExpanded(position.id)}
                        className="position-card__toggle"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <span>Position {index + 1} - {position.positionId}</span>
                    </div>
                    <div className="position-card__actions">
                      <button onClick={() => duplicatePosition(position.id)} className="btn btn--secondary btn--small">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => removePosition(position.id)} className="btn btn--danger btn--small">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="position-card__content">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Position ID</label>
                          <input
                            type="text"
                            value={position.positionId}
                            onChange={(e) => updatePosition(position.id, { positionId: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Business Type</label>
                          <select
                            value={position.businessType}
                            onChange={(e) => updatePosition(position.id, { businessType: e.target.value })}
                            className="form-select"
                          >
                            <option value="A01">Production</option>
                            <option value="A02">Consumption</option>
                            <option value="A03">Reserve</option>
                            <option value="A04">Generation</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>In Party</label>
                          <input
                            type="text"
                            value={position.inParty}
                            onChange={(e) => updatePosition(position.id, { inParty: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Out Party</label>
                          <input
                            type="text"
                            value={position.outParty}
                            onChange={(e) => updatePosition(position.id, { outParty: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>In Area</label>
                          <input
                            type="text"
                            value={position.inArea}
                            onChange={(e) => updatePosition(position.id, { inArea: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Out Area</label>
                          <input
                            type="text"
                            value={position.outArea}
                            onChange={(e) => updatePosition(position.id, { outArea: e.target.value })}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Measurement Unit</label>
                          <select
                            value={position.measurementUnit}
                            onChange={(e) => updatePosition(position.id, { measurementUnit: e.target.value })}
                            className="form-select"
                          >
                            <option value="MAW">MAW</option>
                            <option value="KWT">KWT</option>
                            <option value="GWH">GWH</option>
                          </select>
                        </div>
                      </div>

                      <div className="position-templates">
                        <label>Quick Templates:</label>
                        <div className="template-buttons">
                          <button onClick={() => applyTemplate('flat50', position.id)} className="btn btn--secondary btn--small">
                            Flat 50MW
                          </button>
                          <button onClick={() => applyTemplate('peak', position.id)} className="btn btn--secondary btn--small">
                            Peak
                          </button>
                          <button onClick={() => applyTemplate('valley', position.id)} className="btn btn--secondary btn--small">
                            Valley
                          </button>
                          <button onClick={() => applyTemplate('clear', position.id)} className="btn btn--secondary btn--small">
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="intervals-grid">
                        <label>96 Quarter-Hour Intervals (MW):</label>
                        <div className="intervals-input">
                          {position.intervals.map((value, intervalIndex) => {
                            const hours = Math.floor(intervalIndex / 4);
                            const minutes = (intervalIndex % 4) * 15;
                            const timeLabel = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            
                            return (
                              <div key={intervalIndex} className="interval-wrapper">
                                <div className="interval-time">{timeLabel}</div>
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => {
                                    const newIntervals = [...position.intervals];
                                    newIntervals[intervalIndex] = parseFloat(e.target.value) || 0;
                                    updatePosition(position.id, { intervals: newIntervals });
                                  }}
                                  className="interval-input"
                                  step="0.1"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderValidationTab = () => {
    const errors = validateSchedule();
    const currentSchedule = getCurrentSchedule();

    return (
      <div className="validation-tab">
        <div className="card">
          <div className="card__header">
            <h3>Schedule Validation</h3>
          </div>
          <div className="card__content">
            {errors.length === 0 ? (
              <div className="validation-success">
                <p>✅ Schedule is valid and ready to save.</p>
                <button onClick={saveSchedule} className="btn btn--primary">
                  Save Schedule
                </button>
              </div>
            ) : (
              <div className="validation-errors">
                <p>❌ Found {errors.length} error{errors.length !== 1 ? 's' : ''}:</p>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3>Schedule Summary</h3>
          </div>
          <div className="card__content">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item__label">Message ID:</span>
                <span className="summary-item__value">{currentSchedule.messageId}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Sender:</span>
                <span className="summary-item__value">{currentSchedule.sender}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Receiver:</span>
                <span className="summary-item__value">{currentSchedule.receiver}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Positions:</span>
                <span className="summary-item__value">{currentSchedule.positions.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Schedule Period:</span>
                <span className="summary-item__value">
                  {new Date(currentSchedule.schedulePeriodStart).toLocaleDateString()} - 
                  {new Date(currentSchedule.schedulePeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedBalanceGroup) {
      return renderWelcomeMessage();
    }

    return (
      <div className="schedule-editor-content">
        {renderTabNavigation()}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'positions' && renderPositionsTab()}
          {activeTab === 'validation' && renderValidationTab()}
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-editor">
      <div className="schedule-editor__body">
        <aside className="schedule-editor__sidebar">
          {renderTreeNavigation()}
        </aside>
        <main className="schedule-editor__main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ScheduleEditor;