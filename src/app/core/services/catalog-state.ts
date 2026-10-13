import { Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';

type CatalogState = 'initial' | 'loading' | 'results' | 'empty' | 'error';

@Injectable({ providedIn: 'root' })
export class CatalogStateService {
  searchQuery = signal<string>('');
  books = signal<Book[]>([]);
  state = signal<CatalogState>('initial');
  errorMessage = signal<string | null>(null);
}