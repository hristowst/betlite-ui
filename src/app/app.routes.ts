import { Routes } from '@angular/router';
import { MainContentComponent } from './components/main-content/main-content.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		canActivate: [AuthGuard],
		children: [
			{ path: '', component: MainContentComponent }
		]
	},
	{ path: 'login', component: LoginComponent },
	{ path: '**', redirectTo: '' }
];
