// Mock workers with GPS coordinates for nearby worker feature
export const MOCK_WORKERS = [
  {
    id: 'w1', name: 'Ram Singh Mistri', skill: 'Master Mason', category: 'Mason (Raj Mistri)',
    exp: 14, rating: 4.9, reviews: 84, rate: 1100, rateType: 'day',
    area: 'Vaishali Nagar, Jaipur', verified: true, avatar: 'RS', color: '#5B4EFF',
    phone: '+91 98765 43201', available: true,
    lat: 26.9196, lng: 75.7335, distance: 2.3,
  },
  {
    id: 'w2', name: 'Mukesh Sharma', skill: 'Senior Electrician', category: 'Electrician',
    exp: 8, rating: 4.8, reviews: 62, rate: 850, rateType: 'day',
    area: 'Malviya Nagar, Jaipur', verified: true, avatar: 'MS', color: '#0284C7',
    phone: '+91 98765 43202', available: true,
    lat: 26.8612, lng: 75.8064, distance: 3.8,
  },
  {
    id: 'w3', name: 'Devraj Gurjar', skill: 'Lead Plumber', category: 'Plumber',
    exp: 11, rating: 4.9, reviews: 96, rate: 950, rateType: 'day',
    area: 'Mansarovar, Jaipur', verified: true, avatar: 'DG', color: '#10B981',
    phone: '+91 98765 43203', available: true,
    lat: 26.8550, lng: 75.7664, distance: 5.1,
  },
  {
    id: 'w4', name: 'Pooja Verma', skill: 'Interior & Modular', category: 'Furniture Carpenter',
    exp: 6, rating: 5.0, reviews: 41, rate: 1400, rateType: 'day',
    area: 'C-Scheme, Jaipur', verified: true, avatar: 'PV', color: '#8B5CF6',
    phone: '+91 98765 43204', available: true,
    lat: 26.9060, lng: 75.7909, distance: 1.2,
  },
  {
    id: 'w5', name: 'Kishan Meena', skill: 'Tile Expert', category: 'Tile & Marble',
    exp: 9, rating: 4.7, reviews: 55, rate: 900, rateType: 'day',
    area: 'Jagatpura, Jaipur', verified: true, avatar: 'KM', color: '#F59E0B',
    phone: '+91 98765 43205', available: true,
    lat: 26.8327, lng: 75.8416, distance: 7.4,
  },
  {
    id: 'w6', name: 'Suresh Yadav', skill: 'Wall Painter', category: 'Wall Painter',
    exp: 12, rating: 4.8, reviews: 73, rate: 800, rateType: 'day',
    area: 'Sodala, Jaipur', verified: true, avatar: 'SY', color: '#EC4899',
    phone: '+91 98765 43206', available: false,
    lat: 26.9280, lng: 75.7750, distance: 4.2,
  },
  {
    id: 'w7', name: 'Rohit Jangid', skill: 'Shuttering Expert', category: 'Shuttering Carpenter',
    exp: 7, rating: 4.6, reviews: 38, rate: 1050, rateType: 'day',
    area: 'Sirsi Road, Jaipur', verified: true, avatar: 'RJ', color: '#6366F1',
    phone: '+91 98765 43207', available: true,
    lat: 26.9100, lng: 75.7400, distance: 3.1,
  },
  {
    id: 'w8', name: 'Mahesh Prajapati', skill: 'AC Installation', category: 'AC Technician',
    exp: 5, rating: 4.5, reviews: 28, rate: 750, rateType: 'day',
    area: 'Tonk Road, Jaipur', verified: false, avatar: 'MP', color: '#14B8A6',
    phone: '+91 98765 43208', available: true,
    lat: 26.8720, lng: 75.7970, distance: 6.0,
  },
  {
    id: 'w9', name: 'Bhagwan Saini', skill: 'Welder & Fabricator', category: 'Welder',
    exp: 15, rating: 4.9, reviews: 101, rate: 1200, rateType: 'day',
    area: 'Sanganer, Jaipur', verified: true, avatar: 'BS', color: '#EF4444',
    phone: '+91 98765 43209', available: true,
    lat: 26.8200, lng: 75.7900, distance: 9.5,
  },
  {
    id: 'w10', name: 'Laxmi Devi', skill: 'Cleaning Expert', category: 'Cleaning & Housekeeping',
    exp: 4, rating: 4.7, reviews: 45, rate: 500, rateType: 'day',
    area: 'Raja Park, Jaipur', verified: true, avatar: 'LD', color: '#A855F7',
    phone: '+91 98765 43210', available: true,
    lat: 26.9150, lng: 75.8100, distance: 2.8,
  },
  {
    id: 'w11', name: 'Pappu Khan', skill: 'Steel Fixer', category: 'Steel Fixer / Bar Bender',
    exp: 10, rating: 4.6, reviews: 67, rate: 950, rateType: 'day',
    area: 'Durgapura, Jaipur', verified: true, avatar: 'PK', color: '#0891B2',
    phone: '+91 98765 43211', available: true,
    lat: 26.8650, lng: 75.7500, distance: 8.2,
  },
  {
    id: 'w12', name: 'Ganesh Kumawat', skill: 'POP & Ceiling', category: 'POP & False Ceiling',
    exp: 6, rating: 4.8, reviews: 34, rate: 850, rateType: 'day',
    area: 'Shyam Nagar, Jaipur', verified: true, avatar: 'GK', color: '#D946EF',
    phone: '+91 98765 43212', available: true,
    lat: 26.9050, lng: 75.7600, distance: 4.6,
  },
];

// Mock bookings data
export const MOCK_BOOKINGS = [
  {
    id: 'B-001', workerName: 'Ram Singh Mistri', workerAvatar: 'RS', workerColor: '#5B4EFF',
    category: 'Mason', title: 'Kitchen Wall Construction',
    date: '15 Nov 2026', time: '9:00 AM', status: 'active',
    location: 'Vaishali Nagar, Jaipur', amount: '₹4,400', duration: '4 days',
  },
  {
    id: 'B-002', workerName: 'Mukesh Sharma', workerAvatar: 'MS', workerColor: '#0284C7',
    category: 'Electrician', title: 'Complete Wiring - 3BHK',
    date: '18 Nov 2026', time: '10:00 AM', status: 'active',
    location: 'C-Scheme, Jaipur', amount: '₹2,550', duration: '3 days',
  },
  {
    id: 'B-003', workerName: 'Pooja Verma', workerAvatar: 'PV', workerColor: '#8B5CF6',
    category: 'Carpenter', title: 'Modular Kitchen Installation',
    date: '10 Nov 2026', time: '8:30 AM', status: 'completed',
    location: 'Malviya Nagar, Jaipur', amount: '₹8,400', duration: '6 days',
  },
  {
    id: 'B-004', workerName: 'Devraj Gurjar', workerAvatar: 'DG', workerColor: '#10B981',
    category: 'Plumber', title: 'Bathroom Pipeline Fix',
    date: '8 Nov 2026', time: '11:00 AM', status: 'cancelled',
    location: 'Mansarovar, Jaipur', amount: '₹950', duration: '1 day',
  },
];
