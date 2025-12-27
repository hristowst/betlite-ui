import { Routes } from '@angular/router';
import { MainContentComponent } from './components/main-content/main-content.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', component: MainContentComponent, canActivate: [AuthGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: '**', redirectTo: '' }
];
