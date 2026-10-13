import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { LucideArrowLeft, LucideMail } from '@lucide/angular';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LucideArrowLeft, LucideMail, BottomNav],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {
  // Injection du service Location d'Angular : permet de revenir
  // à la page précédente sans savoir d'où l'utilisateur vient.
  // Utile ici car la page est accessible depuis /profile, /login
  // et /register — un routerLink en dur casserait la navigation.
  private location = inject(Location);

  // Date de dernière mise à jour affichée en bas de page.
  // Elle fait foi juridiquement : le RGPD impose de dater
  // toute modification substantielle de la politique.
  readonly lastUpdated = '6 septembre 2026';

  goBack(): void {
    this.location.back();
  }
}