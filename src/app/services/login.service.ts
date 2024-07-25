import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable, from, of, zip, EMPTY } from 'rxjs';
import { tap, map, catchError, take, switchMap, timeout } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

import { NetworkService, ConnectionStatus } from './network.service';
import { OfflineManagerService } from './offline-manager.service';
import { LocalStorageKeys } from '../enums/local-storage-keys.enums';
import { User, UserResponse } from '../models/user-model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginurl = 'http://111.111.111.158:8080//webapp/rest/webappService/login?usr=';
  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storage: Storage,
    private offlineManager: OfflineManagerService,
    private toastController: ToastController) { }

  public login(user: string, password: string): Observable<User> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return this.getLocalUser();
    } else {
      return this.http.get(this.loginurl + user + '&pwd=' + password).pipe(
        timeout(3000),
        map((response: UserResponse) => response.dsdatos.usuario[0]),
        take(1),
        switchMap((response) => {
          if (response && response.mensaje === 'OK') {
            response.contraseña = password;
            return this.setLocalUser(response);
          }
        }),
        catchError((err) => {
          return this.getLocalUser().pipe(
            take(1),
            switchMap((localUser: User) => {
              if (localUser && localUser.id === user && localUser.contraseña === password) {
                return [localUser];
              } else {
                return [new User()];
              }
            })
          );
        })
      );
    }
  }

  // dev only methods
  public getLocalCredentials(): Observable<User> {
    return this.getLocalUser();
  }

  public deleteLocalData(): void {
    console.log('localCredentials deleted!');
    this.storage.remove(`${LocalStorageKeys.USER_KEY}-${LocalStorageKeys.USER_INFO}`);
  }
  // end of dev only methods

  // Set user locally
  private setLocalUser(data: User): Observable<User> {
    return from(this.storage.set(`${LocalStorageKeys.USER_KEY}-${LocalStorageKeys.USER_INFO}`, data));
  }

  // Get user saved locally
  private getLocalUser(): Observable<User> {
    return from(this.storage.get(`${LocalStorageKeys.USER_KEY}-${LocalStorageKeys.USER_INFO}`));
  }
}



