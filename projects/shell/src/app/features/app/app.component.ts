import { Component } from '@angular/core';
import { FormComponent } from './form/form.component';

@Component({
  selector: 'app-root',
  imports: [FormComponent],
  templateUrl: './app.component.html',
})
export default class AppComponent { }
