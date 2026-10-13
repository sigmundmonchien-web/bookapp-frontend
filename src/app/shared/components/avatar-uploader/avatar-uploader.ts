import { Component, inject, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideCamera, LucideTrash2 } from '@lucide/angular';
import { UserService } from '../../../core/services/user';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-avatar-uploader',
  standalone: true,
  imports: [Avatar, LucideCamera, LucideTrash2],
  templateUrl: './avatar-uploader.html',
  styleUrl: './avatar-uploader.css',
})
export class AvatarUploader {
  private userService = inject(UserService);

  pseudo = input.required<string>();
  photoUrl = input<string | null>(null);

  photoUpdated = output<string | null>();

  uploading = signal<boolean>(false);
  errorMessage = signal<string>('');

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.errorMessage.set('');
    this.uploading.set(true);

    this.userService.uploadPhoto(file).subscribe({
      next: (response) => {
        this.uploading.set(false);
        this.photoUpdated.emit(response.photoUrl);
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        input.value = '';
        this.errorMessage.set(
          err.error?.error ?? 'Impossible d\'envoyer la photo. Réessaie plus tard.'
        );
      },
    });
  }

  removePhoto(): void {
    this.errorMessage.set('');
    this.uploading.set(true);

    this.userService.deletePhoto().subscribe({
      next: () => {
        this.uploading.set(false);
        this.photoUpdated.emit(null);
      },
      error: () => {
        this.uploading.set(false);
        this.errorMessage.set('Impossible de retirer la photo.');
      },
    });
  }
}