import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../../core/services/user';
import { UserCounts } from '../../core/models/user.model';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, BottomNav, DecorativeCircles],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private userService = inject(UserService);

  counts = signal<UserCounts | null>(null);

  constructor() {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.counts.set(profile.counts);
      },
      error: (err) => {
        console.error('Impossible de charger les compteurs :', err);
      },
    });
  }
}