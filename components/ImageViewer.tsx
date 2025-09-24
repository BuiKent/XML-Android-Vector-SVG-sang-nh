
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageIcon } from './icons/ImageIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageViewerProps {
  xmlString: string;
}

// --- Start of Android Vector Drawable to SVG converter logic ---
const parseVdSize = (size: string | null): string => {
  if (!size) return '24';
  return size.replace(/dp|px/g, '');
};

const parseVdColor = (color: string | null, tint: string | null): string => {
  if (tint) {
      if (tint.startsWith('@') || tint.startsWith('?')) return 'currentColor';
      return tint;
  }
  if (!color) return 'none';
  // Cannot resolve Android color resources, use a default that works well in the UI.
  if (color.startsWith('@') || color.startsWith('?')) {
    return 'currentColor';
  }
  return color;
};

const vectorDrawableToSvg = (xmlString: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const vectorNode = xmlDoc.querySelector('vector');
      const parseError = xmlDoc.querySelector('parsererror');
      
      if (parseError) {
          throw new Error(`Lỗi phân tích cú pháp XML: ${parseError.textContent || 'Unknown error'}`);
      }

      if (!vectorNode) {
        throw new Error('Thẻ <vector> không được tìm thấy. Đây có phải là một Vector Drawable hợp lệ không?');
      }

      const width = parseVdSize(vectorNode.getAttribute('android:width'));
      const height = parseVdSize(vectorNode.getAttribute('android:height'));
      const viewportWidth = vectorNode.getAttribute('android:viewportWidth') || width;
      const viewportHeight = vectorNode.getAttribute('android:viewportHeight') || height;
      const tint = vectorNode.getAttribute('android:tint');

      const paths = Array.from(xmlDoc.querySelectorAll('path'))
        .map(pathNode => {
          const pathData = pathNode.getAttribute('android:pathData');
          if (!pathData) return '';
          
          const fillColor = parseVdColor(pathNode.getAttribute('android:fillColor'), tint);
          const strokeColor = parseVdColor(pathNode.getAttribute('android:strokeColor'), null);
          const strokeWidth = pathNode.getAttribute('android:strokeWidth') || '0';
          
          return `<path d="${pathData}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
        })
        .join('');

      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${viewportWidth} ${viewportHeight}">
          ${paths}
        </svg>
      `.trim();
    } catch (e: any) {
        throw new Error(`Không thể chuyển đổi Vector Drawable: ${e.message}`);
    }
};
// --- End of converter logic ---

const ImageViewer: React.FC<ImageViewerProps> = ({ xmlString }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (xmlString.trim() === '') {
      setImageUrl('');
      setError(null);
      return;
    }

    let svgString = xmlString;

    try {
      // Check if it's an Android Vector Drawable and try to convert it
      if (xmlString.trim().startsWith('<vector')) {
        svgString = vectorDrawableToSvg(xmlString);
      }

      // Proceed with SVG to data URL conversion
      // Use btoa for robust Base64 encoding which works with unicode characters
      const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
      setImageUrl(dataUrl);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Mã XML không hợp lệ. Vui lòng kiểm tra lại.');
      setImageUrl('');
    }
  }, [xmlString]);

  const handleDownload = useCallback((format: 'png' | 'jpeg') => {
    if (!imageUrl || !canvasRef.current || !imageRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) {
        setError("Không thể lấy ngữ cảnh canvas.");
        setIsProcessing(false);
        return;
    }

    const triggerDownload = () => {
        canvas.width = img.naturalWidth || img.width || 300;
        canvas.height = img.naturalHeight || img.height || 300;

        if (format === 'jpeg') {
            ctx.fillStyle = '#1e293b'; // slate-800
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${format}`;
        const rasterUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.9 : 1.0);

        const link = document.createElement('a');
        link.href = rasterUrl;
        link.download = `converted-image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsProcessing(false);
    };
    
    if (img.complete && img.naturalHeight > 0) {
      triggerDownload();
    } else {
      img.onload = triggerDownload;
      img.onerror = () => {
        setError("Không thể tải ảnh SVG đã chuyển đổi để tải xuống.");
        setIsProcessing(false);
      }
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-[50vh] md:h-auto">
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-400"/>
            <h2 className="font-semibold text-slate-300">Xem trước ảnh</h2>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleDownload('png')}
                disabled={!imageUrl || !!error || isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>PNG</span>
            </button>
            <button
                onClick={() => handleDownload('jpeg')}
                disabled={!imageUrl || !!error || isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>JPG</span>
            </button>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center p-4 bg-grid-pattern">
        {isProcessing && <div className="text-slate-300">Đang xử lý tải xuống...</div>}
        {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
        {!error && imageUrl && (
            <img 
                ref={imageRef} 
                src={imageUrl} 
                alt="Ảnh XML được kết xuất" 
                className="max-w-full max-h-full object-contain"
                crossOrigin="anonymous"
            />
        )}
        {!error && !imageUrl && xmlString.trim() !== '' && (
            <div className="text-slate-500">Đang tải xem trước...</div>
        )}
        {!error && !imageUrl && xmlString.trim() === '' && (
            <div className="text-slate-500">Chưa có mã XML.</div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageViewer;
