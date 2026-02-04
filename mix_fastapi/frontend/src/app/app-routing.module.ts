import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DatabaseListComponent } from './pages/database-list/database-list.component';
import { WindowsListComponent } from './pages/windows-list/windows-list.component';
import { LinuxListComponent } from './pages/linux-list/linux-list.component';
import { LogsComponent } from './pages/logs/logs.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'databases', component: DatabaseListComponent },
  { path: 'windows', component: WindowsListComponent },
  { path: 'linux', component: LinuxListComponent },
  { path: 'logs', component: LogsComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
