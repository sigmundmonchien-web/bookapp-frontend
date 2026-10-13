import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BooksService } from '../../../../core/services/books';
import { DashboardState } from '../../../../core/services/dashboard-state';
import { BookListItem } from '../../../../shared/components/book-list-item/book-list-item';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { StarRating } from '../../../../shared/components/star-rating/star-rating';

@Component({
  selector: 'app-ratings-tab',
  standalone: true,
  imports: [BookListItem, EmptyState, StarRating],
  templateUrl: './ratings-tab.html',
  styleUrl: './ratings-tab.css',
})
export class RatingsTab {
  private booksService = inject(BooksService);
  private dashboardState = inject(DashboardState);

  ratings = this.dashboardState.ratings;
  hasError = signal<boolean>(false);

  loading = computed(() => this.ratings() === null && !this.hasError());
  isEmpty = computed(() => {
    const list = this.ratings();
    return list !== null && list.length === 0 && !this.hasError();
  });

  constructor() {
    if (this.ratings() === null) {
      this.loadRatings();
    }
  }

  private loadRatings(): void {
    this.hasError.set(false);

    this.booksService.getRatings().subscribe({
      next: (items) => {
        this.dashboardState.ratings.set(items);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des notes :', err);
        this.hasError.set(true);
      },
    });
  }

  retry(): void {
    this.loadRatings();
  }
}