
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, from, of, zip } from 'rxjs';
import { tap, map, catchError, take, switchMap, timeout } from 'rxjs/operators';

import { NetworkService, ConnectionStatus } from './network.service';
import { OfflineManagerService } from './offline-manager.service';
import { Acta, ActaResponse, SaveActaResponse, OptionMultipleResponse, OpcionMultiple, Detalle, LocalActa, DetalleImg } from '../models/acta-model';
import { LocalStorageKeys } from '../enums/local-storage-keys.enums';

@Injectable({
  providedIn: 'root'
})
export class ActaService {
  public actaurl = 'http://111.111.111.158:8080//webapp/rest/webappService/actas';
  public optionsurl = 'http://111.111.111.158:8080//webapp/rest/webappService/opciones';
  public detalleactaurl = 'http://111.111.111.158:8080//webapp/rest/webappService/detalle';
  public imagenesurl = 'http://111.111.111.158:8080//webapp/rest/webappService/fotos';
  public user: string;

  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storage: Storage,
    private toastController: ToastController,
    private offlineManager: OfflineManagerService) { }

  // Dev purpose only methods
  public deleteLocalData() {
    this.storage.remove(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.AVAILABLE_ACTAS + this.user}`);
    this.storage.remove(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.PENDING_TO_SEND_ACTAS + this.user}`);
    this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_ACTA + this.user}`);
    this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_MUL_OPT + this.user}`);
    this.storage.remove(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_IMAGES + this.user}`);
    console.log('local data deleted!');
  }

  public printLocalData(): Observable<any> {
    return zip(
      this.getLocalActas(this.user),
      this.getPendingActas(this.user),
      this.getPendingRequests(this.user),
      this.getPendingMultRequests(this.user)
    ).pipe(
      take(1),
      tap(([localActa, pendingacta, pendingrequest, pendingmultRequest]) => {
        console.log('ActasList', localActa);
        console.log('ActasPending', pendingacta);
        console.log('Pending request', pendingrequest);
        console.log('Pending Mult Requests', pendingmultRequest);
      })
    );
  }
  // End of dev purpose only methods

  /**
   * Get Actas from the API, if user is offline the Actas are retrieved from the localstorage
   * @param string user
   * @returns Observable<Acta[]>
   */
  public getActas(user: string, forceRefresh = false): Observable<Acta[]> {
    this.user = user;
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      const toast = this.toastController.create({
        message: `actas obtenidas localmente por falta de conexion.`,
        duration: 3000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
      return this.getLocalActas(user);
    } else {
      return this.http.get(this.actaurl + '?usuarioTecnico=' + user).pipe(
        timeout(4000),
        // map((response: ActaResponse) => response.dsdatos),
        switchMap((response: ActaResponse) => {
          if (response.dsdatos.Acta) {
          // const response = dsdatos.Acta;
          // we remove non populated camps to keep the local object as small as posible
          response.dsdatos.Acta.map((acta) => {
            Object.keys(acta).map((key) =>
              (acta[key] === 0 || acta[key] === '0' || acta[key] === '' || acta[key] === null || acta[key] === false ) && delete acta[key]);
          });

          // Save the actas on the local storage
          this.setLocalActas(response.dsdatos.Acta, user);
          return [response.dsdatos.Acta];
          } else {
            const toast = this.toastController.create({
              message: `Actualmente no cuenta con actas disponibles para capturar.`,
              duration: 3000,
              position: 'bottom'
            });
            toast.then(toastSignal => toastSignal.present());
            // Save the actas on the local storage
            this.setLocalActas([], user);
            return [];
          }
        }),
        catchError((err) => {
          const toast = this.toastController.create({
            message: `actas obtenidas localmente por error del API.`,
            duration: 3000,
            position: 'bottom'
          });
          toast.then(toastSignal => toastSignal.present());
          return this.getLocalActas(user);
        })
      );
    }
  }

  /**
   * Get the multiple options for an Acta from the API, if user is offline the options are retrieved from the localstorage
   * @returns Observable<Acta[]>
   */
  public getMultipleOptions(): Observable<OpcionMultiple[]> {
    // if user online
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      console.log('MulOpt obtenidas localmente por modo offline');
      return this.getLocalMultOpt();
    } else {
      // if user is offline
      return this.http.get(this.optionsurl).pipe(
        timeout(3000),
        map((response: OptionMultipleResponse) => {
          const formattedResponse: OpcionMultiple[] = response.dsdatos.Opciones;
          formattedResponse.map((option) => {
            option.isChecked = false;
          });
          this.setLocalMultOpt(formattedResponse);
          console.log('MulOpt obtenidas del API', formattedResponse);
          return formattedResponse;
        }),
        catchError(() => {
          console.log('MulOpt obtenidas localmente por error del API');
          return this.getLocalMultOpt();
        })
      );
    }
  }

  /**
   * Put Actas to the API, if user is offline the Actas are gonna be saved locally to be saved when a stable conection is detected
   * @param Acta actaToSave
   * @param Detalle[] opt
   * @param DetalleImg[] imgArray
   * @returns Observable<SaveActaResponse>
   */
  public sendActa(actaToSave: Acta, opt: Detalle[], imgArray: DetalleImg[]): Observable<SaveActaResponse> {
    // This ID is used to know which requests correspond to which Acta
    const actaResponse = new SaveActaResponse();
    const requestData: ActaResponse = {dsdatos: {Acta: [actaToSave]}};
    const requestDataDetalle = {dsdatos: {Detalle: opt}};
    const requestImagenes = {request: {ttFile: {ttFile: imgArray}}};

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
    // if (true) {
      return this.saveActaLocally(actaToSave, opt, imgArray);
    } else {
      // Send request as normal and return a success
      return this.http.put(this.actaurl, requestData).pipe(
        timeout(5000),
        map((response: ActaResponse) => response.dsdatos),
        switchMap(() => {
          return this.http.put(this.detalleactaurl, requestDataDetalle).pipe(
            switchMap(() => {
              return this.http.post(this.imagenesurl, requestImagenes).pipe(
                switchMap(() => {
                  actaResponse.successApi = true;
                  actaResponse.actaSavedId = actaToSave.id;
                  return of(actaResponse);
                })
              );
            })
          );
        }),
        catchError((err) => {
          const toast = this.toastController.create({
            message: `Actas guardada localmente por error del API.`,
            duration: 3000,
            position: 'bottom'
          });
          toast.then(toastSignal => toastSignal.present());
          return this.saveActaLocally(actaToSave, opt, imgArray);
        })
      );
    }
  }

  private saveActaLocally(actaToSave: Acta, opt: Detalle[], imgArray: DetalleImg[]): Observable<SaveActaResponse> {
    const actaResponse = new SaveActaResponse();
    const storeID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    const localActa: LocalActa = { acta: actaToSave, multipleOpt: opt, id: storeID, imagenes: imgArray };
    const requestData: ActaResponse = {dsdatos: {Acta: [actaToSave]}};
    const requestDataDetalle = {dsdatos: {Detalle: opt}};
    const requestImagenes = {request: {ttFile: {ttFile: imgArray}}};
    // If we are offline we save the unsend requests first
    return zip(
      from(this.offlineManager.storeRequest( 'PUT', this.actaurl, requestData, storeID, LocalStorageKeys.PENDING_REQUEST_ACTA + this.user)),
      from(this.offlineManager.storeRequest( 'PUT', this.detalleactaurl, requestDataDetalle, storeID, LocalStorageKeys.PENDING_REQUEST_MUL_OPT + this.user)),
      from(this.offlineManager.storeRequest('POST', this.imagenesurl, requestImagenes, storeID, LocalStorageKeys.PENDING_REQUEST_IMAGES + this.user))
    ).pipe(
      switchMap(() => {
        return zip(
          this.getPendingActas(this.user),
          this.getLocalActas(this.user)
        ).pipe(
          switchMap(([pendingActas, localActas]) => {
            pendingActas ? pendingActas.push(localActa) : pendingActas = [localActa];
            this.setLocalActas(localActas.filter((act) => act.id !== localActa.acta.id), this.user);
            return this.setPendingActas(pendingActas, this.user).pipe(
              switchMap((newLocalActas) => {
                actaResponse.actaSavedId = actaToSave.id;
                actaResponse.successApi = false;
                actaResponse.localActas = newLocalActas;
                return of(actaResponse);
              })
            );
          })
        );
      })
    );
  }

  /**
   * Get cached Actas
   */
  private getLocalActas(user: string): Observable<Acta[]> {
    return from(this.storage.get(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.AVAILABLE_ACTAS + user}`));
  }

  /**
   * Set cached Actas
   */
  private setLocalActas(data: Acta[], user: string): Observable<Acta[]> {
    return from(this.storage.set(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.AVAILABLE_ACTAS + user}`, data));
  }

  /**
   * Get cached Multiple options
   */
  private getLocalMultOpt(): Observable<OpcionMultiple[]> {
    return from(this.storage.get(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.MULTIPLE_OPTIONS}`));
  }

  /**
   * Set cached Multiple options
   */
  private setLocalMultOpt(data: OpcionMultiple[]): Observable<OpcionMultiple[]> {
    return from(this.storage.set(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.MULTIPLE_OPTIONS}`, data));
  }

  /**
   * Get all Actas that are pending to send
   */
  public getPendingActas(user: string): Observable<LocalActa[]> {
    return from(this.storage.get(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.PENDING_TO_SEND_ACTAS + user}`));
  }

  /**
   * Set all Actas that are pending to send
   */
  private setPendingActas(data: LocalActa[], user: string): Observable<LocalActa[]> {
    return from(this.storage.set(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.PENDING_TO_SEND_ACTAS + user}`, data));
  }

  // /**
  //  * Get all Images that are pending to send
  //  */
  // public getPendingImages(user: string): Observable<DetalleImg[]> {
  //   return from(this.storage.get(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.IMAGES + user}`));
  // }

  // /**
  //  * Save images from acta locally
  //  */
  // private setPendingImages(data: DetalleImg[], user: string): Observable<DetalleImg[]> {
  //   return from(this.storage.set(`${LocalStorageKeys.ACTA_STORAGE_KEY}-${LocalStorageKeys.IMAGES + user}`, data));
  // }



  // remove once dev is done
  private getPendingMultRequests(user: string): Observable<LocalActa[]> {
    return from(this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_MUL_OPT + user}`));
  }

  // Remove once dev is done
  private getPendingRequests(user: string): Observable<LocalActa[]> {
    return from(this.storage.get(`${LocalStorageKeys.REQUEST_STORAGE_KEY}-${LocalStorageKeys.PENDING_REQUEST_ACTA + user}`));
  }
}
