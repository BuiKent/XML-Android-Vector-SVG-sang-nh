
import React, { useState } from 'react';
import Header from './components/Header';
import XmlInput from './components/XmlInput';
import ImageViewer from './components/ImageViewer';
import ImageToXmlConverter from './components/ImageToXmlConverter';

const defaultXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="@color/nav_icon_selected"
        android:pathData="M10,20v-6h4v6h5v-8h3L12,3 2,12h3v8z"/>
</vector>`;

const App: React.FC = () => {
  const [xmlCode, setXmlCode] = useState<string>(defaultXml);
  const [mode, setMode] = useState<'xml-to-image' | 'image-to-xml'>('xml-to-image');

  const activeTabClass = 'bg-slate-700 text-white';
  const inactiveTabClass = 'text-slate-400 hover:bg-slate-800 hover:text-slate-200';

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header />

      <div className="flex justify-center p-4 border-b border-slate-800">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setMode('xml-to-image')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'xml-to-image' ? activeTabClass : inactiveTabClass}`}
            aria-pressed={mode === 'xml-to-image'}
          >
            XML sang Ảnh
          </button>
          <button
            onClick={() => setMode('image-to-xml')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'image-to-xml' ? activeTabClass : inactiveTabClass}`}
            aria-pressed={mode === 'image-to-xml'}
          >
            Ảnh sang XML (AI)
          </button>
        </div>
      </div>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 lg:p-6">
        {mode === 'xml-to-image' ? (
          <>
            <XmlInput value={xmlCode} onChange={setXmlCode} />
            <ImageViewer xmlString={xmlCode} />
          </>
        ) : (
          <ImageToXmlConverter />
        )}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Được tạo bởi một kỹ sư frontend React cao cấp.</p>
      </footer>
    </div>
  );
};

export default App;
