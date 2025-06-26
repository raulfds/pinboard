export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  hint?: string;
  role: 'admin' | 'user';
}

export interface Pin {
  id: string;
  giver: User;
  receiver: User;
  reason: string;
  timestamp: Date;
  haha_votes?: number;
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
  price: number;
  hint: string;
}
