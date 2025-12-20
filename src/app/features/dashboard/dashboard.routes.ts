import type { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
  },
  {
    path: 'work-log',
    loadComponent: () => import('./pages/daily-log/daily-log').then((m) => m.DailyLog),
  },
  {
    path: 'attendance',
    loadComponent: () => import('./pages/attendance/attendance').then((m) => m.Attendance),
  },
  {
    path: 'work-request',
    loadComponent: () => import('./pages/work-request/work-request').then((m) => m.WorkRequest),
  },
  {
    path: 'users-management',
    loadComponent: () =>
      import('./pages/users-management/users-management').then((m) => m.UsersManagement),
  },
];
