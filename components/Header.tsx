
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 lg:p-6 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-green-400">
          Trình chuyển đổi Vector & Raster
        </h1>
        <p className="text-slate-400 mt-1">
          Chuyển đổi XML (SVG, Android Vector) sang ảnh, hoặc tạo mã XML từ ảnh bằng AI.
        </p>
      </div>
    </header>
  );
};

export default Header;
