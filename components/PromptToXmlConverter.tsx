import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CodeIcon } from './icons/CodeIcon';

interface PromptToXmlConverterProps {
    initialPrompt: string;
}

const PromptToXmlConverter: React.FC<PromptToXmlConverterProps> = ({ initialPrompt }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [generatedXml, setGeneratedXml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setPrompt(initialPrompt);
    }, [initialPrompt]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập lời nhắc.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedXml('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const textPart = {
                text: `From the following description, create a simple, clean Android Vector Drawable XML code. The description is: '${prompt}'. IMPORTANT: The 'android:pathData' attribute MUST contain the literal SVG path data string, NOT a resource reference like '@string/path'. For colors, use hex codes or 'currentColor', NOT '@color/ref'. Provide only the raw XML code as a direct response, without any surrounding text or markdown formatting.`,
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [textPart] },
            });
            
            let code = response.text.trim();
             if (code.startsWith('```xml')) {
                code = code.substring(6, code.length - 3).trim();
            } else if (code.startsWith('```')) {
                 code = code.substring(3, code.length - 3).trim();
            }
            
            setGeneratedXml(code);

        } catch (err: any) {
            const errorMessage = err.message || 'Không thể tạo mã XML.';
            setError(`Đã xảy ra lỗi: ${errorMessage}`);
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
        <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-full">
            <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-slate-400"/>
                    <h2 className="font-semibold text-slate-300">Tạo XML từ Lời nhắc</h2>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{isLoading ? 'Đang tạo...' : 'Tạo mã'}</span>
                </button>
            </div>
            <div className="flex flex-col flex-grow">
                <div className="h-1/3 border-b border-slate-700">
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập lời nhắc của bạn ở đây hoặc tạo một lời nhắc từ hình ảnh..."
                        className="w-full h-full p-4 bg-slate-800 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-500"
                        spellCheck="false"
                        aria-label="Nhập lời nhắc"
                    />
                </div>
                <div className="h-2/3 flex flex-col">
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <CodeIcon className="w-5 h-5 text-slate-400"/>
                            <h3 className="text-sm font-semibold text-slate-300">Mã XML Vector được tạo</h3>
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!generatedXml || isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Sao chép mã XML"
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
                                    <p className="mt-3 text-slate-300">AI đang tạo mã...</p>
                                 </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
             {error && <div className="p-2 text-center text-sm text-red-400 bg-red-900/50 border-t border-slate-700">{error}</div>}
        </div>
    );
};

export default PromptToXmlConverter;