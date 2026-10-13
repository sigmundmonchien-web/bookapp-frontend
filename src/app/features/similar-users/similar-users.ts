import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { SimilarUsersService } from '../../core/services/similar-users';
import { SimilarUser } from '../../core/models/similar-user.model';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

type SimilarUsersState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-similar-users',
  standalone: true,
  imports: [
    RouterLink,
    LucideChevronDown,
    LucideChevronRight,
    EmptyState,
  ],
  templateUrl: './similar-users.html',
  styleUrl: './similar-users.css',
})
export class SimilarUsers {
  private similarUsersService = inject(SimilarUsersService);

  state = signal<SimilarUsersState>('loading');
  users = signal<SimilarUser[]>([]);
  errorMessage = signal<string>('');
  expandedUserId = signal<number | null>(null);

  isEmpty = computed(() => this.state() === 'loaded' && this.users().length === 0);

  constructor() {
    this.loadSimilarUsers();
  }

  private loadSimilarUsers(): void {
    this.state.set('loading');
    this.errorMessage.set('');

    this.similarUsersService.getSimilarUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.state.set('loaded');

        if (users.length > 0) {
          this.expandedUserId.set(users[0].user.id);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.state.set('error');
        this.errorMessage.set('Impossible de charger les utilisateurs similaires. Réessaie plus tard.');
        console.error('Erreur lors du chargement des utilisateurs similaires :', err);
      },
    });
  }

  toggleExpand(userId: number): void {
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
    } else {
      this.expandedUserId.set(userId);
    }
  }

  isExpanded(userId: number): boolean {
    return this.expandedUserId() === userId;
  }

  getInitial(pseudo: string): string {
    return pseudo.charAt(0).toUpperCase();
  }

  retry(): void {
    this.loadSimilarUsers();
  }
}