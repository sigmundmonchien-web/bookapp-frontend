import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      // Validators.requiredTrue est le validator Angular fait exprès
      // pour les cases à cocher obligatoires (RGPD, CGU, etc.).
      // Il ne considère la valeur valide que si elle vaut exactement
      // `true`. Différent de Validators.required qui accepterait
      // n'importe quelle valeur "truthy" (une chaîne "false" par exemple).
      acceptedPrivacyPolicy: [false, [Validators.requiredTrue]]
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // On destructure tous les champs (dont acceptedPrivacyPolicy)
    // pour construire le payload envoyé au backend.
    // Le champ confirmPassword reste côté frontend : sa seule
    // raison d'être est la double saisie côté UX, le backend
    // n'en a pas besoin (le hash est calculé à partir de password).
    const { email, pseudo, password, acceptedPrivacyPolicy } = this.form.getRawValue();

    this.authService.register({
      email,
      pseudo,
      password,
      acceptedPrivacyPolicy,
    }).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Cet email est déjà utilisé.');
        } else if (err.status === 400) {
          // Le backend renvoie soit une erreur générique de champs manquants,
          // soit spécifiquement l'erreur RGPD. On récupère le message brut
          // envoyé par le serveur pour l'afficher tel quel : plus précis
          // qu'un message générique côté frontend.
          this.errorMessage.set(
            err.error?.error ?? 'Données invalides. Vérifiez vos informations.'
          );
        } else {
          this.errorMessage.set('Une erreur est survenue. Réessayez plus tard.');
        }
      }
    });
  }
}