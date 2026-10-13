import { Component, computed, input, model, signal } from '@angular/core';
import { LucideStar } from '@lucide/angular';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [LucideStar],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  value = model<number>(0);
  readonly = input<boolean>(false);
  size = input<number>(24);

  private hoverValue = signal<number>(0);

  readonly stars = [1, 2, 3, 4, 5];

  displayValue = computed(() => {
    const hover = this.hoverValue();
    return hover > 0 ? hover : this.value();
  });

  isFilled = computed(() => {
    const display = this.displayValue();
    return this.stars.map(position => position <= display);
  });

  onStarClick(position: number): void {
    if (this.readonly()) return;
    this.value.set(position);
  }

  onStarHover(position: number): void {
    if (this.readonly()) return;
    this.hoverValue.set(position);
  }

  onMouseLeave(): void {
    if (this.readonly()) return;
    this.hoverValue.set(0);
  }
}