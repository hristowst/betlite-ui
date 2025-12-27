import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.signIn(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err?.message ?? 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
