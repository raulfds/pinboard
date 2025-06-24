import type { User, Pin, Avatar } from '@/types';

export const users: User[] = [
  { id: 'user-1', name: 'Alex', email: 'alex@example.com', avatar: 'https://placehold.co/100x100.png', points: 150 },
  { id: 'user-2', name: 'Maria', email: 'maria@example.com', avatar: 'https://placehold.co/100x100.png', points: 25 },
  { id: 'user-3', name: 'David', email: 'david@example.com', avatar: 'https://placehold.co/100x100.png', points: 88 },
  { id: 'user-4', name: 'Sophia', email: 'sophia@example.com', avatar: 'https://placehold.co/100x100.png', points: 12 },
  { id: 'user-5', name: 'Chen', email: 'chen@example.com', avatar: 'https://placehold.co/100x100.png', points: 42 },
];

export const pins: Pin[] = [
  {
    id: 'pin-1',
    giver: users[1],
    receiver: users[0],
    reason: 'A build quebrou de novo!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'pin-2',
    giver: users[2],
    receiver: users[1],
    reason: 'Esqueceu de mutar na reunião geral.',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
  },
  {
    id: 'pin-3',
    giver: users[0],
    receiver: users[2],
    reason: 'Usou "Responder a Todos" em um e-mail para toda a empresa.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'pin-4',
    giver: users[3],
    receiver: users[0],
    reason: 'A máquina de café está vazia.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'pin-5',
    giver: users[4],
    receiver: users[3],
    reason: 'Meu PR está aguardando revisão há 3 dias.',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
];

export const avatars: Avatar[] = [
  { id: 'avatar-1', name: 'Ember', image: 'https://placehold.co/200x200.png', price: 0, hint: 'fire character' },
  { id: 'avatar-2', name: 'Anger', image: 'https://placehold.co/200x200.png', price: 50, hint: 'red angry' },
  { id: 'avatar-3', name: 'Hades', image: 'https://placehold.co/200x200.png', price: 75, hint: 'blue flame' },
  { id: 'avatar-4', name: 'The Hulk', image: 'https://placehold.co/200x200.png', price: 100, hint: 'green monster' },
  { id: 'avatar-5', name: 'Red Queen', image: 'https://placehold.co/200x200.png', price: 120, hint: 'queen big head' },
  { id: 'avatar-6', name: 'Maleficent', image: 'https://placehold.co/200x200.png', price: 150, hint: 'evil fairy' },
];

// Set initial avatar for all users
users.forEach(user => {
  user.avatar = avatars[0].image;
  user.hint = avatars[0].hint;
});
