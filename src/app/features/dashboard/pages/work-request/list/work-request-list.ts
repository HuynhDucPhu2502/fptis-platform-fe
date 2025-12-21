import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { WorkRequestService } from '../../../../../services/work-request.service';
import type { WorkRequestResponse } from '../../../../../models/work-request.model';

@Component({
  selector: 'app-work-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './work-request-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkRequestList implements OnInit {
  requests: WorkRequestResponse[] = [];
  loading = false;

  constructor(private workRequestService: WorkRequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workRequestService
      .getMyHistory()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.requests = response.result ?? [];
        },
        error: (error) => {
          console.error('[WorkRequestList] load error', error);
          this.requests = [];
        },
      });
  }

  /* ================= UI Helpers ================= */

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING_SYSTEM':
      case 'PENDING_MENTOR':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'PENDING_SYSTEM':
        return 'Chờ hệ thống';
      case 'PENDING_MENTOR':
        return 'Chờ mentor';
      default:
        return status;
    }
  }

  getTypeText(type: string): string {
    return type === 'LEAVE' ? 'Nghỉ phép' : 'Làm từ xa';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
