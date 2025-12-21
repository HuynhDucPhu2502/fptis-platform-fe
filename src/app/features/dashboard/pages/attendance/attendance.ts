import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../services/attendance.service';
import type {
  AttendanceResponse,
  StatusCountReportObject,
} from '../../../../models/attendance.model';
import type { ApiResponse, PageResponse } from '../../../../models/api-response.model';

import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive } from 'ng-apexcharts';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './attendance.html',
})
export class Attendance implements OnInit, OnDestroy {
  Math = Math;

  currentTime = '';
  currentDate = '';
  currentAttendance: AttendanceResponse | null = null;
  attendanceHistory: AttendanceResponse[] = [];
  isLoading = false;
  private timeInterval: any;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // ===== STATISTIC =====
  statusStats: StatusCountReportObject[] = [];

  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels: string[] = [];

  pieChart: ApexChart = {
    type: 'pie',
    width: 320,
  };

  pieResponsive: ApexResponsive[] = [
    {
      breakpoint: 768,
      options: {
        chart: { width: 260 },
        legend: { position: 'bottom' },
      },
    },
  ];

  constructor(private attendanceService: AttendanceService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);

    this.loadCurrentAttendance();
    this.loadAttendanceHistory();
    this.loadAttendanceStatistic();
  }

  ngOnDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.currentDate = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.cdr.detectChanges();
  }

  loadCurrentAttendance() {
    this.attendanceService.getCurrentAttendance().subscribe({
      next: (res: ApiResponse<AttendanceResponse>) => {
        this.currentAttendance = res.result;
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentAttendance = null;
        this.cdr.detectChanges();
      },
    });
  }

  loadAttendanceHistory() {
    this.attendanceService
      .getAttendanceHistory({
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (res: ApiResponse<PageResponse<AttendanceResponse>>) => {
          this.attendanceHistory = res.result.content;
          this.totalPages = res.result.totalPages;
          this.totalElements = res.result.totalElements;
          this.currentPage = res.result.page;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('[FPT IS] history error', err);
        },
      });
  }

  loadAttendanceStatistic() {
    this.attendanceService.getCurrentUserAttendanceStatistic().subscribe({
      next: (res: ApiResponse<StatusCountReportObject[]>) => {
        this.statusStats = res.result;

        this.pieSeries = this.statusStats.map((i) => i.count);
        this.pieLabels = this.statusStats.map((i) => i.status);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('[FPT IS] statistic error', err);
      },
    });
  }

  handleCheckIn() {
    this.isLoading = true;
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.loadAttendanceStatistic();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  handleCheckOut() {
    this.isLoading = true;
    this.attendanceService.checkOut().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.loadAttendanceStatistic();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAttendanceHistory();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAttendanceHistory();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAttendanceHistory();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(0, this.currentPage - Math.floor(max / 2));
    const end = Math.min(this.totalPages - 1, start + max - 1);

    if (end - start < max - 1) {
      start = Math.max(0, end - max + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatTime(time: string | null): string {
    if (!time) return '—';
    return time.split('.')[0];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CHECKED_IN_ON_TIME':
      case 'CHECKED_OUT_ON_TIME':
        return 'bg-green-50 text-green-700';
      case 'CHECKED_IN_LATE':
        return 'bg-red-50 text-red-700';
      case 'CHECKED_OUT_EARLY':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'CHECKED_IN_ON_TIME':
        return 'Vào đúng giờ';
      case 'CHECKED_IN_LATE':
        return 'Vào trễ';
      case 'CHECKED_OUT_ON_TIME':
        return 'Ra đúng giờ';
      case 'CHECKED_OUT_EARLY':
        return 'Ra sớm';
      default:
        return status || '—';
    }
  }

  downloadReport() {
    this.isLoading = true;
    this.attendanceService.downloadAttendanceReport().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BaoCao_ChamCong_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}
