import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../services/wallet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  balance: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(private wallet: WalletService, public auth: AuthService) { }

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) return;
    this.loading = true;
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.wallet.getMyProfile();
      this.balance = profile?.balance ?? null;
    } catch (err: any) {
      this.error = err?.message || 'Failed to load balance';
    } finally {
      this.loading = false;
    }
  }
}
