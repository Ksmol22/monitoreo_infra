import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Services
import { ApiService } from './services/api.service';
import { SystemsService } from './services/systems.service';
import { MetricsService } from './services/metrics.service';
import { LogsService } from './services/logs.service';
import { DashboardService } from './services/dashboard.service';

// Components
import { LayoutComponent } from './components/layout/layout.component';
import { LoaderComponent } from './components/loader/loader.component';
import { MetricCardComponent } from './components/metric-card/metric-card.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { AddSystemDialogComponent } from './components/add-system-dialog/add-system-dialog.component';

// Pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DatabaseListComponent } from './pages/database-list/database-list.component';
import { WindowsListComponent } from './pages/windows-list/windows-list.component';
import { LinuxListComponent } from './pages/linux-list/linux-list.component';
import { LogsComponent } from './pages/logs/logs.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoaderComponent,
    MetricCardComponent,
    StatusBadgeComponent,
    AddSystemDialogComponent,
    DashboardComponent,
    DatabaseListComponent,
    WindowsListComponent,
    LinuxListComponent,
    LogsComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    ApiService,
    SystemsService,
    MetricsService,
    LogsService,
    DashboardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
