import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideArrowLeft, LucideHeart, LucideBookmark, LucideStar, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { BooksService } from '../../core/services/books';
import { BookDetail as BookDetailModel, BookReview, BookStats, UserRating } from '../../core/models/book.model';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { ActionButton } from '../../shared/components/action-button/action-button';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';

type DetailState = 'loading' | 'loaded' | 'error';
type CommentStatus = 'idle' | 'saving' | 'saved' | 'error';

const COMMENT_MAX_LENGTH = 500;

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideArrowLeft,
    LucideHeart,
    LucideBookmark,
    LucideStar,
    LucidePencil,
    LucideTrash2,
    BottomNav,
    StarRating,
    ActionButton,
    DecorativeCircles,
  ],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail {
  private booksService = inject(BooksService);

  readonly COMMENT_MAX_LENGTH = COMMENT_MAX_LENGTH;

  id = input.required<string>();

  state = signal<DetailState>('loading');
  book = signal<BookDetailModel | null>(null);
  errorMessage = signal<string>('');

  // État "ma note + zone de saisie d'avis"
  userRating = signal<number>(0);
  savedComment = signal<string | null>(null);
  commentInput = signal<string>('');
  commentStatus = signal<CommentStatus>('idle');
  commentError = signal<string>('');

  // Statistiques + tous les avis (le sien + les autres)
  stats = signal<BookStats>({ averageScore: null, ratingsCount: 0 });
  reviews = signal<BookReview[]>([]);

  favoriteId = signal<number | null>(null);
  readingListId = signal<number | null>(null);
  favoriteLoading = signal<boolean>(false);
  readingListLoading = signal<boolean>(false);

  // Dérivés — pilotent l'état du textarea et des boutons
  commentLength = computed(() => this.commentInput().length);
  commentDirty = computed(() => this.commentInput().trim() !== (this.savedComment() ?? ''));
  commentDisabled = computed(() => this.userRating() === 0);
  commentTooLong = computed(() => this.commentLength() > COMMENT_MAX_LENGTH);
  canSaveComment = computed(() =>
    !this.commentDisabled()
    && this.commentDirty()
    && this.commentInput().trim() !== ''
    && !this.commentTooLong()
    && this.commentStatus() !== 'saving'
  );

  // Avis du user courant (extrait de la liste des reviews)
  myReview = computed(() => this.reviews().find(r => r.isMine) ?? null);
  otherReviews = computed(() => this.reviews().filter(r => !r.isMine));

  constructor() {
    effect(() => {
      const currentId = this.id();
      this.loadBook(currentId);
    });
  }

  private loadBook(googleBooksId: string): void {
    this.state.set('loading');
    this.errorMessage.set('');
    this.commentStatus.set('idle');
    this.commentError.set('');

    this.booksService.getBookDetail(googleBooksId).subscribe({
      next: (book) => {
        this.book.set(book);
        this.hydrateUserRating(book.userInteractions.rating);
        this.stats.set(book.stats);
        this.reviews.set(book.reviews);
        this.favoriteId.set(book.userInteractions.favoriteId ?? null);
        this.readingListId.set(book.userInteractions.readingListId ?? null);
        this.state.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        this.state.set('error');
        this.errorMessage.set(
          err.status === 404
            ? 'Ce livre est introuvable.'
            : 'Impossible de charger les détails du livre. Réessaie plus tard.'
        );
      },
    });
  }

  private hydrateUserRating(rating: UserRating | null): void {
    this.userRating.set(rating?.score ?? 0);
    this.savedComment.set(rating?.comment ?? null);
    // Le textarea reste vide au chargement : c'est une zone de saisie,
    // pas un endroit où re-afficher un avis déjà enregistré.
    this.commentInput.set('');
  }

  /**
   * Recharge la fiche complète depuis le backend après une modification d'avis.
   * Permet à `stats` et `reviews` d'être resynchronisés (le nouvel avis
   * apparaît immédiatement dans la liste).
   */
  private reloadBook(): void {
    this.booksService.getBookDetail(this.id()).subscribe({
      next: (book) => {
        this.book.set(book);
        this.hydrateUserRating(book.userInteractions.rating);
        this.stats.set(book.stats);
        this.reviews.set(book.reviews);
      },
      error: (err) => {
        console.error('Erreur lors du rechargement du livre :', err);
      },
    });
  }

  retry(): void {
    this.loadBook(this.id());
  }

  onRatingChange(newRating: number): void {
    const currentBook = this.book();
    if (!currentBook) return;

    const previousRating = this.userRating();
    this.userRating.set(newRating);

    // On envoie SEULEMENT le score (comment: undefined) : le backend
    // ne touchera pas au commentaire existant.
    this.booksService.rateBook(currentBook.googleBooksId, newRating).subscribe({
      next: () => {
        // Rechargement pour resynchroniser stats (moyenne recalculée)
        // et reviews (si c'était sa première note avec avis).
        this.reloadBook();
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement de la note :', err);
        this.userRating.set(previousRating);
        this.errorMessage.set('Impossible d\'enregistrer la note. Réessaie plus tard.');
      },
    });
  }

  saveComment(): void {
    const currentBook = this.book();
    if (!currentBook || !this.canSaveComment()) return;

    const trimmed = this.commentInput().trim();

    this.commentStatus.set('saving');
    this.commentError.set('');

    this.booksService.rateBook(currentBook.googleBooksId, this.userRating(), trimmed).subscribe({
      next: () => {
        this.commentInput.set('');
        this.commentStatus.set('saved');
        this.reloadBook();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'enregistrement de l\'avis :', err);
        this.commentStatus.set('error');
        this.commentError.set(
          err.status === 400
            ? (err.error?.error ?? 'Avis invalide.')
            : 'Impossible d\'enregistrer l\'avis. Réessaie plus tard.'
        );
      },
    });
  }

  /**
   * Repose l'avis existant dans le textarea pour édition.
   * Le user pourra ensuite le modifier et cliquer sur "Enregistrer" à nouveau.
   */
  editMyReview(): void {
    const mine = this.myReview();
    if (!mine) return;

    this.commentInput.set(mine.comment);
    this.commentStatus.set('idle');
    this.commentError.set('');

    // Petit délai pour laisser le DOM se mettre à jour avant le focus
    setTimeout(() => {
      const textarea = document.getElementById('review-textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 0);
  }

  deleteMyReview(): void {
    const currentBook = this.book();
    if (!currentBook || this.myReview() === null) return;

    if (!confirm('Supprimer votre avis ? Votre note reste enregistrée.')) return;

    this.commentStatus.set('saving');
    this.commentError.set('');

    this.booksService.rateBook(currentBook.googleBooksId, this.userRating(), null).subscribe({
      next: () => {
        this.commentInput.set('');
        this.commentStatus.set('saved');
        this.reloadBook();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de l\'avis :', err);
        this.commentStatus.set('error');
        this.commentError.set('Impossible de supprimer l\'avis. Réessaie plus tard.');
      },
    });
  }

  toggleFavorite(): void {
    const currentBook = this.book();
    if (!currentBook) return;

    const previousValue = this.favoriteId();
    this.favoriteLoading.set(true);

    if (previousValue === null) {
      this.favoriteId.set(-1);

      this.booksService.addFavorite(currentBook.googleBooksId).subscribe({
        next: (response) => {
          this.favoriteId.set(response.id);
          this.favoriteLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout aux favoris :', err);
          this.favoriteId.set(previousValue);
          this.favoriteLoading.set(false);
        },
      });
    } else {
      this.favoriteId.set(null);

      this.booksService.removeFavorite(previousValue.toString()).subscribe({
        next: () => {
          this.favoriteLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression des favoris :', err);
          this.favoriteId.set(previousValue);
          this.favoriteLoading.set(false);
        },
      });
    }
  }

  toggleReadingList(): void {
    const currentBook = this.book();
    if (!currentBook) return;

    const previousValue = this.readingListId();
    this.readingListLoading.set(true);

    if (previousValue === null) {
      this.readingListId.set(-1);

      this.booksService.addToReadingList(currentBook.googleBooksId).subscribe({
        next: (response) => {
          this.readingListId.set(response.id);
          this.readingListLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout à la liste de lecture :', err);
          this.readingListId.set(previousValue);
          this.readingListLoading.set(false);
        },
      });
    } else {
      this.readingListId.set(null);

      this.booksService.removeFromReadingList(previousValue.toString()).subscribe({
        next: () => {
          this.readingListLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la liste de lecture :', err);
          this.readingListId.set(previousValue);
          this.readingListLoading.set(false);
        },
      });
    }
  }
}