export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  hint?: string;
}

export interface Pin {
  id: string;
  giver: User;
  receiver: User;
  reason: string;
  timestamp: Date;
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
  price: number;
  hint: string;
}
