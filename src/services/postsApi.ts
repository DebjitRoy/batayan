import { CommentItem, ContentSection, Post } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const IMAGE_BASE_URL = 'https://bengali-blog-static-uploads.s3.amazonaws.com';
const DEFAULT_LIST_LIMIT = 100;

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiDetailResponse<T> {
  success: boolean;
  data: T;
}

interface ApiPostListItem {
  _id: string;
  title?: string;
  gist?: string;
  photoHero?: string;
  postType?: string;
  createdAt?: string;
  searchBy?: string[];
}

interface ApiContentBlock {
  _id: string;
  header?: string | null;
  content?: string | null;
  imgDescription?: string | null;
  video?: string | null;
  videoDescription?: string | null;
  image?: string | null;
}

interface ApiPost extends ApiPostListItem {
  content?: ApiContentBlock[];
  additionalInfo?: string;
  gallery?: string[];
}

interface ApiComment {
  _id: string;
  title?: string;
  description?: string;
  username?: string;
  createdAt?: string;
}

const sectionLabels: Record<string, string> = {
  travel: 'Travel',
  books: 'Essays',
  miscl: 'Miscellaneous',
  guest: 'Guest',
  gallery: 'Photo Gallery'
};

const normalizeDate = (value?: string) => (value ? value.slice(0, 10) : '');

const imageUrl = (value?: string | null) => {
  if (!value || value === 'no-photo.jpg') {
    return 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1200&q=80';
  }

  if (value.startsWith('http')) {
    return value;
  }

  return `${IMAGE_BASE_URL}/${value}`;
};

const videoUrl = (value: string) => {
  if (value.startsWith('http')) {
    return value.includes('watch?v=') ? value.replace('watch?v=', 'embed/') : value;
  }

  return `https://www.youtube.com/embed/${value}`;
};

const mapPostType = (postType?: string) => sectionLabels[postType ?? ''] ?? postType ?? 'Miscellaneous';

const mapSections = (post: ApiPost): ContentSection[] => {
  const sections: ContentSection[] = [];

  post.content?.forEach((block, index) => {
    if (block.header) {
      sections.push({
        id: `${block._id}-header`,
        type: 'text',
        content: block.header
      });
    }

    if (block.content) {
      sections.push({
        id: `${block._id}-content`,
        type: 'text',
        content: block.content
      });
    }

    if (block.image) {
      sections.push({
        id: `${block._id}-image`,
        type: 'image',
        content: imageUrl(block.image),
        caption: block.imgDescription ?? undefined
      });
    }

    if (block.video) {
      sections.push({
        id: `${block._id}-video`,
        type: 'video',
        content: videoUrl(block.video),
        caption: block.videoDescription ?? undefined
      });
    }

    if (!block.content && !block.image && !block.video && index === 0 && post.gist) {
      sections.push({
        id: `${block._id}-gist`,
        type: 'text',
        content: post.gist
      });
    }
  });

  post.gallery?.forEach((image, index) => {
    sections.push({
      id: `${post._id}-gallery-${index}`,
      type: 'image',
      content: imageUrl(image)
    });
  });

  return sections.length
    ? sections
    : [
        {
          id: `${post._id}-summary`,
          type: 'text',
          content: post.gist ?? ''
        }
      ];
};

const mapPost = (post: ApiPost): Post => {
  const section = mapPostType(post.postType);

  return {
    id: post._id,
    title: post.title ?? 'Untitled',
    summary: post.gist ?? '',
    heroImage: imageUrl(post.photoHero),
    photographer: post.additionalInfo,
    addedDate: normalizeDate(post.createdAt),
    postedDate: normalizeDate(post.createdAt),
    section,
    type: post.postType ?? section,
    tags: post.searchBy?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    sections: mapSections(post),
    comments: []
  };
};

const mapComment = (comment: ApiComment): CommentItem => ({
  id: comment._id,
  author: comment.username || comment.title || 'পাঠক',
  date: normalizeDate(comment.createdAt),
  text: comment.description ?? '',
  likes: 0
});

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPosts(limit = DEFAULT_LIST_LIMIT): Promise<Post[]> {
  const query = new URLSearchParams({
    limit: String(limit),
    page: '1',
    select: 'title,gist,photoHero,createdAt,postType,searchBy'
  });
  const response = await requestJson<ApiListResponse<ApiPostListItem>>(`/posts?${query.toString()}`);

  return response.data.map(mapPost);
}

export async function fetchPost(postId: string): Promise<Post> {
  const response = await requestJson<ApiDetailResponse<ApiPost>>(`/posts/${postId}`);

  return mapPost(response.data);
}

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  const response = await requestJson<ApiListResponse<ApiComment>>(`/posts/${postId}/comments`);

  return response.data.map(mapComment);
}
