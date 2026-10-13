import { Injectable, signal } from '@angular/core';
import { FavoriteItem, RatingItem, ReadingListItem } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class DashboardState {
  favorites = signal<FavoriteItem[] | null>(null);
  ratings = signal<RatingItem[] | null>(null);
  readingList = signal<ReadingListItem[] | null>(null);
}