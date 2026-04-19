import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  return (
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
        <Upload size={32} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Drop your images here</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>or click to browse from your device</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <span className="stat-badge">JPG</span>
        <span className="stat-badge">PNG</span>
        <span className="stat-badge">WEBP</span>
      </div>
    </div>
  );
};
