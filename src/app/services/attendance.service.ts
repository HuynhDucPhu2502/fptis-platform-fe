import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse, PageResponse, PaginationParams } from '../models/api-response.model';
import type { AttendanceResponse } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/attendances';

  checkIn() {
    return this.http.post<ApiResponse<AttendanceResponse>>(`${this.api}/check-in`, {});
  }

  checkOut() {
    return this.http.post<ApiResponse<AttendanceResponse>>(`${this.api}/check-out`, {});
  }

  getCurrentAttendance() {
    return this.http.get<ApiResponse<AttendanceResponse>>(`${this.api}/current`);
  }

  getAttendanceHistory({ page = 0, size = 10 }: PaginationParams) {
    const params = {
      page,
      size,
    };

    return this.http.get<ApiResponse<PageResponse<AttendanceResponse>>>(`${this.api}/history`, {
      params,
    });
  }

  downloadAttendanceReport() {
    return this.http.get(`${this.api}/report`, {
      responseType: 'blob',
    });
  }
}
