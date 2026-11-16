// Mock data for Worker / Mistri Profile, Availability, Alerts, Bookings, Wallet & Tutorials

export const INITIAL_WORKER_PROFILE = {
  id: 'w-me',
  name: '',
  avatar: '',
  color: '#4F46E5',
  skill: 'Master Mason (राजमिस्त्री)',
  price: 950,
  priceType: 'day', // 'day' | 'hour'
  isAvailable: true, // Online / Available for work in 15km
  kycVerified: true,
  rating: 5.0,
  reviewsCount: 0,
  completedJobsCount: 0,
  phone: '',
  location: '',
  bio: '',
};

export const WORKER_TUTORIALS = [
  {
    id: 'tut-1',
    title: 'How to Get 5-Star Ratings on Mistri Pro',
    hindiTitle: 'मिस्त्री प्रो पर 5-स्टार रेटिंग और ज्यादा काम कैसे पाएं',
    duration: '4:20 min',
    channel: 'Mistri Pro Academy',
    youtubeId: 'dQw4w9WgXcQ', // Playable or direct YouTube link
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    views: '14.2K views',
    tag: 'Tips & Growth',
  },
  {
    id: 'tut-2',
    title: 'Site Safety & PPE Gear Standard Rules',
    hindiTitle: 'कंस्ट्रक्शन साइट सुरक्षा नियम और सेफ्टी हेलमेट/बूट्स गाइड',
    duration: '5:45 min',
    channel: 'Safety Standards India',
    youtubeId: '3JZ_D3ELwOQ',
    url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
    views: '9.8K views',
    tag: 'Safety Guide',
  },
  {
    id: 'tut-3',
    title: 'How Escrow Payments & Digital Payouts Work',
    hindiTitle: 'एस्क्रो पेमेंट कैसे काम करता है और सीधे बैंक में पैसे निकालें',
    duration: '3:50 min',
    channel: 'Mistri Pro Finance',
    youtubeId: 'L_LUpnjgPso',
    url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    thumbnail: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
    views: '22.1K views',
    tag: 'Payments',
  },
  {
    id: 'tut-4',
    title: 'How to Speak with Customers Professionally',
    hindiTitle: 'ग्राहकों से बातचीत और कोटेशन तय करने का सही तरीका',
    duration: '6:10 min',
    channel: 'Karigar Vikas',
    youtubeId: 'kJQP7kiw5Fk',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    views: '11.5K views',
    tag: 'Customer Skills',
  },
];

export const INITIAL_ALERTS = [];

export const INITIAL_WORKER_BOOKINGS = [];

export const INITIAL_WALLET = {
  availableBalance: 0,
  thisWeekEarnings: 0,
  totalLifetimeEarnings: 0,
  escrowLocked: 0,
  transactions: [],
};
