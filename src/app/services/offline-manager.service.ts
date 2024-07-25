import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable, from, of, forkJoin, zip } from 'rxjs';
import { switchMap, finalize, take, tap, timeout, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { LocalStorageKeys } from '../enums/local-storage-keys.enums';
import { NetworkService, ConnectionStatus } from './network.service';
import { ActaResponse } from '../models/acta-model';
// import { ActaService } from './acta.service';

interface StoredRequest {
  url: string;
  type: string;
  data: any;
  time: number;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineManagerService {

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private networkService: NetworkService,
    private toastController: ToastController) { }

  public checkForEvents(user: string): Observable<boolean> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Online) {
    // if (false) {
      const toast = this.toastController.create({
        message: `Sincronizando actas con el servidor.`,
        duration: 3000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
      return zip(
        this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_ACTA + user}`),
        this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_MUL_OPT + user}`),
        this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_IMAGES + user}`)
        ).pipe(
        switchMap(([pendingActas, pendingMultOpt, pendingImages]) => {
          const requestArray = [];
          if (!pendingActas) {
            return of(false);
          }
          pendingActas.forEach((acta, index) => {
            requestArray.push(pendingActas[index]);
            requestArray.push(pendingMultOpt[index]);
            requestArray.push(pendingImages[index]);
          });
          return this.sendRequests(requestArray).pipe(
            switchMap(() => {
              this.storage.remove(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.PENDING_TO_SEND_ACTAS + user}`);
              this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_ACTA + user}`);
              this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_MUL_OPT + user}`);
              this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_IMAGES + user}`);
              return of(true);
            })
          );
        }),
        catchError(() => of(false))
      );
    } else {
      return of(false);
    }

  }

  public storeRequest(typeParam: string, urlParam: string, dataParam: any, IdParam: string, KEY_PARAM: string) {
    const request: StoredRequest = {
      url: urlParam,
      type: typeParam,
      data: dataParam,
      time: new Date().getTime(),
      id: IdParam
    };
    return this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${KEY_PARAM}`).then(storedOperations => {
      storedOperations ? storedOperations.push(request) : storedOperations = [request];

      // Save old & new local transactions back to Storage
      return this.storage.set(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${KEY_PARAM}`, storedOperations);
    });
  }

  sendRequests(operations: StoredRequest[]) {
    const obs = [];

    for (const op of operations) {
      console.log('Make one request: ', op);
      let oneObs;
      if (op.type === 'PUT') {
        oneObs = this.http.put(op.url, op.data);
      } else {
        oneObs = this.http.post(op.url, op.data);
      }
      // const oneObs = this.http.request(op.type, op.url, op.data);
      obs.push(oneObs);
    }

    // Send out all local events and return once they are finished
    return forkJoin(obs);
  }

}
