import { useState, useCallback } from 'react';
import { FileDropZone } from './components/FileDropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageItem, type ImageFile } from './components/ImageItem';
import { compressImage, defaultSettings, type CompressionSettings } from './services/imageProcessor';
import { Download, Trash2 } from 'lucide-react';
import JSZip from 'jszip';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size,
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  }, [images]);

  const compressAll = async () => {
    setIsProcessing(true);
    setTotalProgress(0);
    const imagesToProcess = images.filter(img => img.status === 'pending');
    const totalCount = imagesToProcess.length;
    let completedCount = 0;

    const CONCURRENCY_LIMIT = 3;
    const queue = [...imagesToProcess];

    const processNext = async () => {
      if (queue.length === 0) return;
      const img = queue.shift()!;
      
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));

      try {
        const compressed = await compressImage(img.file, settings);
        setImages(prev => prev.map(i => i.id === img.id ? {
          ...i,
          status: 'done',
          compressedFile: compressed,
          compressedSize: compressed.size,
        } : i));
      } catch (error) {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
      }

      completedCount++;
      setTotalProgress(Math.round((completedCount / totalCount) * 100));
      await processNext();
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, queue.length) }, () => processNext());
    await Promise.all(workers);
    
    setIsProcessing(false);
  };

  const downloadImage = (image: ImageFile) => {
    if (!image.compressedFile) return;
    const url = URL.createObjectURL(image.compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = image.compressedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const zippedImages = images.filter(img => img.status === 'done' && img.compressedFile);
    if (zippedImages.length === 0) return;

    const zip = new JSZip();
    zippedImages.forEach(img => {
      zip.file(img.compressedFile!.name, img.compressedFile!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="header" style={{ padding: '0 0 1rem 0', flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="logo">BulkCompress</h1>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Batch optimize your images with a single click
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               {images.length > 0 && (
                 <button className="btn btn-secondary" onClick={clearAll} disabled={isProcessing}>
                   <Trash2 size={18} /> Clear All
                 </button>
               )}
               {images.some(img => img.status === 'done') && (
                 <button className="btn btn-primary" onClick={downloadAll}>
                   <Download size={18} /> Download All (ZIP)
                 </button>
               )}
            </div>
          </div>
          {isProcessing && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Processing Batch...</span>
                <span>{totalProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>
          )}
        </header>

        {images.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <FileDropZone onFilesAdded={handleFilesAdded} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Images in Queue ({images.length})</h2>
              <div style={{ width: '200px' }}>
                <FileDropZone onFilesAdded={handleFilesAdded} />
              </div>
            </div>
            <div className="image-grid">
              {images.map(img => (
                <ImageItem 
                  key={img.id} 
                  image={img} 
                  onRemove={handleRemove} 
                  onDownload={downloadImage}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <SettingsPanel 
        settings={settings} 
        setSettings={setSettings} 
        onCompressAll={compressAll}
        isProcessing={isProcessing}
        totalImages={images.filter(img => img.status !== 'done').length}
      />
    </div>
  );
}

export default App;
