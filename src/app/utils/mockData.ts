import { auth, User } from './auth';
import { PostData } from '../components/Post';

export interface UserProfile extends User {
  coverPhoto?: string;
  followers: number;
  following: number;
  posts: number;
  photos: number;
  joinedDate: string;
  friends: string[];
  stories: Story[];
}

export interface Story {
  id: string;
  image: string;
  title: string;
  timestamp: string;
}

// Datos de usuarios simulados
export const mockUsers: Record<string, UserProfile> = {
  'maria@nexly.com': {
    id: 'maria@nexly.com',
    email: 'maria@nexly.com',
    name: 'María García',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: '📸 Fotógrafa profesional | 🌍 Viajera | ✨ Amante de la naturaleza',
    location: 'Madrid, España',
    website: 'https://mariagarcia.com',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    followers: 2543,
    following: 432,
    posts: 156,
    photos: 89,
    joinedDate: 'Marzo 2023',
    friends: ['carlos@nexly.com', 'ana@nexly.com'],
    stories: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
        title: 'Día en la playa',
        timestamp: 'Hace 3h'
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1682687221175-fd40bbafe6c7?w=400',
        title: 'Atardecer',
        timestamp: 'Hace 5h'
      }
    ]
  },
  'carlos@nexly.com': {
    id: 'carlos@nexly.com',
    email: 'carlos@nexly.com',
    name: 'Carlos Rodríguez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: '👨‍🍳 Chef apasionado | 🍝 Cocina italiana | 📍 Barcelona',
    location: 'Barcelona, España',
    website: 'https://carloscocina.com',
    coverPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    followers: 1834,
    following: 567,
    posts: 243,
    photos: 156,
    joinedDate: 'Enero 2023',
    friends: ['maria@nexly.com', 'ana@nexly.com'],
    stories: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1700137805953-c5708d9cd955?w=400',
        title: 'Nueva receta',
        timestamp: 'Hace 2h'
      }
    ]
  },
  'ana@nexly.com': {
    id: 'ana@nexly.com',
    email: 'ana@nexly.com',
    name: 'Ana López',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: '🎥 Creadora de contenido | 📱 Tech & Lifestyle | ✨ Valencia',
    location: 'Valencia, España',
    website: 'https://analopez.es',
    coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    followers: 3421,
    following: 234,
    posts: 389,
    photos: 234,
    joinedDate: 'Febrero 2023',
    friends: ['maria@nexly.com', 'carlos@nexly.com'],
    stories: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1694878982098-1cec80d96eca?w=400',
        title: 'Tutorial del día',
        timestamp: 'Hace 1h'
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400',
        title: 'Behind the scenes',
        timestamp: 'Hace 4h'
      },
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400',
        title: 'Nuevo setup',
        timestamp: 'Hace 6h'
      }
    ]
  },
  'diego@nexly.com': {
    id: 'diego@nexly.com',
    email: 'diego@nexly.com',
    name: 'Diego Martínez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: '🏔️ Aventurero | 🎿 Deportes extremos | 📷 Fotografía de naturaleza',
    location: 'Granada, España',
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    followers: 1256,
    following: 345,
    posts: 178,
    photos: 145,
    joinedDate: 'Abril 2023',
    friends: ['maria@nexly.com'],
    stories: []
  },
  'sofia@nexly.com': {
    id: 'sofia@nexly.com',
    email: 'sofia@nexly.com',
    name: 'Sofía Torres',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: '💪 Fitness coach | 🧘 Yoga & Wellness | 🌱 Vida saludable',
    location: 'Sevilla, España',
    website: 'https://sofiafitness.com',
    coverPhoto: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
    followers: 4532,
    following: 189,
    posts: 456,
    photos: 312,
    joinedDate: 'Mayo 2023',
    friends: ['ana@nexly.com'],
    stories: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1706900034128-aadc237ded70?w=400',
        title: 'Rutina matinal',
        timestamp: 'Hace 30min'
      }
    ]
  }
};

// Función para obtener un usuario por ID/email
export function getUserProfile(userId: string): UserProfile | null {
  const mockUser = mockUsers[userId];
  if (mockUser) return mockUser;

  // Check registered users
  const registeredUser = auth.getUserById(userId);
  if (registeredUser) {
    return {
      id: registeredUser.email,
      email: registeredUser.email,
      name: registeredUser.name,
      avatar: registeredUser.avatar,
      bio: registeredUser.bio,
      location: registeredUser.location,
      website: registeredUser.website,
      coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      followers: 0,
      following: 0,
      posts: 0,
      photos: 0,
      joinedDate: registeredUser.createdAt || 'Registrado recientemente',
      friends: [],
      stories: []
    };
  }

  return null;
}

// Función para obtener posts de un usuario
export function getUserPosts(userId: string): PostData[] {
  const user = getUserProfile(userId);
  if (!user) return [];

  // Posts simulados basados en el usuario
  const postsMap: Record<string, PostData[]> = {
    'maria@nexly.com': [
      {
        id: '1',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: '¡Increíble día explorando la naturaleza! 🌲✨ #Fotografía #Naturaleza',
        image: 'https://images.unsplash.com/photo-1607206637161-97cf47a9a9df?w=800',
        timestamp: 'Hace 2 horas',
        likes: 124,
        comments: [],
        shares: 5,
      },
      {
        id: '2',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'El atardecer perfecto no exist... 🌅',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        timestamp: 'Hace 1 día',
        likes: 256,
        comments: [],
        shares: 12,
      },
      {
        id: '3',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Nueva sesión de fotos en las montañas. ¡Qué vistas! 📸',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
        timestamp: 'Hace 3 días',
        likes: 189,
        comments: [],
        shares: 8,
      }
    ],
    'carlos@nexly.com': [
      {
        id: '1',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Compartiendo mi nueva receta favorita. ¿Alguien más ama la cocina italiana? 🍝',
        image: 'https://images.unsplash.com/photo-1700137805953-c5708d9cd955?w=800',
        timestamp: 'Hace 5 horas',
        likes: 89,
        comments: [],
        shares: 3,
      },
      {
        id: '2',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Domingo de brunch 🥐☕ ¿Cuál es tu favorito?',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        timestamp: 'Hace 2 días',
        likes: 145,
        comments: [],
        shares: 7,
      }
    ],
    'ana@nexly.com': [
      {
        id: '1',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Nuevo tutorial de fotografía móvil ya disponible! 📱✨',
        image: 'https://images.unsplash.com/photo-1694878982098-1cec80d96eca?w=800',
        timestamp: 'Hace 3 horas',
        likes: 312,
        comments: [],
        shares: 45,
      },
      {
        id: '2',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Setup actualizado 💻🎨 #TechLife',
        image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800',
        timestamp: 'Hace 1 día',
        likes: 234,
        comments: [],
        shares: 18,
      }
    ],
    'diego@nexly.com': [
      {
        id: '1',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Aventura en las montañas 🏔️ #Senderismo #Aventura',
        image: 'https://images.unsplash.com/photo-1743699537171-750edd44bd87?w=800',
        timestamp: 'Hace 4 horas',
        likes: 167,
        comments: [],
        shares: 9,
      }
    ],
    'sofia@nexly.com': [
      {
        id: '1',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Entrenamiento diario completado! 💪 #Fitness #Motivación',
        image: 'https://images.unsplash.com/photo-1706900034128-aadc237ded70?w=800',
        timestamp: 'Hace 1 hora',
        likes: 423,
        comments: [],
        shares: 28,
      },
      {
        id: '2',
        author: user.name,
        authorId: userId,
        avatar: user.avatar,
        content: 'Yoga al amanecer 🧘‍♀️🌅 La mejor manera de empezar el día',
        image: 'https://images.unsplash.com/photo-1635367216109-aa3353c0c22e?w=800',
        timestamp: 'Hace 2 días',
        likes: 356,
        comments: [],
        shares: 19,
      }
    ]
  };

  return postsMap[userId] || [];
}

// Función para obtener todos los usuarios (para búsqueda y sugerencias)
export function getAllUsers(): UserProfile[] {
  const registered = auth.getAllRegisteredUsers().map(u => ({
    id: u.email,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    bio: u.bio,
    location: u.location,
    website: u.website,
    coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    followers: 0,
    following: 0,
    posts: 0,
    photos: 0,
    joinedDate: u.createdAt || 'Registrado recientemente',
    friends: [],
    stories: []
  }));

  const mockOnes = Object.values(mockUsers);
  const combined = [...mockOnes];
  
  registered.forEach(reg => {
    if (!combined.find(m => m.email === reg.email)) {
      combined.push(reg);
    }
  });

  return combined;
}