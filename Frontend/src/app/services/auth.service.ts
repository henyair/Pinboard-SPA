import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>('/api/auth/login', { username, password })
      .pipe(
        tap(user => {
          localStorage.setItem('current_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(username: string, password: string): Observable<User> {
    return this.http.post<User>('/api/auth/register', { username, password })
      .pipe(
        tap(user => {
          localStorage.setItem('current_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout() {
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }
}
