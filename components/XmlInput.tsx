
import React from 'react';
import { CodeIcon } from './icons/CodeIcon';

interface XmlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const XmlInput: React.FC<XmlInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden h-[40vh] md:h-auto">
       <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
         <CodeIcon className="w-5 h-5 text-slate-400"/>
         <h2 className="font-semibold text-slate-300">Nguồn XML / SVG</h2>
       </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dán mã XML/SVG của bạn vào đây..."
        className="flex-grow w-full p-4 bg-slate-800 text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-500"
        spellCheck="false"
      />
    </div>
  );
};

export default XmlInput;