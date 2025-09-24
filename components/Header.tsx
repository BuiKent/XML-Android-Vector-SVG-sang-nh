
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 lg:p-6 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Trình chuyển đổi XML sang ảnh
        </h1>
        <p className="text-slate-400 mt-1">
          Dán mã XML (ví dụ: SVG, Android Vector Drawable) của bạn vào bên dưới để xem trực tiếp. Sau đó, tải xuống dưới dạng PNG hoặc JPG.
        </p>
      </div>
    </header>
  );
};

export default Header;
