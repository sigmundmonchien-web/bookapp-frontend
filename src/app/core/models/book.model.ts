// Format d'un livre issu de la recherche Google Books (endpoint /api/books)
// Pas d'id local : ce livre n'est peut-être pas encore persisté en BDD.
export interface Book {
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  genre: string | null;
}

// Livre référencé dans les listes du dashboard (favoris, notes, liste à lire).
// A un id local parce qu'il est persistant en base.
export interface BookSummary {
  id: number;
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl: string | null;
}

// Réponse du endpoint de recherche
export interface BookSearchResponse {
  total: number;
  books: Book[];
}

// Note + avis textuel de l'utilisateur courant sur un livre
export interface UserRating {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserInteractions {
  rating: UserRating | null;
  favoriteId: number | null;
  readingListId: number | null;
}

// Statistiques agrégées d'un livre (calculées côté backend)
export interface BookStats {
  averageScore: number | null;
  ratingsCount: number;
}

// Auteur d'un avis affiché publiquement (minimisation : pseudo uniquement, RGPD art. 5.1.c)
export interface ReviewAuthor {
  pseudo: string;
}

// Avis textuel affiché sur la fiche livre (le sien ET ceux des autres)
export interface BookReview {
  id: number;
  score: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  isMine: boolean;
  user: ReviewAuthor;
}

// Format détaillé d'un livre (endpoint /api/books/{id})
export interface BookDetail extends Book {
  publishedDate: string | null;
  pageCount: number | null;
  userInteractions: UserInteractions;
  stats: BookStats;
  reviews: BookReview[];
}

export interface FavoriteItem {
  id: number;
  createdAt: string;
  book: BookSummary;
}

export interface RatingItem {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
  book: BookSummary;
}

export interface ReadingListItem {
  id: number;
  createdAt: string;
  book: BookSummary;
}