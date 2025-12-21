import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { LoginRequest, RemoteUser, RegistrationRequest } from '../models/user.model';
import type { ApiResponse, PageResponse, PaginationParams } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/auth';

  getMe() {
    return this.http.get<ApiResponse<RemoteUser>>(`${this.api}/me`);
  }

  login(data: LoginRequest) {
    return this.http.post<ApiResponse<string>>(`${this.api}/login`, data, {
      withCredentials: true,
    });
  }

  refresh() {
    return this.http.post<ApiResponse<string>>(
      `${this.api}/refresh`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  register(data: RegistrationRequest) {
    return this.http.post<ApiResponse<null>>(`${this.api}/register`, data);
  }

  logout() {
    return this.http.post<ApiResponse<null>>(`${this.api}/logout`, {}, { withCredentials: true });
  }

  getPublicKey() {
    return this.http.get(`${this.api}/public-key`, {
      responseType: 'text',
    });
  }
}
