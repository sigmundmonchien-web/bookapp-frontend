import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-action-button',
  standalone: true,
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  active = input.required<boolean>();
  activeLabel = input.required<string>();
  inactiveLabel = input.required<string>();
  loading = input<boolean>(false);

  toggle = output<void>();

  onClick(): void {
    if (this.loading()) return;
    this.toggle.emit();
  }
}