import { CommentItem, ContentSection, Post } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const IMAGE_BASE_URL = 'https://bengali-blog-static-uploads.s3.amazonaws.com';
const DEFAULT_LIST_LIMIT = 100;

interface ApiListResponse<T> {
  items: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ApiPostListItem {
  _id: string;
  title?: string;
  gist?: string;
  photoHero?: string;
  postType?: string;
  createdAt?: string;
  visited?: number;
  liked?: number;
  gallery?: string[];
  content?: ApiContentBlock[];
  series?: unknown;
  searchBy?: string[];
  additionalInfo?: string;
  isSeries?: boolean;
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
  gallery?: string[];
}

interface ApiComment {
  _id: string;
  title?: string;
  description?: string;
  username?: string;
  createdAt?: string;
  reply?: string;
  post?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  token: string;
}

export interface CreatePostSectionInput {
  header: string;
  content: string;
  imageFile?: File | null;
  imgDescription?: string;
  video?: string;
  videoDescription?: string;
}

export interface CreatePostInput {
  title: string;
  postType: string;
  gist: string;
  content: CreatePostSectionInput[];
  searchBy: string[];
  additionalInfo?: string;
  heroImageFile?: File | null;
}

export interface CreateCommentInput {
  username: string;
  title?: string;
  description: string;
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

export const normalizePostType = (postType?: string | null) => {
  if (!postType) return undefined;

  const value = postType.trim().toLowerCase();
  const aliases: Record<string, string> = {
    travel: 'travel',
    travels: 'travel',
    essay: 'books',
    essays: 'books',
    book: 'books',
    books: 'books',
    misc: 'miscl',
    miscellaneous: 'miscl',
    miscl: 'miscl',
    guest: 'guest',
    'guest-column': 'guest',
    gallery: 'gallery',
    photos: 'gallery',
    photo: 'gallery'
  };

  return aliases[value] ?? value;
};

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
  likes: 0,
  reply: comment.reply || undefined
});

const authHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export async function fetchPosts(limit = DEFAULT_LIST_LIMIT, postType?: string, search?: string): Promise<Post[]> {
  const normalizedPostType = normalizePostType(postType);
  const trimmedSearch = search?.trim();
  const query = new URLSearchParams({
    limit: String(normalizedPostType ? Math.max(limit, DEFAULT_LIST_LIMIT) : limit),
    page: '1',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  if (trimmedSearch && trimmedSearch.length >= 2) {
    query.set('search', trimmedSearch);
    query.set('expanded', true.toString());
  }

  const response = await requestJson<ApiListResponse<ApiPostListItem>>(`/posts?${query.toString()}`);
  const posts = response.items.map(mapPost);

  if (!normalizedPostType) {
    return posts;
  }

  return posts.filter((post) => normalizePostType(post.type) === normalizedPostType).slice(0, limit);
}

export async function fetchLatestPost(postType?: string): Promise<Post | undefined> {
  const posts = await fetchPosts(1, postType);

  return posts[0];
}

export async function fetchPost(postId: string): Promise<Post> {
  const response = await requestJson<ApiPost>(`/posts/${postId}`);

  return mapPost(response);
}

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  const response = await requestJson<ApiListResponse<ApiComment>>(`/posts/${postId}/comments`);

  return response.items.map(mapComment);
}

export async function loginAuthor(email: string, password: string) {
  return requestJson<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });
}

export async function createPost(input: CreatePostInput, token: string): Promise<Post> {
  const createdPost = await requestJson<ApiPost>('/posts', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      title: input.title,
      postType: normalizePostType(input.postType),
      gist: input.gist,
      content: input.content.map((section) => ({
        header: section.header,
        content: section.content,
        image: '',
        imgDescription: section.imgDescription ?? '',
        video: section.video ?? '',
        videoDescription: section.videoDescription ?? ''
      })),
      searchBy: input.searchBy,
      additionalInfo: input.additionalInfo ?? ''
    })
  });

  let currentPost = createdPost;

  if (input.heroImageFile) {
    const uploadResponse = await requestJson<{ imageUrl: string; post: ApiPost }>(`/posts/${createdPost._id}/upload`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        fileName: input.heroImageFile.name,
        contentType: input.heroImageFile.type,
        dataBase64: await fileToBase64(input.heroImageFile)
      })
    });
    currentPost = uploadResponse.post;
  }

  for (const [index, section] of input.content.entries()) {
    const sectionId = currentPost.content?.[index]?._id ?? createdPost.content?.[index]?._id;
    if (!section.imageFile || !sectionId) continue;

    const uploadResponse = await requestJson<{ imageUrl: string; post: ApiPost }>(`/posts/${createdPost._id}/sectionupload/${sectionId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        fileName: section.imageFile.name,
        contentType: section.imageFile.type,
        dataBase64: await fileToBase64(section.imageFile)
      })
    });
    currentPost = uploadResponse.post;
  }

  return mapPost(currentPost);
}

export async function updatePost(postId: string, input: CreatePostInput, token: string): Promise<Post> {
  const updatedPost = await requestJson<ApiPost>(`/posts/${postId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      title: input.title,
      postType: normalizePostType(input.postType),
      gist: input.gist,
      content: input.content.map((section) => ({
        header: section.header,
        content: section.content,
        image: '',
        imgDescription: section.imgDescription ?? '',
        video: section.video ?? '',
        videoDescription: section.videoDescription ?? ''
      })),
      searchBy: input.searchBy,
      additionalInfo: input.additionalInfo ?? ''
    })
  });

  let currentPost = updatedPost;

  if (input.heroImageFile) {
    const uploadResponse = await requestJson<{ imageUrl: string; post: ApiPost }>(`/posts/${postId}/upload`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        fileName: input.heroImageFile.name,
        contentType: input.heroImageFile.type,
        dataBase64: await fileToBase64(input.heroImageFile)
      })
    });
    currentPost = uploadResponse.post;
  }

  for (const [index, section] of input.content.entries()) {
    const sectionId = currentPost.content?.[index]?._id;
    if (!section.imageFile || !sectionId) continue;

    const uploadResponse = await requestJson<{ imageUrl: string; post: ApiPost }>(`/posts/${postId}/sectionupload/${sectionId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        fileName: section.imageFile.name,
        contentType: section.imageFile.type,
        dataBase64: await fileToBase64(section.imageFile)
      })
    });
    currentPost = uploadResponse.post;
  }

  return mapPost(currentPost);
}

export async function deletePost(postId: string, token: string) {
  return requestJson<{ deleted: boolean; id: string }>(`/posts/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
}

export async function createComment(postId: string, input: CreateCommentInput): Promise<CommentItem> {
  const response = await requestJson<ApiComment>(`/posts/${postId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      username: input.username,
      title: input.title ?? '',
      description: input.description,
      reply: ''
    })
  });

  return mapComment(response);
}
