import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactRequest {
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // L'identité de l'expéditeur n'est pas transmise : le backend
  // la récupère du JWT. Impossible d'usurper quelqu'un d'autre.
  send(payload: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, payload);
  }
}