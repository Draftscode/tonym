import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import * as packageJson from './../../../../package.json';
import { AppService } from './app.service';
import { ElectronService } from './data-access/electron.service';

@Component({
  selector: 'app-root',
  styleUrl: 'app.component.scss',
  imports: [RouterOutlet, PopoverModule, DialogModule, TooltipModule, RouterLink, ToastModule, MenubarModule, MenuModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly version = packageJson.version;
  private readonly _ngxTranslate = inject(TranslateService);
  protected readonly _isSidebarOpen = signal<boolean>(false);
  protected readonly _electronService = inject(ElectronService);
  private readonly _appService = inject(AppService);
  protected readonly _menuItems = signal<MenuItem[]>([]);

  protected readonly _isLogVisible = signal<boolean>(false);
  protected readonly _logs = signal<string | null>(null);

  protected readonly _sidebarItems = computed(() => this._electronService.files().map(item => {
    return {
      label: item.name,
      routerLink: ['app'],
      icon: 'pi pi-file',
      queryParams: { filename: item.name }
    } as MenuItem;
  }));

  protected readonly _ping = toSignal(this._appService.ping());

  constructor() {
    this._ngxTranslate.use('de-DE');
  }

  protected _toggleSidebar() {
    this._isSidebarOpen.update(s => !s);
  }

  protected _onDeleteFile(filename: string) {
    this._electronService.deleteFile(filename);
  }

  protected async _onLogs() {
    this._isLogVisible.set(true);
    this._logs.set(await this._electronService.readLogs());
  }
}
