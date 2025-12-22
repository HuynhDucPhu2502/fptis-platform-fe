import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { WorkRequestService } from '../../../../../services/work-request.service';
import type {
  MentorTaskResponse,
  MentorReviewRequest,
} from '../../../../../models/work-request.model';

@Component({
  selector: 'app-work-request-manager-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-request-manager-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkRequestManagerList implements OnInit {
  pendingTasks: MentorTaskResponse[] = [];
  loading = false;

  // Lưu trữ comment riêng biệt cho từng Task ID
  reviewComments: { [key: string]: string } = {};

  constructor(private workRequestService: WorkRequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPendingTasks();
  }

  loadPendingTasks(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workRequestService
      .getPendingTasks()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.pendingTasks = res.result ?? [];
        },
        error: (err) => console.error('[Manager] Lỗi tải danh sách yêu cầu:', err),
      });
  }

  onReview(taskId: string, isApproved: boolean): void {
    const comment = this.reviewComments[taskId] || (isApproved ? 'Đồng ý' : 'Từ chối');

    const request: MentorReviewRequest = {
      taskId: taskId,
      approved: isApproved,
      comment: comment,
    };

    this.workRequestService.completeTask(request).subscribe({
      next: () => {
        // Xóa task khỏi danh sách sau khi hoàn thành để UI cập nhật ngay lập tức
        this.pendingTasks = this.pendingTasks.filter((t) => t.taskId !== taskId);
        delete this.reviewComments[taskId];
        this.cdr.markForCheck();
      },
      error: (err) => alert('Lỗi xử lý duyệt đơn: ' + err.message),
    });
  }
}
