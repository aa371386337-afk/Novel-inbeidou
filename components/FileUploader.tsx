
import React, { useRef } from 'react';
import { ChapterData } from '../types.ts';

interface FileUploaderProps {
  onFilesProcessed: (chapters: ChapterData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesProcessed, isLoading, setIsLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    const now = new Date();
    const importTimestamp = now.getTime().toString();
    const importDateStr = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const chapters: ChapterData[] = [];
    const fileArray = Array.from(files);
    const dirToNovelNameMap: Record<string, string> = {};
    
    fileArray.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const dirPath = pathParts.slice(0, -1).join('/');
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        dirToNovelNameMap[dirPath] = file.name.substring(0, file.name.lastIndexOf('.'));
      }
    });

    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'UTF-8');
      });
    };

    for (const file of fileArray) {
      if (file.name.toLowerCase().endsWith('.txt')) {
        try {
          const pathParts = file.webkitRelativePath.split('/');
          const dirPath = pathParts.slice(0, -1).join('/');
          let novelTitle = dirToNovelNameMap[dirPath] || (pathParts.length > 1 ? pathParts[pathParts.length - 2] : '未知小说');
          const content = await readFileContent(file);
          chapters.push({
            id: Math.random().toString(36).substr(2, 9),
            novelTitle,
            chapterTitle: file.name.replace('.txt', ''),
            content,
            fileName: file.name,
            fileSize: file.size,
            importTimestamp,
            importDateStr
          });
        } catch (error) { console.error(error); }
      }
    }

    onFilesProcessed(chapters);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 transition-colors cursor-pointer group shadow-sm">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800">导入素材资源包</h3>
        <p className="text-sm text-slate-500 mt-2 mb-8">
          解析 TXT 章节并自动以 PNG 图片名命名书名<br/>
          <span className="text-blue-500 font-medium">支持文件夹上传，保留层级结构</span>
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => folderInputRef.current?.click()} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-bold flex items-center gap-2">
            上传文件夹
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold flex items-center gap-2">
            选择文件
          </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".txt" onChange={(e) => processFiles(e.target.files)} />
        {/* Fix: webkitdirectory is a non-standard attribute in React types; bypass using object spread and as any */}
        <input type="file" ref={folderInputRef} className="hidden" {...({ webkitdirectory: "true" } as any)} multiple onChange={(e) => processFiles(e.target.files)} />
      </div>
      {isLoading && <div className="mt-8 flex items-center gap-3 text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-2xl animate-pulse">解析中...</div>}
    </div>
  );
};

export default FileUploader;
