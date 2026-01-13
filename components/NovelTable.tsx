
import React, { useState, useMemo } from 'react';
import { ChapterData } from '../types.ts';

interface NovelTableProps {
  chapters: ChapterData[];
  onRemove: (id: string) => void;
  onRemoveBatch: (batchId: string) => void;
}

const NovelTable: React.FC<NovelTableProps> = ({ chapters, onRemove, onRemoveBatch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const groupedChapters = useMemo(() => {
    const groupsMap = new Map<string, { date: string, items: ChapterData[], batchId: string }>();
    chapters.forEach(c => {
      const bid = String(c.importTimestamp).trim();
      if (!groupsMap.has(bid)) {
        groupsMap.set(bid, { date: c.importDateStr, items: [], batchId: bid });
      }
      groupsMap.get(bid)!.items.push(c);
    });
    return Array.from(groupsMap.values()).sort((a, b) => b.batchId.localeCompare(a.batchId));
  }, [chapters]);

  if (chapters.length === 0) return null;

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-200 flex items-center gap-4 shadow-sm focus-within:border-blue-500 transition-all">
        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索已导入的小说、章节标题..."
          className="flex-1 bg-transparent border-none outline-none text-base text-slate-700 font-medium placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-16">
        {groupedChapters.map((group) => {
          const filtered = group.items.filter(c => 
            c.novelTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (filtered.length === 0 && searchTerm) return null;

          return (
            <div key={group.batchId} className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-10 py-10 bg-slate-50/50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-8">
                <div className="flex items-center gap-12">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-2">批次时间</span>
                    <span className="text-slate-900 font-black text-2xl">{group.date}</span>
                  </div>
                  <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-2">章节总数</span>
                    <span className="text-blue-600 font-black text-2xl">{group.items.length}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBatch(group.batchId)}
                  className="px-10 py-5 bg-red-600 text-white text-base font-black rounded-[1.25rem] hover:bg-red-700 transition-all flex items-center gap-3 shadow-lg active:scale-95"
                >
                  删除此批次
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase font-black tracking-widest border-b border-slate-50">
                      <th className="px-10 py-6">书名</th>
                      <th className="px-10 py-6">章节</th>
                      <th className="px-10 py-6">内容</th>
                      <th className="px-10 py-6 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((chapter) => (
                      <tr key={chapter.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-10 py-7 text-base font-black text-slate-800">{chapter.novelTitle}</td>
                        <td className="px-10 py-7 text-base text-slate-500 font-bold">{chapter.chapterTitle}</td>
                        <td className="px-10 py-7 text-sm text-slate-400 truncate max-w-[300px]">{chapter.content.substring(0, 50)}...</td>
                        <td className="px-10 py-7 text-right">
                          <button onClick={() => onRemove(chapter.id)} className="text-slate-200 hover:text-red-500 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NovelTable;
