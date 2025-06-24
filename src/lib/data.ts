import type { User, Pin, Avatar } from '@/types';

export const initialAvatars: Avatar[] = [
  { id: 'avatar-1', name: 'Ember', image: 'https://placehold.co/200x200.png', price: 0, hint: 'fire character' },
  { id: 'avatar-2', name: 'Anger', image: 'https://placehold.co/200x200.png', price: 50, hint: 'red angry' },
  { id: 'avatar-3', name: 'Hades', image: 'https://placehold.co/200x200.png', price: 75, hint: 'blue flame' },
  { id: 'avatar-4', name: 'The Hulk', image: 'https://placehold.co/200x200.png', price: 100, hint: 'green monster' },
  { id: 'avatar-5', name: 'Red Queen', image: 'https://placehold.co/200x200.png', price: 120, hint: 'queen big head' },
  { id: 'avatar-6', name: 'Maleficent', image: 'https://placehold.co/200x200.png', price: 150, hint: 'evil fairy' },
];

export const initialUsers: User[] = [
  { id: 'user-1', uid: 'uid-1', name: 'Alex', email: 'alex@example.com', avatar: initialAvatars[0].image, points: 150, role: 'user', hint: initialAvatars[0].hint },
  { id: 'user-2', uid: 'uid-2', name: 'Maria', email: 'maria@example.com', avatar: initialAvatars[0].image, points: 25, role: 'user', hint: initialAvatars[0].hint },
  { id: 'user-3', uid: 'uid-3', name: 'David', email: 'david@example.com', avatar: initialAvatars[0].image, points: 88, role: 'user', hint: initialAvatars[0].hint },
  { id: 'user-4', uid: 'uid-4', name: 'Sophia', email: 'sophia@example.com', avatar: initialAvatars[0].image, points: 12, role: 'user', hint: initialAvatars[0].hint },
  { id: 'user-5', uid: 'uid-5', name: 'Chen', email: 'chen@example.com', avatar: initialAvatars[0].image, points: 42, role: 'user', hint: initialAvatars[0].hint },
  { id: 'user-admin', uid: 'uid-admin', name: 'Raul Ferreira', email: 'raulferreiradesouza@gmail.com', avatar: initialAvatars[0].image, points: 999, role: 'admin', hint: initialAvatars[0].hint },
];

export const initialPins: Pin[] = [
  {
    id: 'pin-1',
    giver: initialUsers[1],
    receiver: initialUsers[0],
    reason: 'A build quebrou de novo!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'pin-2',
    giver: initialUsers[2],
    receiver: initialUsers[1],
    reason: 'Esqueceu de mutar na reunião geral.',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
  },
  {
    id: 'pin-3',
    giver: initialUsers[0],
    receiver: initialUsers[2],
    reason: 'Usou "Responder a Todos" em um e-mail para toda a empresa.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'pin-4',
    giver: initialUsers[3],
    receiver: initialUsers[0],
    reason: 'A máquina de café está vazia.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'pin-5',
    giver: initialUsers[4],
    receiver: initialUsers[3],
    reason: 'Meu PR está aguardando revisão há 3 dias.',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
];
