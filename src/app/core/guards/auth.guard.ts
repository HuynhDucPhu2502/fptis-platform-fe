import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../state/auth-state.service';
import { AuthService } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthStateService);
  const profile = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  if (!token) {
    auth.clear();
    router.navigate(['/home']);
    return false;
  }

  try {
    const res = await lastValueFrom(profile.getMe());
    if (res?.result) {
      auth.setUser(res.result);
      return true;
    }
    auth.clear();
    router.navigate(['/home']);
    return false;
  } catch {
    auth.clear();
    router.navigate(['/home']);
    return false;
  }
};
