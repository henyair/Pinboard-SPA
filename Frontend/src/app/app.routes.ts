import { Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { AuthComponent } from './components/auth/auth.component';
import { MyAdsComponent } from './components/my-ads/my-ads.component';

export const routes: Routes = [
  { path: '', component: BoardComponent },
  { path: 'login', component: AuthComponent },
  { path: 'my-ads', component: MyAdsComponent }
];
