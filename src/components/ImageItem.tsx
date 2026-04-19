import React, { useMemo } from 'react';
import { Download, X, Loader2 } from 'lucide-react';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  compressedFile?: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  compressedSize?: number;
  customName?: string;
}

interface ImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (image: ImageFile) => void;
  onRename: (id: string, newName: string) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({ image, onRemove, onDownload, onRename }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(image.customName || image.file.name.replace(/\.[^/.]+$/, ""));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savings = useMemo(() => {
    if (!image.compressedSize) return null;
    const diff = image.originalSize - image.compressedSize;
    const percent = Math.round((diff / image.originalSize) * 100);
    return percent > 0 ? `${percent}%` : null;
  }, [image.originalSize, image.compressedSize]);

  const handleRenameSubmit = () => {
    onRename(image.id, editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setEditValue(image.customName || image.file.name.replace(/\.[^/.]+$/, ""));
      setIsEditing(false);
    }
  };

  return (
    <div className="glass-card image-card">
      <button 
        className="btn" 
        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem', background: 'rgba(0,0,0,0.5)', zIndex: 1 }}
        onClick={() => onRemove(image.id)}
      >
        <X size={16} />
      </button>
      
      <img src={image.preview} alt={image.file.name} className="image-preview" />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '1.25rem' }}>
          {isEditing ? (
            <input
              autoFocus
              className="input-group"
              style={{ fontSize: '0.875rem', padding: '0.2rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-color)', borderRadius: '0.25rem', width: '70%' }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span 
              onClick={() => setIsEditing(true)}
              title="Click to rename"
              style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px', cursor: 'pointer', borderBottom: '1px dashed var(--panel-border)' }}
            >
              {image.customName || image.file.name}
            </span>
          )}
          <span className={`status-tag status-${image.status}`}>
            {image.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="stat-badge">Original: {formatSize(image.originalSize)}</span>
          {image.compressedSize && (
            <span className="stat-badge" style={{ color: 'var(--success)' }}>
              Compressed: {formatSize(image.compressedSize)}
            </span>
          )}
        </div>

        {savings && (
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
            Saved {savings} 
          </div>
        )}

        {image.status === 'done' && (
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }}
            onClick={() => onDownload(image)}
          >
            <Download size={14} /> Download
          </button>
        )}

        {image.status === 'processing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--accent-color)', fontSize: '0.875rem' }}>
            <Loader2 size={16} className="animate-spin" /> Compressing...
          </div>
        )}
      </div>
    </div>
  );
};
