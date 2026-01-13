
import React, { useState } from 'react';
import { ChapterData } from './types.ts';
import FileUploader from './components/FileUploader.tsx';
import NovelTable from './components/NovelTable.tsx';
import { exportToExcel } from './utils/excelExport.ts';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    action: () => void;
    isDanger: boolean;
  } | null>(null);

  const handleFilesProcessed = (newChapters: ChapterData[]) => {
    setChapters(prev => [...prev, ...newChapters]);
  };

  const handleRemoveChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
  };

  const triggerRemoveBatch = (batchId: string) => {
    setConfirmConfig({
      title: '确认删除批次',
      message: '确定要删除这一批次的所有小说内容吗？此操作无法撤销。',
      isDanger: true,
      action: () => {
        const targetId = String(batchId).trim();
        setChapters(prev => prev.filter(c => String(c.importTimestamp).trim() !== targetId));
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const triggerClearAll = () => {
    setConfirmConfig({
      title: '确认清空列表',
      message: '警告：此操作将永久移除当前列表中所有的章节素材。',
      isDanger: true,
      action: () => {
        setChapters([]);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleExport = () => {
    if (chapters.length === 0) {
      alert('列表中没有可导出的内容');
      return;
    }
    const timestamp = new Date().getTime();
    exportToExcel(chapters, `小说解析导出_${timestamp}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {showConfirm && confirmConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${confirmConfig.isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{confirmConfig.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmConfig.action}
                className="flex-1 px-6 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 text-center">
        <div className="inline-block px-4 py-1.5 mb-4 text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
          Beidou Parser v4.2
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
          小说资源包<span className="text-blue-600">管理</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          批量解析素材章节，一键导出横排 Excel，高效助力内容创作。
        </p>
      </header>

      <main className="space-y-10">
        <section>
          <FileUploader 
            onFilesProcessed={handleFilesProcessed} 
            isLoading={isLoading} 
            setIsLoading={setIsLoading} 
          />
        </section>

        {chapters.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl gap-6 border border-slate-700">
            <div className="flex items-center gap-8 text-white">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">已载入章节</p>
                <p className="text-3xl font-black">{chapters.length}</p>
              </div>
              <div className="h-12 w-px bg-slate-800"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">独立书目</p>
                <p className="text-3xl font-black text-blue-400">
                  {new Set(chapters.map(c => c.novelTitle)).size}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                type="button"
                onClick={triggerClearAll} 
                className="flex-1 px-8 py-4 text-slate-400 font-bold hover:text-white hover:bg-red-500/10 transition-all rounded-2xl border border-slate-700"
              >
                清空列表
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-6 h-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                导出横排 Excel
              </button>
            </div>
          </div>
        )}

        <section>
          <NovelTable 
            chapters={chapters} 
            onRemove={handleRemoveChapter} 
            onRemoveBatch={triggerRemoveBatch}
          />
        </section>
      </main>

      <footer className="mt-24 text-center pb-12 border-t border-slate-200 pt-10">
        <p className="text-slate-400 text-sm font-medium">© 2025 北斗智影小说素材解析工具</p>
      </footer>
    </div>
  );
};

export default App;
