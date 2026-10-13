import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
  LucideHeart, LucideStar, LucideBookmark, LucideUsers,
  LucideLogOut, LucideChevronRight, LucidePencil, LucideCheck, LucideX,
  LucideTrash2, LucideAlertTriangle, LucideMessageCircle, LucideSend,
} from '@lucide/angular';
import { ContactService } from '../../core/services/contact';
import { UserService } from '../../core/services/user';
import { UserProfile } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';
import { DecorativeCircles } from '../../shared/components/decorative-circles/decorative-circles';
import { AvatarUploader } from '../../shared/components/avatar-uploader/avatar-uploader';

type ProfileState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    LucideHeart,
    LucideStar,
    LucideUsers,
    LucideLogOut,
    LucideChevronRight,
    LucidePencil,
    LucideCheck,
    LucideX,
    LucideTrash2,
    LucideAlertTriangle,
    BottomNav,
    DecorativeCircles,
    AvatarUploader,
    LucideSend,
    LucideMessageCircle,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private contactService = inject(ContactService);

  state = signal<ProfileState>('loading');
  profile = signal<UserProfile | null>(null);
  errorMessage = signal<string>('');

  // Édition du pseudo
  isEditingPseudo = signal<boolean>(false);
  pseudoDraft = signal<string>('');
  pseudoError = signal<string>('');
  savingPseudo = signal<boolean>(false);

  // Suppression de compte
  showDeleteModal = signal<boolean>(false);
  deleteConfirmInput = signal<string>('');
  deletingAccount = signal<boolean>(false);
  deleteError = signal<string>('');

    // Formulaire de contact
  showContactModal = signal<boolean>(false);
  contactSubject = signal<string>('');
  contactMessage = signal<string>('');
  sendingContact = signal<boolean>(false);
  contactError = signal<string>('');
  contactSuccess = signal<string>('');

  // Compteur de caractères restants, affiché sous le champ message.
  // Le passage en négatif n'est pas possible (maxlength côté HTML),
  // mais le compteur prévient l'utilisateur avant qu'il ne bute
  // sur la limite en pleine rédaction.
  messageRemaining = computed(() => 2000 - this.contactMessage().length);

  canSendContact = computed(() => {
    return this.contactSubject().trim().length > 0
      && this.contactMessage().trim().length > 0
      && !this.sendingContact();
  });

  initial = computed(() => {
    const p = this.profile();
    return p ? p.pseudo.charAt(0).toUpperCase() : '';
  });

  memberSince = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const date = new Date(p.createdAt);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  // Le bouton "Supprimer définitivement" n'est actif que si
  // l'utilisateur a tapé son pseudo exact ET qu'aucune requête
  // n'est déjà en cours. Reproduction du pattern GitHub/Google :
  // forcer un geste conscient et une reconnaissance de l'identité.
  canDelete = computed(() => {
    const input = this.deleteConfirmInput().trim();
    const p = this.profile();
    return p !== null
      && input === p.pseudo
      && !this.deletingAccount();
  });

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.state.set('loading');
    this.errorMessage.set('');

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.state.set('loaded');
      },
      error: (err: HttpErrorResponse) => {
        this.state.set('error');
        this.errorMessage.set('Impossible de charger le profil. Réessaie plus tard.');
        console.error('Erreur lors du chargement du profil :', err);
      },
    });
  }

  onPhotoUpdated(newPhotoUrl: string | null): void {
    const current = this.profile();
    if (current === null) return;

    this.profile.set({
      ...current,
      photoUrl: newPhotoUrl,
    });
  }

  startEditingPseudo(): void {
    const current = this.profile();
    if (current === null) return;
    this.pseudoDraft.set(current.pseudo);
    this.pseudoError.set('');
    this.isEditingPseudo.set(true);
  }

  cancelPseudoEdit(): void {
    this.isEditingPseudo.set(false);
    this.pseudoError.set('');
  }

  onPseudoDraftChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pseudoDraft.set(input.value);
  }

  savePseudo(): void {
    const draft = this.pseudoDraft().trim();
    const current = this.profile();
    if (current === null) return;

    // Validation client (miroir du backend)
    if (draft.length < 3 || draft.length > 30) {
      this.pseudoError.set('Le pseudo doit contenir entre 3 et 30 caractères.');
      return;
    }

    // Aucun changement : on ferme sans appeler l'API
    if (draft === current.pseudo) {
      this.isEditingPseudo.set(false);
      return;
    }

    this.savingPseudo.set(true);
    this.pseudoError.set('');

    this.userService.updatePseudo(draft).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.isEditingPseudo.set(false);
        this.savingPseudo.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.savingPseudo.set(false);
        this.pseudoError.set(
          err.error?.error ?? 'Impossible de sauvegarder le pseudo.'
        );
      },
    });
  }

  retry(): void {
    this.loadProfile();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // --- Suppression de compte ---

  openDeleteModal(): void {
    this.deleteConfirmInput.set('');
    this.deleteError.set('');
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    // On refuse la fermeture si une requête est en cours,
    // pour éviter que l'utilisateur pense avoir annulé alors
    // que la suppression est déjà partie au serveur.
    if (this.deletingAccount()) return;
    this.showDeleteModal.set(false);
  }

  onDeleteConfirmInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deleteConfirmInput.set(input.value);
  }

  confirmDeleteAccount(): void {
    // Double-vérification côté frontend au cas où la modale
    // aurait été manipulée via DevTools. La vraie sécurité
    // reste sur le backend qui authentifie via JWT.
    if (!this.canDelete()) return;

    this.deletingAccount.set(true);
    this.deleteError.set('');

    this.userService.deleteAccount().subscribe({
      next: () => {
        // Succès : le user n'existe plus en base. Le token JWT
        // devient orphelin — impératif de l'effacer localement
        // avant toute navigation, sinon un intercepteur pourrait
        // encore l'envoyer et déclencher un 401.
        this.authService.logout();

        // Redirection vers /login avec un flag query param.
        // Le composant Login pourra afficher un message
        // "Ton compte a bien été supprimé" (à ajouter dans un
        // second temps, cf. mon commentaire en fin de session).
        this.router.navigate(['/login'], {
          queryParams: { accountDeleted: 'true' },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.deletingAccount.set(false);
        this.deleteError.set(
          err.error?.error
            ?? 'La suppression a échoué. Vérifie ta connexion et réessaie.'
        );
      },
    });
  }

    // --- Formulaire de contact ---

  openContactModal(): void {
    this.contactSubject.set('');
    this.contactMessage.set('');
    this.contactError.set('');
    this.contactSuccess.set('');
    this.showContactModal.set(true);
  }

  closeContactModal(): void {
    if (this.sendingContact()) return;
    this.showContactModal.set(false);
  }

  onContactSubjectChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contactSubject.set(input.value);
  }

  onContactMessageChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.contactMessage.set(textarea.value);
  }

  sendContact(): void {
    if (!this.canSendContact()) return;

    this.sendingContact.set(true);
    this.contactError.set('');
    this.contactSuccess.set('');

    this.contactService.send({
      subject: this.contactSubject().trim(),
      message: this.contactMessage().trim(),
    }).subscribe({
      next: (response) => {
        this.sendingContact.set(false);
        this.contactSuccess.set(response.message);
        // On vide les champs mais on garde la modale ouverte :
        // le message de confirmation doit rester visible.
        // L'utilisateur ferme lui-même quand il l'a lu.
        this.contactSubject.set('');
        this.contactMessage.set('');
      },
      error: (err: HttpErrorResponse) => {
        this.sendingContact.set(false);
        this.contactError.set(
          err.error?.error
            ?? "L'envoi a échoué. Vérifie ta connexion et réessaie."
        );
      },
    });
  }
}