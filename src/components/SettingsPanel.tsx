import React from 'react';
import { Settings, Zap } from 'lucide-react';
import type { CompressionSettings } from '../services/imageProcessor';

interface SettingsPanelProps {
  settings: CompressionSettings;
  setSettings: (settings: CompressionSettings) => void;
  onCompressAll: () => void;
  isProcessing: boolean;
  totalImages: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  setSettings, 
  onCompressAll, 
  isProcessing,
  totalImages
}) => {
  const updateSetting = (key: keyof CompressionSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Settings size={20} className="text-secondary" />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Global Settings</h2>
      </div>

      <div className="settings-section">
        <div className="input-group">
          <label>Output Format</label>
          <select 
            value={settings.fileType || ''} 
            onChange={(e) => updateSetting('fileType', e.target.value || undefined)}
          >
            <option value="">Original Format</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>Quality</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>{Math.round(settings.initialQuality * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.05" 
            value={settings.initialQuality}
            onChange={(e) => updateSetting('initialQuality', parseFloat(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Max Dimension (px)</label>
          <input 
            type="number" 
            value={settings.maxWidthOrHeight}
            onChange={(e) => updateSetting('maxWidthOrHeight', parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Max Size (MB)</label>
          <input 
            type="number" 
            step="0.1"
            value={settings.maxSizeMB}
            onChange={(e) => updateSetting('maxSizeMB', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap size={16} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Bulk Actions</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
            Settings apply to all {totalImages} images in queue.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={onCompressAll}
            disabled={isProcessing || totalImages === 0}
          >
            {isProcessing ? 'Processing...' : 'Compress All'}
          </button>
        </div>
      </div>
    </div>
  );
};
