import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkRequestService } from '../../../../../services/work-request.service';
import type { WorkRequestRequest } from '../../../../../models/work-request.model';

@Component({
  selector: 'app-work-request-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './work-request-form.html',
})
export class WorkRequestForm {
  reason = '';
  fromDate = '';
  toDate = '';
  requestType: 'leave' | 'remote' | null = null;
  isSubmitting = false;
  errorMessage = '';

  requestTypes = [
    {
      id: 'leave' as const,
      title: 'Nghỉ phép',
      icon: 'calendar',
    },
    {
      id: 'remote' as const,
      title: 'Làm từ xa',
      icon: 'laptop',
    },
  ];

  constructor(private workRequestService: WorkRequestService, private router: Router) {}

  selectRequestType(type: 'leave' | 'remote') {
    this.requestType = type;
  }

  onSubmit() {
    if (!this.reason || !this.fromDate || !this.toDate || !this.requestType) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: WorkRequestRequest = {
      reason: this.reason,
      fromDate: this.fromDate,
      toDate: this.toDate,
      workRequestType: this.requestType.toUpperCase() as 'LEAVE' | 'REMOTE',
    };

    this.workRequestService.createRequest(request).subscribe({
      next: (response) => {
        console.log('[FPT IS] Work request created successfully:', response);
        this.router.navigate(['/dashboard/work-request']);
      },
      error: (error) => {
        console.error('[FPT IS] Error creating work request:', error);
        this.errorMessage = 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
