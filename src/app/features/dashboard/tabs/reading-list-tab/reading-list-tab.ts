import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideTrash2 } from '@lucide/angular';
import { BooksService } from '../../../../core/services/books';
import { DashboardState } from '../../../../core/services/dashboard-state';
import { BookListItem } from '../../../../shared/components/book-list-item/book-list-item';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-reading-list-tab',
  standalone: true,
  imports: [BookListItem, EmptyState, LucideTrash2],
  templateUrl: './reading-list-tab.html',
  styleUrl: './reading-list-tab.css',
})
export class ReadingListTab {
  private booksService = inject(BooksService);
  private dashboardState = inject(DashboardState);

  readingList = this.dashboardState.readingList;
  hasError = signal<boolean>(false);

  loading = computed(() => this.readingList() === null && !this.hasError());
  isEmpty = computed(() => {
    const list = this.readingList();
    return list !== null && list.length === 0 && !this.hasError();
  });

  constructor() {
    if (this.readingList() === null) {
      this.loadReadingList();
    }
  }

  private loadReadingList(): void {
    this.hasError.set(false);

    this.booksService.getReadingList().subscribe({
      next: (items) => {
        this.dashboardState.readingList.set(items);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement de la liste à lire :', err);
        this.hasError.set(true);
      },
    });
  }

  retry(): void {
    this.loadReadingList();
  }

  onDeleteClick(event: MouseEvent, readingListId: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.removeFromReadingList(readingListId);
  }

  private removeFromReadingList(readingListId: number): void {
    const current = this.readingList();
    if (current === null) return;

    const previous = current;
    this.dashboardState.readingList.set(current.filter(r => r.id !== readingListId));

    this.booksService.removeFromReadingList(readingListId.toString()).subscribe({
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        this.dashboardState.readingList.set(previous);
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
}