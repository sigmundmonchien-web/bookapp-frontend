import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  uploadPhoto(file: File): Observable<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ photoUrl: string }>(
      `${this.apiUrl}/me/photo`,
      formData
    );
  }

  deletePhoto(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/photo`);
  }
updatePseudo(pseudo: string): Observable<UserProfile> {
  return this.http.patch<UserProfile>(`${environment.apiUrl}/me`, { pseudo });
}

deleteAccount(): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/me`);
}

}