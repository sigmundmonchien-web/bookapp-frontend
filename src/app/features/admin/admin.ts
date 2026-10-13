import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { LucideArrowLeft, LucideLogOut } from '@lucide/angular';
import { AuthService } from '../../core/services/auth';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideArrowLeft,
    LucideLogOut,
    BottomNav,
    DecorativeCircles,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}