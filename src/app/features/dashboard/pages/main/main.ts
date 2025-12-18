import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoleCard {
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  templateUrl: './main.html',
})
export class Main {
  roleCards: RoleCard[] = [
    {
      title: 'Business Analyst',
      description:
        'Phân tích nghiệp vụ, thu thập yêu cầu và xây dựng giải pháp kinh doanh hiệu quả cho khách hàng.',
      icon: '📊',
      color: 'from-orange-400 to-orange-600',
    },
    {
      title: 'Development',
      description:
        'Phát triển phần mềm, xây dựng ứng dụng và giải pháp công nghệ với các công nghệ hiện đại nhất.',
      icon: '💻',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Tester',
      description:
        'Đảm bảo chất lượng sản phẩm, kiểm thử và phát hiện lỗi để mang đến trải nghiệm tốt nhất.',
      icon: '🔍',
      color: 'from-green-400 to-green-600',
    },
  ];
}
