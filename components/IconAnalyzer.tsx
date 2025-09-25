
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { ImageIcon } from './icons/ImageIcon';

interface AnalysisResult {
  mainSubject: string;
  style: string;
  keyElements: string[];
  colorPalette: string[];
  suggestedKeywords: string[];
  generationPrompt: string;
  improvementSuggestions: string[];
}

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-2 border-b border-slate-700 pb-1">{title}</h3>
        <div className="text-sm text-slate-300">{children}</div>
    </div>
);

const ColorPalette: React.FC<{ colors: string[] }> = ({ colors }) => (
    <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-700 rounded-full px-3 py-1 text-xs">
                <div className="w-4 h-4 rounded-full border border-slate-500" style={{ backgroundColor: color }}></div>
                <span className="font-mono">{color}</span>
            </div>
        ))}
    </div>
);

const KeywordBadges: React.FC<{ keywords: string[] }> = ({ keywords }) => (
    <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
            <span key={index} className="bg-blue-900/50 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">{keyword}</span>
        ))}
    </div>
);

const IconAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [dragCounter, setDragCounter] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result as string); };
            reader.readAsDataURL(file);
            setError(null);
            setAnalysisResult(null);
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
            reader.onloadend = () => { setImagePreview(reader.result as string); };
            reader.readAsDataURL(file);
            setError(null);
            setAnalysisResult(null);
        } else {
            setError('Vui lòng chỉ thả tệp PNG hoặc JPG.');
        }
    }, []);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragCounter(c => c + 1); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragCounter(c => c - 1); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleAnalyze = async () => {
        if (!imageFile) {
            setError('Vui lòng tải lên một hình ảnh trước.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await toBase64(imageFile);

            const imagePart = { inlineData: { mimeType: imageFile.type, data: base64Data } };
            const textPart = { text: "Act as an expert UI/UX and icon designer. Analyze the provided icon image and return a detailed analysis as a JSON object. Provide actionable insights for improvement and detailed descriptions suitable for regeneration." };

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                  mainSubject: { type: Type.STRING, description: "The main subject of the icon (e.g., 'House', 'User profile')." },
                  style: { type: Type.STRING, description: "The visual style (e.g., 'Flat, minimalist', 'Line art with rounded corners')." },
                  keyElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key geometric shapes or components." },
                  colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of main colors used, preferably in hex codes." },
                  suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords for tagging or searching this icon." },
                  generationPrompt: { type: Type.STRING, description: "A detailed prompt for an AI image generator to recreate this icon." },
                  improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable suggestions to improve the icon's design, clarity, or accessibility." },
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            const jsonString = response.text.trim();
            setAnalysisResult(JSON.parse(jsonString));

        } catch (err: any) {
            setError(`Đã xảy ra lỗi: ${err.message || 'Không thể phân tích icon.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-full">
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <h2 className="font-semibold text-slate-300">Nguồn Icon</h2>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={!imageFile || isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>{isLoading ? 'Đang phân tích...' : 'Phân tích Icon'}</span>
                    </button>
                </div>
                <div
                    className="flex-grow flex items-center justify-center p-4 min-h-[200px]"
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                >
                    <div className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-slate-400 transition-colors ${dragCounter > 0 ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600'}`}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Xem trước icon" className="max-w-full max-h-48 object-contain rounded-md" />
                        ) : (
                            <div className="text-center p-4">
                                <UploadIcon className="w-10 h-10 mx-auto text-slate-500" />
                                <p className="mt-2 text-sm font-semibold">Kéo và thả ảnh vào đây</p>
                                <p className="text-xs text-slate-500">hoặc</p>
                                <label htmlFor="icon-file-upload" className="mt-2 inline-block px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 cursor-pointer transition-colors">Chọn tệp</label>
                                <input id="icon-file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                            </div>
                        )}
                    </div>
                </div>
                {error && <div className="p-2 text-center text-sm text-red-400 bg-red-900/50 border-t border-slate-700">{error}</div>}
            </div>

            <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-full">
                <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
                    <AnalysisIcon className="w-5 h-5 text-slate-400" />
                    <h2 className="font-semibold text-slate-300">Kết quả Phân tích Icon</h2>
                </div>
                <div className="flex-grow p-6 overflow-y-auto relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center" aria-live="polite">
                            <div className="text-center">
                                <div role="status" className="w-8 h-8 border-4 border-slate-500 border-t-purple-400 rounded-full animate-spin mx-auto"><span className="sr-only">Đang tải</span></div>
                                <p className="mt-3 text-slate-300">AI đang phân tích icon...</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !analysisResult && !error && (
                        <div className="text-slate-500 text-center flex flex-col items-center justify-center h-full">
                            <AnalysisIcon className="w-12 h-12 text-slate-600 mb-4" />
                            <p className="font-semibold">Kết quả phân tích sẽ xuất hiện ở đây.</p>
                            <p className="text-sm mt-1">Tải lên một ảnh và nhấp vào "Phân tích Icon" để bắt đầu.</p>
                        </div>
                    )}
                    {error && !isLoading && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
                    {analysisResult && (
                        <div className="space-y-5">
                            <AnalysisSection title="Chủ đề chính">
                                <p className="font-semibold text-slate-200">{analysisResult.mainSubject}</p>
                            </AnalysisSection>
                            <AnalysisSection title="Phong cách">
                                <p>{analysisResult.style}</p>
                            </AnalysisSection>
                            <AnalysisSection title="Prompt tạo lại">
                                <p className="p-3 bg-slate-900/50 rounded-md font-mono text-xs">{analysisResult.generationPrompt}</p>
                            </AnalysisSection>
                            <AnalysisSection title="Yếu tố chính">
                                <ul className="list-disc list-inside space-y-1">{analysisResult.keyElements.map((item, i) => <li key={i}>{item}</li>)}</ul>
                            </AnalysisSection>
                             <AnalysisSection title="Gợi ý cải thiện">
                                <ul className="list-disc list-inside space-y-1 text-amber-300">{analysisResult.improvementSuggestions.map((item, i) => <li key={i}><span className="text-slate-300">{item}</span></li>)}</ul>
                            </AnalysisSection>
                            <AnalysisSection title="Bảng màu"><ColorPalette colors={analysisResult.colorPalette} /></AnalysisSection>
                            <AnalysisSection title="Từ khóa đề xuất"><KeywordBadges keywords={analysisResult.suggestedKeywords} /></AnalysisSection>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IconAnalyzer;
