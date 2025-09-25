import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageIcon } from './icons/ImageIcon';
import PromptToXmlConverter from './PromptToXmlConverter';

const ImageToXmlConverter: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [isLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(false);
    const [promptError, setPromptError] = useState<string | null>(null);
    const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);
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
            setPromptError(null);
            setGeneratedPrompt('');
        } else {
            setPromptError('Vui lòng chọn tệp PNG hoặc JPG.');
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
            setPromptError(null);
            setGeneratedPrompt('');
        } else {
            setPromptError('Vui lòng chỉ thả tệp PNG hoặc JPG.');
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

    const handleGeneratePrompt = async () => {
        if (!imageFile) {
            setPromptError('Vui lòng tải lên một hình ảnh trước.');
            return;
        }

        setIsLoadingPrompt(true);
        setPromptError(null);
        setGeneratedPrompt('');

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
                text: "Analyze this image, which is likely an icon. Provide a detailed, concise, and descriptive prompt that could be used by an AI image generator to recreate a similar image. The prompt should describe the main subject, style (e.g., flat, minimalist, 3D), colors, and any important details. Provide only the text prompt as a direct response, without any surrounding text, explanations, or markdown formatting.",
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            setGeneratedPrompt(response.text.trim());

        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tạo lời nhắc.';
            setPromptError(`Đã xảy ra lỗi: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoadingPrompt(false);
        }
    };

    const handleCopyPrompt = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setIsPromptCopied(true);
            setTimeout(() => setIsPromptCopied(false), 2000);
        });
    };
    
    return (
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
            {/* Image Source Panel */}
            <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden">
               <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 border-b border-slate-700">
                 <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-slate-400"/>
                    <h2 className="font-semibold text-slate-300">Nguồn ảnh</h2>
                 </div>
                 <button
                    onClick={handleGeneratePrompt}
                    disabled={!imageFile || isLoadingPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{isLoadingPrompt ? 'Đang tạo...' : 'Tạo lời nhắc'}</span>
                  </button>
               </div>
               <div 
                    className="flex-grow flex items-center justify-center p-4 min-h-[200px]"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                 <div 
                    className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed  rounded-lg text-slate-400 transition-colors ${dragCounter > 0 ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600'}`}
                 >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Xem trước ảnh tải lên" className="max-w-full max-h-48 object-contain rounded-md" />
                    ) : (
                        <div className="text-center p-4">
                            <UploadIcon className="w-10 h-10 mx-auto text-slate-500" />
                            <p className="mt-2 text-sm font-semibold">Kéo và thả ảnh vào đây</p>
                            <p className="text-xs text-slate-500">hoặc</p>
                            <label htmlFor="file-upload" className="mt-2 inline-block px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 cursor-pointer transition-colors">
                                Chọn tệp
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </div>
                    )}
                 </div>
               </div>
               {promptError && <div className="p-2 text-center text-sm text-red-400 bg-red-900/50 border-t border-slate-700">{promptError}</div>}
            </div>

            {/* Generated Prompt Panel */}
            <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden flex-1">
                <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-slate-400"/>
                        <h2 className="font-semibold text-slate-300">Lời nhắc được tạo bởi AI</h2>
                    </div>
                    <button
                        onClick={handleCopyPrompt}
                        disabled={!generatedPrompt || isLoadingPrompt}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Sao chép lời nhắc"
                    >
                        {isPromptCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        <span>{isPromptCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
                    </button>
                </div>
                <div className="flex-grow relative">
                    <textarea
                        readOnly
                        value={generatedPrompt}
                        placeholder="Lời nhắc được tạo bởi AI sẽ xuất hiện ở đây..."
                        className="w-full h-full p-4 bg-slate-800 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-500"
                        spellCheck="false"
                        aria-label="Đầu ra lời nhắc"
                    />
                    {isLoadingPrompt && (
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

        {/* Right Column */}
        <PromptToXmlConverter initialPrompt={generatedPrompt} />
      </div>
    );
};

export default ImageToXmlConverter;
