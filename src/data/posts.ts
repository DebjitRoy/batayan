import { Post } from '../types';

export const posts: Post[] = [
  {
    id: 'sundarban-morning',
    title: 'সুন্দরবনের সকালে',
    summary: 'ভোরের আলোয় নদীর ধারে সুন্দরবনের নীরবতা ও জীবনের অদ্ভুত মিশ্র অনুভব।',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    photographer: 'ফটো: মিনি ঘটক',
    addedDate: '2026-05-20',
    postedDate: '2026-05-15',
    section: 'Travel',
    type: 'Travel',
    series: {
      seriesId: 'sundarban-series',
      title: 'সুন্দরবন সফর',
      totalParts: 3,
    part: 1,
    posts: [
      {
        postId: 'sundarban-morning',
        title: 'সুন্দরবনের সকালে',
        part: 1
      }]
    },
    tags: ['সফর', 'প্রকৃতি', 'নদী'],
    sections: [
      {
        id: 't1',
        type: 'text',
        content: 'সকাল হওয়া মানেই একটি নতুন সফরের শুরু। সুন্দরবনের নীলা আকাশ ও ঠান্ডা হাওয়া আমার মনে শান্তি এনে দেয়।'
      },
      {
        id: 't2',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80',
        caption: 'সুন্দরবনের জলরাশির শান্তি'
      },
      {
        id: 't3',
        type: 'text',
        content: 'এই যাত্রায় লোকেদের হাসি, নৌকার শব্দ ও পাখির ডাক এক অভূতপূর্ব সংগীত তৈরি করে।'
      },
      {
        id: 't4',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1518241353330-7cc6f720dc64?auto=format&fit=crop&w=1200&q=80',
        caption: 'গভীর বন ও হালকা তুষার মেঘ'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'রবি',
        date: '2026-05-21',
        text: 'আপনার লেখাটি খুব সুন্দর লাগলো, সুন্দরবনের কথা মনে করিয়ে দিলো।',
        likes: 2,
        reply: 'ধন্যবাদ, রবি ভাই। আরো গল্প soon আসছে।'
      }
    ]
  },
  {
    id: 'book-cafe',
    title: 'কফি ও বইয়ের সন্ধ্যা',
    summary: 'একটি শহরের বইপাড়া যেখানে গন্ধ এবং কথার মিলন হয়।',
    heroImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    photographer: 'ফটো: শ্যাম',
    addedDate: '2026-05-18',
    postedDate: '2026-05-14',
    section: 'Essays',
    type: 'Essay',
    tags: ['বই', 'শহর', 'জীবন'],
    sections: [
      {
        id: 'e1',
        type: 'text',
        content: 'কফির কাপ বেয়ে বইয়ের পাতায় ভাষার গন্ধ মিলে যায়। প্রতিটি পাতা যেন একজন বন্ধুর মুখ।'
      },
      {
        id: 'e2',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1516156008625-3a3e8e95d0ab?auto=format&fit=crop&w=1200&q=80',
        caption: 'বইয়ের মিলনস্থল'
      },
      {
        id: 'e3',
        type: 'text',
        content: 'শবনম-রাতের আলোয় কফি সেরে ওঠে কথার মাঝে, আর বইগুলি গোপনে জানতে চায় এক একটি গল্প।'
      }
    ],
    comments: [
      {
        id: 'c2',
        author: 'প্রিয়া',
        date: '2026-05-19',
        text: 'এই ধরনের লেখা দীর্ঘক্ষণ মনে থেকে যায়। ধন্যবাদ।',
        likes: 5
      }
    ]
  },
  {
    id: 'film-memories',
    title: 'চলচ্চিত্র ও স্মৃতি',
    summary: 'ফিল্মের জগতের ছোট ছোট গল্প আর জীবনের এতোটুকু রঙ।',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    addedDate: '2026-05-22',
    postedDate: '2026-05-20',
    section: 'Essays',
    type: 'Essay',
    tags: ['চলচ্চিত্র', 'স্মৃতি', 'সাহিত্য'],
    sections: [
      {
        id: 'f1',
        type: 'text',
        content: 'সিঁথির ওপর বসে পুরনো ছবির কথা ভাবা আরও একবার জীবনের সিনেমা দেখতে পাওয়া।'
      },
      {
        id: 'f2',
        type: 'video',
        content: 'https://www.youtube.com/embed/8aVyMoirpcU'
      },
      {
        id: 'f3',
        type: 'text',
        content: 'চলচ্চিত্রের প্রত্যেক ফ্রেমে খুঁজে পাওয়া যায় একটি স্মরণের মৃদু নীরবতা।'
      }
    ],
    comments: [
      {
        id: 'c3',
        author: 'সোহিনী',
        date: '2026-05-22',
        text: 'ভিডিওটি এবং ভাষা উভয়ই খুব স্পর্শকাতর।',
        likes: 3,
        reply: 'আপনার মন্তব্য আমার জন্য খুব মূল্যবান, সোহিনী।'
      }
    ]
  }
];
