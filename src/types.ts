export type SectionType = 'text' | 'image' | 'video';

export interface ContentSection {
  id: string;
  type: SectionType;
  content: string;
  caption?: string;
}

export interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
  likes: number;
  reply?: string;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  heroImage: string;
  photographer?: string;
  addedDate: string;
  postedDate: string;
  section: string;
  type: string;
  series?: string;
  seriesIndex?: number;
  tags: string[];
  sections: ContentSection[];
  comments: CommentItem[];
}
