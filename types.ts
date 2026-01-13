
export interface ChapterData {
  id: string;
  novelTitle: string;
  chapterTitle: string;
  content: string;
  fileName: string;
  fileSize: number;
  importTimestamp: string; // Changed to string for robust matching
  importDateStr: string;    // For display: YYYY-MM-DD HH:mm:ss
}

export interface NovelPackage {
  title: string;
  chapters: ChapterData[];
  coverImage?: string; // Base64 or URL
  totalChapters: number;
}
