import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-work-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './work-request.html',
})
export class WorkRequest {
  reason = '';
  startDate = '';
  endDate = '';
  requestType: 'leave' | 'remote' | null = null;

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

  selectRequestType(type: 'leave' | 'remote') {
    this.requestType = type;
    console.log('[FPT IS] Selected request type:', type);
  }

  onSubmit() {
    if (!this.reason || !this.startDate || !this.endDate || !this.requestType) {
      console.log('[FPT IS] Form validation failed - missing required fields');
      return;
    }

    const formData = {
      reason: this.reason,
      startDate: this.startDate,
      endDate: this.endDate,
      requestType: this.requestType,
    };

    console.log('[FPT IS] Submitting work request:', formData);
    // TODO: Call API to submit request
  }
}
