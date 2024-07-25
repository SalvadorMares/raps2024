import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

import { User } from '../models/user-model';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})

export class LoginComponent implements OnInit {
  showPassword = true;
  hidePassword = false;
  password = '';
  user = '';
  @Output() isLoggedIn: EventEmitter<{ user: string }> = new EventEmitter();

  constructor(
    private loginService: LoginService,
    private toastController: ToastController) { }
  ngOnInit() {
    this.loginService.getLocalCredentials().pipe(
      take(1),
      tap((user) => {
        if (user !== null) {
          this.user = user.id;
          this.password = user.contraseña;
        }
      })
    ).subscribe(() => {});
  }


  public eyeIconPress(): void {
    if (this.password === '' || this.password === undefined) {
      return;
    } else {
      const elem = document.querySelector('#login-password-input') as HTMLElement;
      const icon = document.querySelector('#login-password-icon') as HTMLElement;
      if (elem.getAttribute('type') === 'password') {
        elem.setAttribute('type', 'text');
        icon.setAttribute('name', 'eye-off');
      } else {
        elem.setAttribute('type', 'password');
        icon.setAttribute('name', 'eye');
      }
    }
  }

  public login(): void {
    this.loginService.login(this.user, this.password).pipe(
      take(1),
      tap((credentials: User) => {
        if (credentials && credentials.mensaje === 'OK') {
          // const loginElem = document.querySelector('.login-form-container') as HTMLElement;
          // loginElem.classList.add('fade-out');
          // loginElem.onanimationend = () => {
          this.isLoggedIn.emit({ user: credentials.id });
          // };
        } else {
          const toast = this.toastController.create({
            message: `Credenciales incorrectas, por favor intenta nuevamente.`,
            duration: 3000,
            position: 'bottom'
          });
          toast.then(toastSignal => toastSignal.present());
        }
      })
    ).subscribe(() => {}, (error) => {
    });
  }
}
