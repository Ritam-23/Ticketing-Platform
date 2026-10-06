import React, { useState } from 'react';
import {
  X,
  Laptop,
  Server,
  Smartphone,
  Monitor,
  CheckCircle2,
  Plus,
  RefreshCw,
  Globe,
  Cpu,
  MapPin,
  Clock,
  Shield,
  Activity,
} from 'lucide-react';
import { Terminal, DeviceType } from '../types.js';

interface TerminalManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminals: Terminal[];
  currentTerminal: Terminal | null;
  onSelectTerminal: (terminal: Terminal) => void;
  onRegisterTerminal: (data: Partial<Terminal>) => Promise<void>;
  onRefreshTerminals: () => Promise<void>;
}

export const TerminalManagerModal: React.FC<TerminalManagerModalProps> = ({
  isOpen,
  onClose,
  terminals,
  currentTerminal,
  onSelectTerminal,
  onRegisterTerminal,
  onRefreshTerminals,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [location, setLocation] = useState('');
  const [ip, setIp] = useState('192.168.1.' + Math.floor(Math.random() * 200 + 20));
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshTerminals();
    setIsRefreshing(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsRegistering(true);
    try {
      await onRegisterTerminal({
        name,
        deviceType,
        location: location || 'Physical Box Office Stand',
        ip: ip || '10.0.8.44',
        os: deviceType === 'kiosk' ? 'Debian Embedded 12' : deviceType === 'mobile_pos' ? 'Android POS 14' : 'macOS Sequoia 15.0',
        browser: 'Embedded Chrome 128.0',
        physicalMachineFingerprint: `hw-uuid-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
      });
      setShowAddForm(false);
      setName('');
      setLocation('');
    } finally {
      setIsRegistering(false);
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'kiosk':
        return <Server className="w-4 h-4" />;
      case 'mobile_pos':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        id="terminal-manager-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-slate-950/60 text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
                <span>Multi-Terminal & Physical Machines Registry</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                  {terminals.length} Nodes
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage concurrent logins across physical point-of-sale boxes, kiosks & workstations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                isRefreshing ? 'animate-spin text-cyan-400' : ''
              }`}
              title="Refresh Terminal Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="close-terminal-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Terminal Summary Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs text-slate-300 font-medium">
                Active Client Terminal:{' '}
                <span className="text-cyan-300 font-semibold">{currentTerminal?.name || 'Local Machine'}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-3">
                <span>IP: {currentTerminal?.ip || '192.168.1.42'}</span>
                <span>•</span>
                <span>UUID: {currentTerminal?.physicalMachineFingerprint || 'hw-uuid-a98f'}</span>
                <span>•</span>
                <span className="text-emerald-400">Heartbeat Healthy</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Register Machine'}</span>
          </button>
        </div>

        {/* Add Terminal Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleRegister} className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Register New Physical Machine
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Machine Name / Station</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Gate Kiosk #14"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Device Form Factor</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="desktop">Desktop Workstation</option>
                  <option value="laptop">Field Laptop</option>
                  <option value="kiosk">Self-Service Kiosk</option>
                  <option value="mobile_pos">Handheld POS Scanner</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Gate 2 Plaza"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isRegistering}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                {isRegistering ? 'Registering...' : 'Confirm Machine Provisioning'}
              </button>
            </div>
          </form>
        )}

        {/* Terminals List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Physical Terminals & Devices in Mesh</span>
            <span>Click any terminal to simulate logging in from that physical hardware</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {terminals.map((t) => {
              const isCurrent = currentTerminal?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-950/40'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {getDeviceIcon(t.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-semibold text-white">{t.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              Active Terminal
                            </span>
                          )}
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                              t.status === 'online'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400 font-mono">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3 h-3 text-slate-500" />
                            <span>{t.ip}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[120px]">{t.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Cpu className="w-3 h-3 text-slate-500" />
                            <span>{t.os}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[110px]" title={t.physicalMachineFingerprint}>
                              {t.physicalMachineFingerprint}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {!isCurrent && (
                        <button
                          onClick={() => onSelectTerminal(t)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Switch to this Machine
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400 flex items-center justify-between">
          <span className="text-[11px]">
            Real-time synchronization guarantees seat locks and orders are isolated per physical terminal.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
