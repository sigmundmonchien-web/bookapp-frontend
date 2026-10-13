import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user';
import { UserProfile } from '../../core/models/user.model';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';
import { Avatar } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecorativeCircles, Avatar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;
  profile = signal<UserProfile | null>(null);

  constructor() {
    if (this.isAuthenticated()) {
      this.userService.getProfile().subscribe({
        next: (p) => this.profile.set(p),
        error: (err) => console.error('Impossible de charger le profil sur la Home :', err),
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}