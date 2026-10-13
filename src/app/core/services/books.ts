import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookSearchResponse,
  BookDetail,
  FavoriteItem,
  RatingItem,
  ReadingListItem,
  UserRating,
} from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  searchBooks(query: string): Observable<BookSearchResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<BookSearchResponse>(`${this.apiUrl}/books`, { params });
  }

  getBookDetail(id: string): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.apiUrl}/books/${id}`);
  }

  /**
   * Enregistre ou met à jour une note.
   * - comment non fourni (undefined) → le backend ne touche pas au commentaire existant
   * - comment: null → efface l'avis
   * - comment: string → met à jour l'avis
   */
  rateBook(
    googleBooksId: string,
    score: number,
    comment?: string | null,
  ): Observable<UserRating> {
    const body: { googleBooksId: string; score: number; comment?: string | null } = {
      googleBooksId,
      score,
    };
    if (comment !== undefined) {
      body.comment = comment;
    }
    return this.http.post<UserRating>(`${this.apiUrl}/ratings`, body);
  }

  addFavorite(googleBooksId: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${this.apiUrl}/favorites`,
      { googleBooksId },
    );
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${favoriteId}`);
  }

  addToReadingList(googleBooksId: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${this.apiUrl}/reading-list`,
      { googleBooksId },
    );
  }

  removeFromReadingList(readingListId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reading-list/${readingListId}`);
  }

  getFavorites(): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(`${this.apiUrl}/favorites`);
  }

  getRatings(): Observable<RatingItem[]> {
    return this.http.get<RatingItem[]>(`${this.apiUrl}/ratings`);
  }

  getReadingList(): Observable<ReadingListItem[]> {
    return this.http.get<ReadingListItem[]>(`${this.apiUrl}/reading-list`);
  }
}