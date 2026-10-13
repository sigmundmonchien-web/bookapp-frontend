export interface UserCounts {
  favorites: number;
  ratings: number;
  readingList: number;
}

export interface UserProfile {
  id: number;
  pseudo: string;
  email: string;
  createdAt: string;
  photoUrl: string | null;
  counts: UserCounts;
}