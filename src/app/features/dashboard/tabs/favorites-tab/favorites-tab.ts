import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BooksService } from '../../../../core/services/books';
import { DashboardState } from '../../../../core/services/dashboard-state';
import { BookListItem } from '../../../../shared/components/book-list-item/book-list-item';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { StarRating } from "../../../../shared/components/star-rating/star-rating";

@Component({
  selector: 'app-favorites-tab',
  standalone: true,
  imports: [BookListItem, EmptyState],
  templateUrl: './favorites-tab.html',
  styleUrl: './favorites-tab.css',
})
export class FavoritesTab {
  private booksService = inject(BooksService);
  private dashboardState = inject(DashboardState);

  favorites = this.dashboardState.favorites;
  hasError = signal<boolean>(false);

  loading = computed(() => this.favorites() === null && !this.hasError());
  isEmpty = computed(() => {
    const list = this.favorites();
    return list !== null && list.length === 0 && !this.hasError();
  });

  constructor() {
    if (this.favorites() === null) {
      this.loadFavorites();
    }
  }

  private loadFavorites(): void {
    this.hasError.set(false);

    this.booksService.getFavorites().subscribe({
      next: (items) => {
        this.dashboardState.favorites.set(items);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des favoris :', err);
        this.hasError.set(true);
      },
    });
  }

  retry(): void {
    this.loadFavorites();
  }

  removeFavorite(favoriteId: number): void {
    const current = this.favorites();
    if (current === null) return;

    const previous = current;
    this.dashboardState.favorites.set(current.filter(f => f.id !== favoriteId));

    this.booksService.removeFavorite(favoriteId.toString()).subscribe({
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        this.dashboardState.favorites.set(previous);
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  onDeleteClick(event: MouseEvent, favoriteId: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.removeFavorite(favoriteId);
  }
}