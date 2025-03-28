import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import * as packageJson from './../../../../package.json';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateService } from '@ngx-translate/core';
declare global {
  interface Window { electron: any; }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly version = packageJson.version;
  protected readonly _isUpdateAvailable = signal(false);
  protected readonly _isUpdateDownloaded = signal(false);
  private readonly _ngxTranslate = inject(TranslateService);

  constructor() {
    this._ngxTranslate.use('de-DE');

    window.electron.on('update_available', () => {
      this._isUpdateAvailable.set(true);
    });

    window.electron.on('update_downloaded', () => {
      this._isUpdateDownloaded.set(true);
    });

    window.electron.invoke('read_dir').then((a: any) => {
      console.log('A', a)
    }).catch((e: any) => {
      console.error('E', e)
    });
  }

  protected _onRestartApp() {
    window.electron.send('restart_app');
  }

  protected readonly _menuItems = signal<MenuItem[]>([]);
}
