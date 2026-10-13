import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideUsers, LucideBook, LucideStar, LucideMessageSquare, LucideHeart, LucideBookmark } from '@lucide/angular';
import { AdminService } from '../../../../core/services/admin';
import { AdminStats as AdminStatsModel } from '../../../../core/models/admin.model';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [
    LucideUsers,
    LucideBook,
    LucideStar,
    LucideMessageSquare,
    LucideHeart,
    LucideBookmark,
  ],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStats implements OnInit {
  private adminService = inject(AdminService);

  state = signal<LoadState>('loading');
  stats = signal<AdminStatsModel | null>(null);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.state.set('loading');
    this.errorMessage.set('');

    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.state.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        this.state.set('error');
        this.errorMessage.set(
          err.status === 403
            ? 'Accès refusé.'
            : 'Impossible de charger les statistiques. Réessaie plus tard.'
        );
      },
    });
  }
}