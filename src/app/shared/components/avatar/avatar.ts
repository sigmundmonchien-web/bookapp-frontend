import { Component, computed, input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  pseudo = input.required<string>();
  photoUrl = input<string | null>(null);
  size = input<number>(48);

  initial = computed(() => this.pseudo().charAt(0).toUpperCase());

  fullPhotoUrl = computed(() => {
    const url = this.photoUrl();
    if (url === null) return null;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  });
}