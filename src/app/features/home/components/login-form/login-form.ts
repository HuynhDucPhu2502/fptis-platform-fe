import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../../services/auth.service';
import { AuthStateService } from '../../../../state/auth-state.service';
import type { LoginRequest } from '../../../../models/user.model';
import { importPublicKey, rsaEncrypt } from '../../../../utils/rsa.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
})
export class LoginForm implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  /** RSA public key (WebCrypto) */
  private rsaKey?: CryptoKey;

  /** Form */
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  /** UI */
  showPassword = signal(false);
  isLoading = signal(false);

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  // =========================================================
  // INIT – load public key ONCE
  // =========================================================
  async ngOnInit() {
    try {
      const pubKeyBase64 = await firstValueFrom(this.authService.getPublicKey());

      this.rsaKey = await importPublicKey(pubKeyBase64.trim().replace(/\s+/g, ''));
    } catch (e) {
      console.error(e);
      this.snack.open('Không tải được khóa bảo mật', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }
  }

  // =========================================================
  // SUBMIT
  // =========================================================
  async onSubmit() {
    if (this.form.invalid || !this.rsaKey) return;

    this.isLoading.set(true);

    try {
      const raw = this.form.getRawValue();

      const encryptedPassword = await rsaEncrypt(this.rsaKey, raw.password!);

      const payload: LoginRequest = {
        username: raw.username!,
        password: encryptedPassword,
        isCrypted: true,
      };

      this.authService.login(payload).subscribe({
        next: (res) => {
          if (res.code !== 1000) {
            this.snack.open(res.message ?? 'Sai thông tin đăng nhập', 'Đóng', { duration: 2000 });
            this.isLoading.set(false);
            return;
          }

          localStorage.setItem('access_token', res.result);

          this.authService.getMe().subscribe({
            next: (me) => {
              this.authState.setUser(me.result);
              this.router.navigateByUrl('/dashboard');
            },
            error: () => {
              this.snack.open('Không lấy được thông tin người dùng', 'Đóng', { duration: 2000 });
            },
          });

          this.isLoading.set(false);
        },
        error: (err) => {
          const msg = err.error?.message ?? 'Lỗi kết nối máy chủ';
          this.snack.open(msg, 'Đóng', { duration: 2000 });
          this.isLoading.set(false);
        },
      });
    } catch (e) {
      this.snack.open('Lỗi mã hóa mật khẩu', 'Đóng', {
        duration: 2000,
      });
      this.isLoading.set(false);
    }
  }
}
