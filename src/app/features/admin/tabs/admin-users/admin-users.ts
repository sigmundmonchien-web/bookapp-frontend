import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideStar, LucideHeart, LucideBookmark, LucideTrash2, LucideX, LucideShield, LucideMessageSquare } from '@lucide/angular';
import { AdminService } from '../../../../core/services/admin';
import { AuthService } from '../../../../core/services/auth';
import { AdminUserListItem, AdminUserDetail } from '../../../../core/models/admin.model';

type ListState = 'loading' | 'loaded' | 'error';
type DetailState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    LucideStar,
    LucideHeart,
    LucideBookmark,
    LucideTrash2,
    LucideX,
    LucideShield,
    LucideMessageSquare,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  // Liste
  listState = signal<ListState>('loading');
  users = signal<AdminUserListItem[]>([]);
  listError = signal<string>('');

  // Modale de détail
  detailState = signal<DetailState>('idle');
  selectedUserId = signal<number | null>(null);
  userDetail = signal<AdminUserDetail | null>(null);
  detailError = signal<string>('');

  // Actions en cours
  deletingUserId = signal<number | null>(null);
  deletingReviewId = signal<number | null>(null);

  isModalOpen = computed(() => this.selectedUserId() !== null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.listState.set('loading');
    this.listError.set('');

    this.adminService.listUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.listState.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        this.listState.set('error');
        this.listError.set('Impossible de charger la liste des utilisateurs.');
      },
    });
  }

  openUserDetail(userId: number): void {
    this.selectedUserId.set(userId);
    this.detailState.set('loading');
    this.userDetail.set(null);
    this.detailError.set('');

    this.adminService.getUserDetail(userId).subscribe({
      next: (data) => {
        this.userDetail.set(data);
        this.detailState.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        this.detailState.set('error');
        this.detailError.set(
          err.status === 404
            ? 'Utilisateur introuvable.'
            : 'Impossible de charger le détail.'
        );
      },
    });
  }

  closeModal(): void {
    this.selectedUserId.set(null);
    this.userDetail.set(null);
    this.detailState.set('idle');
    this.detailError.set('');
  }

  deleteUser(userId: number, pseudo: string): void {
    if (!confirm(`Supprimer définitivement l'utilisateur ${pseudo} ? Cette action supprimera aussi toutes ses notes, favoris et livres à lire, et est irréversible.`)) {
      return;
    }

    this.deletingUserId.set(userId);

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        // Retire l'user de la liste sans recharger tout
        this.users.update(users => users.filter(u => u.id !== userId));
        this.deletingUserId.set(null);
        // Ferme la modale si c'était l'user affiché
        if (this.selectedUserId() === userId) {
          this.closeModal();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.deletingUserId.set(null);
        alert(
          err.status === 400
            ? (err.error?.error ?? 'Suppression impossible.')
            : 'Erreur lors de la suppression. Réessaie plus tard.'
        );
      },
    });
  }

  deleteReviewComment(ratingId: number): void {
    if (!confirm('Supprimer l\'avis textuel de cet utilisateur ? La note sera conservée, seul le texte sera effacé.')) {
      return;
    }

    this.deletingReviewId.set(ratingId);

    this.adminService.deleteReviewComment(ratingId).subscribe({
      next: () => {
        // Met à jour l'avis dans le détail affiché : comment devient null
        this.userDetail.update(detail => {
          if (!detail) return null;
          return {
            ...detail,
            ratings: detail.ratings.map(r =>
              r.id === ratingId ? { ...r, comment: null } : r
            ),
          };
        });
        this.deletingReviewId.set(null);
      },
      error: () => {
        this.deletingReviewId.set(null);
        alert('Erreur lors de la suppression de l\'avis.');
      },
    });
  }

  isCurrentAdmin(userId: number): boolean {
    // Compare l'id du user affiché à celui de l'admin connecté.
    // Utilisé pour désactiver le bouton "Supprimer" sur son propre compte.
    // L'id de l'admin n'est pas dans le JWT courant, donc on reste défensif :
    // le vrai garde-fou est côté backend (retour 400).
    return false;
  }
}