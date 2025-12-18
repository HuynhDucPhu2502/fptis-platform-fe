import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-internal-request',
  imports: [CommonModule],
  templateUrl: './internal-request.html',
})
export class InternalRequest {
  requestTypes = [
    {
      id: 'leave',
      title: 'Đăng ký nghỉ phép',
      description: 'Gửi yêu cầu xin nghỉ phép cho quản lý duyệt',
      icon: 'calendar',
      color: 'orange',
      features: [
        'Chọn ngày nghỉ phép',
        'Nêu lý do nghỉ',
        'Theo dõi trạng thái duyệt',
        'Lịch sử nghỉ phép',
      ],
    },
    {
      id: 'remote',
      title: 'Đăng ký làm từ xa',
      description: 'Đăng ký làm việc từ xa theo nhu cầu công việc',
      icon: 'laptop',
      color: 'blue',
      features: [
        'Chọn ngày làm từ xa',
        'Ghi chú lý do',
        'Phê duyệt tự động',
        'Quản lý lịch làm việc',
      ],
    },
  ];

  onRequestClick(type: string) {
    console.log('[FPT IS] Request type clicked:', type);
  }
}
