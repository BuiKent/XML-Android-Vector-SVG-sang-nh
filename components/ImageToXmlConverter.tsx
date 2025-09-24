
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageIcon } from './icons/ImageIcon';
import { CodeIcon } from './icons/CodeIcon';

const ImageToXmlConverter: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedXml, setGeneratedXml] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [dragCounter, setDragCounter] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
            setGeneratedXml('');
        } else {
            setError('Vui lòng chọn tệp PNG hoặc JPG.');
        }
    };
    
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(0);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImageFile(file);
             const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
            setGeneratedXml('');
        } else {
            setError('Vui lòng chỉ thả tệp PNG hoặc JPG.');
        }
    }, []);
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });

    const handleGenerate = async () => {
        if (!imageFile) {
            setError('Vui lòng tải lên một hình ảnh trước.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedXml('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await toBase64(imageFile);

            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Data,
                },
            };

            const textPart = {
                text: "Analyze this image and generate the XML code for an Android Vector Drawable that represents it. Focus on the main shapes and colors. The vector drawable should be simple and clean. Provide only the XML code as a direct response, without any surrounding text, explanations, or markdown formatting like ```xml.",
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            let code = response.text.trim();
            if (code.startsWith('```xml')) {
                code = code.substring(6, code.length - 3).trim();
            } else if (code.startsWith('```')) {
                 code = code.substring(3, code.length - 3).trim();
            }
            
            setGeneratedXml(code);

        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tạo XML.';
            setError(`Đã xảy ra lỗi: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedXml) return;
        navigator.clipboard.writeText(generatedXml).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    return (
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-[40vh] md:h-auto">
           <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 border-b border-slate-700">
             <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-400"/>
                <h2 className="font-semibold text-slate-300">Nguồn ảnh</h2>
             </div>
             <button
                onClick={handleGenerate}
                disabled={!imageFile || isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{isLoading ? 'Đang tạo...' : 'Tạo XML'}</span>
              </button>
           </div>
           <div 
                className="flex-grow flex items-center justify-center p-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
            >
             <div 
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed  rounded-lg text-slate-400 transition-colors ${dragCounter > 0 ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600'}`}
             >
                {imagePreview ? (
                    <img src={imagePreview} alt="Xem trước ảnh tải lên" className="max-w-full max-h-full object-contain rounded-md" />
                ) : (
                    <div className="text-center p-4">
                        <UploadIcon className="w-12 h-12 mx-auto text-slate-500" />
                        <p className="mt-2 font-semibold">Kéo và thả ảnh vào đây</p>
                        <p className="text-sm text-slate-500">hoặc</p>
                        <label htmlFor="file-upload" className="mt-2 inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 cursor-pointer transition-colors">
                            Chọn tệp
                        </label>
                        <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                    </div>
                )}
             </div>
           </div>
           {error && <div className="p-2 text-center text-sm text-red-400 bg-red-900/50 border-t border-slate-700">{error}</div>}
        </div>

        <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-[50vh] md:h-auto">
            <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <CodeIcon className="w-5 h-5 text-slate-400"/>
                    <h2 className="font-semibold text-slate-300">Android Vector Drawable được tạo</h2>
                </div>
                <button
                    onClick={handleCopy}
                    disabled={!generatedXml || isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Sao chép mã"
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    <span>{isCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
                </button>
            </div>
            <div className="flex-grow relative">
                <textarea
                    readOnly
                    value={generatedXml}
                    placeholder="Mã XML được tạo bởi AI sẽ xuất hiện ở đây..."
                    className="w-full h-full p-4 bg-slate-800 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-500"
                    spellCheck="false"
                    aria-label="Đầu ra mã XML"
                />
                {isLoading && (
                     <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center" aria-live="polite">
                         <div className="text-center">
                            <div role="status" className="w-8 h-8 border-4 border-slate-500 border-t-purple-400 rounded-full animate-spin mx-auto">
                                <span className="sr-only">Đang tải</span>
                            </div>
                            <p className="mt-3 text-slate-300">AI đang phân tích ảnh...</p>
                         </div>
                     </div>
                )}
            </div>
        </div>
      </div>
    );
};

export default ImageToXmlConverter;
