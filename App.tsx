
import React, { useState } from 'react';
import Header from './components/Header';
import XmlInput from './components/XmlInput';
import ImageViewer from './components/ImageViewer';

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

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 lg:p-6">
        <XmlInput value={xmlCode} onChange={setXmlCode} />
        <ImageViewer xmlString={xmlCode} />
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Được tạo bởi một kỹ sư frontend React cao cấp.</p>
      </footer>
    </div>
  );
};

export default App;
