import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../../state/auth-state.service';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  requiredRole?: string;
}

@Component({
  selector: 'dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  private auth = inject(AuthStateService);

  collapsed = signal(false);

  ngOnInit() {
    console.log('[FPT IS] Sidebar initialized');
    console.log('[FPT IS] Auth service:', this.auth);
    console.log('[FPT IS] Current user on init:', this.auth.currentUser());
  }

  toggle() {
    this.collapsed.update((v) => !v);
  }

  allMenuItems: MenuItem[] = [
    { icon: 'home', label: 'Trang Chính', href: 'main' },
    { icon: 'clock', label: 'Chấm Công', href: 'attendance' },
    { icon: 'document', label: 'Nhật Ký', href: 'work-log' },
    { icon: 'clipboard', label: 'Yêu Cầu Nội Bộ', href: 'work-request' },
    {
      icon: 'users',
      label: 'Quản lý người dùng',
      href: 'users-management',
      requiredRole: 'USERS_VIEW',
    },
  ];

  menuItems = computed(() => {
    const user = this.auth.currentUser();
    const userRoles = user?.roles || [];

    console.log('[FPT IS] Current user in sidebar:', user);
    console.log('[FPT IS] User roles:', userRoles);
    console.log('[FPT IS] Has USERS_VIEW role:', userRoles.includes('USERS_VIEW'));

    return this.allMenuItems.filter((item) => {
      if (!item.requiredRole) return true;
      const hasRole = userRoles.includes(item.requiredRole);
      console.log(`[FPT IS] Menu item "${item.label}" requires "${item.requiredRole}":`, hasRole);
      return hasRole;
    });
  });
}
