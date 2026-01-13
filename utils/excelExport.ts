
import { ChapterData } from '../types.ts';

declare const XLSX: any;

const sortChapters = (chapters: ChapterData[]) => {
  return [...chapters].sort((a, b) => {
    const numA = parseInt(a.chapterTitle.replace(/\D/g, ''));
    const numB = parseInt(b.chapterTitle.replace(/\D/g, ''));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.chapterTitle.localeCompare(b.chapterTitle, 'zh-CN');
  });
};

const getChapterHeader = (index: number) => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
  return index <= 20 ? `第${chineseNums[index]}章` : `第${index}章`;
};

export const exportToExcel = (data: ChapterData[], filename: string = '小说导出素材.xlsx') => {
  if (!data || data.length === 0) return;
  const grouped: Record<string, ChapterData[]> = {};
  data.forEach(item => {
    if (!grouped[item.novelTitle]) grouped[item.novelTitle] = [];
    grouped[item.novelTitle].push(item);
  });
  let maxChapterCount = 0;
  Object.values(grouped).forEach(chapters => {
    if (chapters.length > maxChapterCount) maxChapterCount = chapters.length;
  });
  const headers = ['书名'];
  for (let i = 1; i <= maxChapterCount; i++) headers.push(getChapterHeader(i));
  const rows = Object.entries(grouped).map(([title, chapters]) => {
    const sorted = sortChapters(chapters);
    const rowData: any = { '书名': title };
    for (let i = 0; i < maxChapterCount; i++) {
      rowData[headers[i + 1]] = sorted[i] ? sorted[i].content : '';
    }
    return rowData;
  });
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  worksheet['!cols'] = [{ wch: 30 }, ...Array(maxChapterCount).fill({ wch: 100 })];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "小说横排素材");
  XLSX.writeFile(workbook, filename);
};
