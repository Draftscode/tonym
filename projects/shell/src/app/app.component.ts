import { Component, inject, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
const { ipcRenderer } = (window as any).require('electron');

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  updateAvailable = false;

  private readonly ngZone = inject(NgZone);

  constructor() {
    ipcRenderer.on('update_available', () => {
      this.ngZone.run(() => this.updateAvailable = true);
    });

    ipcRenderer.on('update_downloaded', () => {
      this.ngZone.run(() => this.updateAvailable = true);
    });
  }

  restartApp() {
    ipcRenderer.send('restart_app');
  }
}
