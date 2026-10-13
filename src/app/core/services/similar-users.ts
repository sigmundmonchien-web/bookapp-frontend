import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SimilarUser } from '../models/similar-user.model';

@Injectable({ providedIn: 'root' })
export class SimilarUsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSimilarUsers(): Observable<SimilarUser[]> {
    return this.http.get<SimilarUser[]>(`${this.apiUrl}/similar-users`);
  }
}