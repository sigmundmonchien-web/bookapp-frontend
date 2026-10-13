import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  icon = input.required<string>();
  title = input.required<string>();
  message = input.required<string>();
  ctaLabel = input<string>('Explorer le catalogue');
  ctaLink = input<string>('/catalogue');
}