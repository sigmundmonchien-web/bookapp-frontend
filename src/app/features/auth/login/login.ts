import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  infoMessage = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    if (params['registered'] === 'true') {
      this.successMessage.set('Compte créé avec succès. Connectez-vous.');
    }

    if (params['sessionExpired'] === 'true') {
      this.infoMessage.set('Votre session a expiré. Reconnectez-vous pour continuer.');
    }

    if (params['accountDeleted'] === 'true') {
      this.infoMessage.set(
        'Votre compte a bien été supprimé. Toutes vos données ont été effacées.'
      );
    }
  }

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Email ou mot de passe incorrect.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Réessayez plus tard.');
        }
      }
    });
  }
}