import { BookSummary } from './book.model';

// Statistiques globales pour la page d'accueil admin
export interface AdminStats {
  usersCount: number;
  booksCount: number;
  ratingsCount: number;
  reviewsCount: number;
  favoritesCount: number;
  readingListCount: number;
  topBooks: TopBook[];
}

export interface TopBook {
  id: number;
  title: string;
  author: string;
  ratingsCount: number;
  averageScore: number;
}

// Compteurs affichés dans la liste des utilisateurs
export interface UserInteractionCounts {
  ratings: number;
  favorites: number;
  readingList: number;
}

// Item de la liste GET /api/admin/users
export interface AdminUserListItem {
  id: number;
  email: string;
  pseudo: string;
  roles: string[];
  createdAt: string;
  photoFilename: string | null;
  counts: UserInteractionCounts;
}

// Rating d'un user vu depuis l'admin (avec le livre lié)
export interface AdminUserRating {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
  book: BookSummary;
}

export interface AdminUserFavorite {
  id: number;
  createdAt: string;
  book: BookSummary;
}

export interface AdminUserReadingList {
  id: number;
  createdAt: string;
  book: BookSummary;
}

// Détail complet d'un user (GET /api/admin/users/{id})
export interface AdminUserDetail {
  id: number;
  email: string;
  pseudo: string;
  roles: string[];
  createdAt: string;
  photoFilename: string | null;
  ratings: AdminUserRating[];
  favorites: AdminUserFavorite[];
  readingList: AdminUserReadingList[];
}