import { Component, input } from '@angular/core';

type CirclesPreset = 'home' | 'catalogue' | 'book-detail' | 'profile' | 'dashboard' | 'similar-users';

@Component({
  selector: 'app-decorative-circles',
  standalone: true,
  templateUrl: './decorative-circles.html',
  styleUrl: './decorative-circles.css',
})
export class DecorativeCircles {
  preset = input<CirclesPreset>('home');
}