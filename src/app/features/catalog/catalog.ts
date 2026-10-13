import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideSearch } from '@lucide/angular';
import { BooksService } from '../../core/services/books';
import { CatalogStateService } from '../../core/services/catalog-state';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BottomNav, LucideSearch, DecorativeCircles],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private booksService = inject(BooksService);
  private catalogState = inject(CatalogStateService);

  searchControl = new FormControl('', { nonNullable: true });

  state = this.catalogState.state;
  books = this.catalogState.books;
  errorMessage = this.catalogState.errorMessage;

  constructor() {
    this.searchControl.setValue(this.catalogState.searchQuery(), { emitEvent: false });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.trim().length >= 2 || query.trim().length === 0),
      switchMap(query => {
        const trimmed = query.trim();
        this.catalogState.searchQuery.set(trimmed);

        if (trimmed.length === 0) {
          this.catalogState.state.set('initial');
          this.catalogState.books.set([]);
          return of(null);
        }

        this.catalogState.state.set('loading');
        this.catalogState.errorMessage.set(null);

        return this.booksService.searchBooks(trimmed).pipe(
          catchError((err: HttpErrorResponse) => {
            this.catalogState.state.set('error');
            if (err.status === 503) {
              this.catalogState.errorMessage.set('Service de recherche temporairement indisponible.');
            } else {
              this.catalogState.errorMessage.set('Une erreur est survenue lors de la recherche.');
            }
            return of(null);
          })
        );
      }),
      takeUntilDestroyed()
    ).subscribe(response => {
      if (response === null) {
        return;
      }
      this.catalogState.books.set(response.books);
      this.catalogState.state.set(response.books.length === 0 ? 'empty' : 'results');
    });
  }
}