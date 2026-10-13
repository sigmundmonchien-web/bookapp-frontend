import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookSummary } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-list-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  book = input.required<BookSummary>();
}