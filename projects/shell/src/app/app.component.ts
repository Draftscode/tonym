import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, Subject, take } from 'rxjs';
import * as packageJson from './../../../../package.json';
import { ElectronService } from './data-access/electron.service';
import { FileService } from './data-access/file.service';
import { ThemeService } from './data-access/theme.service';
import { FileDialogComponent } from './dialogs/file.dialog';

@Component({
  selector: 'app-root',
  styleUrl: 'app.component.scss',
  imports: [
    RouterOutlet, PopoverModule, RouterLinkActive, MessageModule,
    DividerModule, DialogModule, TooltipModule, DatePipe, InputTextModule,
    RouterLink, ToastModule, MenubarModule, TranslateModule, InputGroupModule,
    InputGroupAddonModule,
    MenuModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly version = packageJson.version;
  private readonly _ngxTranslate = inject(TranslateService);
  protected readonly _isSidebarOpen = signal<boolean>(false);
  protected readonly _electronService = inject(ElectronService);
  protected readonly _menuItems = signal<MenuItem[]>([]);
  protected readonly _themeService = inject(ThemeService);
  protected readonly fileService = inject(FileService);
  private readonly pDialog = inject(DialogService);

  protected readonly _isLogVisible = signal<boolean>(false);
  protected readonly _logs = signal<string | null>(null);

  protected readonly _sidebarItems = computed(() => this.fileService.files().map(i => {
    return {
      label: i.name,
      details: i.server_modified,
      id: i.id,
      routerLink: ['app'],
      icon: 'pi pi-file',
      queryParams: { filename: i.name }
    } as MenuItem;
  }));

  private readonly query$ = new Subject<string>();

  constructor() {
    this._ngxTranslate.use('de-DE');
    this.fileService.connectQuery(this.query$.pipe(debounceTime(500)));
  }

  protected _toggleSidebar() {
    this._isSidebarOpen.update(s => !s);
  }

  protected onInput(query: string) {
    this.query$.next(query);
  }

  protected _onDeleteFile(filename: string) {
    this.fileService.deleteFile(filename);
  }

  protected async _onLogs() {
    this._isLogVisible.set(true);
    this._logs.set(await this._electronService.readLogs());
  }

  protected _onAppClose() {
    this._electronService.closeApp();
  }

  protected onCreateFile() {
    const ref = this.pDialog.open(FileDialogComponent, {
      data: null,
      header: 'Datei erstellen'
    });

    ref.onClose.pipe(take(1)).subscribe(result => {
      if (result?.type === 'manually') {
        this.fileService.writeFile(result.data.name, {});
      }
    });
  }

  protected onEditFile(menuItem: MenuItem) {
    const file = this.fileService.files().find(file => file.id === menuItem.id);
    if (!file) { return; }

    const ref = this.pDialog.open(FileDialogComponent, {
      data: {
        Headers: 'Detei bearbeiten',
        name: file.name
      }
    });

    ref.onClose.pipe(take(1)).subscribe(result => {
      if (result?.type === 'manually') {
        this.fileService.renameFile(file.id, result.data.name);
      }
    });
  }
}
