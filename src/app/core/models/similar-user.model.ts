export interface SharedBook {
  id: number;
  title: string;
  author: string;
  googleBooksId: string;
}

export interface SimilarUserSummary {
  id: number;
  pseudo: string;
}

export interface SimilarUser {
  user: SimilarUserSummary;
  commonBooks: SharedBook[];
}