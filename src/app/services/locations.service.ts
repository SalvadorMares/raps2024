import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable, from, zip } from 'rxjs';
import { tap, map, catchError, take, timeout } from 'rxjs/operators';

import { NetworkService, ConnectionStatus } from './network.service';
import { OfflineManagerService } from './offline-manager.service';
import { Ciudad, Colonia, Calle, CiudadResponse, ColoniaResponse, CalleResponse } from '../models/locations-model';
import { LocalStorageKeys } from '../enums/local-storage-keys.enums';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private ciudadesurl = 'http://111.111.111.158:8080//webapp/rest/webappService/ciudades?usuarioTecnico=';
  private coloniasurl = 'http://111.111.111.158:8080//webapp/rest/webappService/colonias?usuarioTecnico=';
  private callesurl = 'http://111.111.111.158:8080//webapp/rest/webappService/calles?usuarioTecnico=';
  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storage: Storage,
    private offlineManager: OfflineManagerService) { }

  public getCiudades(user: string): Observable<any> {
    // check for network status
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return this.getLocalCiudades();
    } else {
      return this.http.get(this.ciudadesurl + user).pipe(
        timeout(3000),
        map((response: CiudadResponse) => response.dsdatos.Ciudad),
        take(1),
        tap((response) => {
          this.setLocalCiudades(response.sort((x, y) => x.descripcion.localeCompare(y.descripcion)));
          return response;
        }),
        catchError(() => this.getLocalCiudades())
      );
    }
  }

  public getColonias(user: string): Observable<Colonia[]> {
    // check for network status
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return this.getLocalColonias();
    } else {
      return this.http.get(this.coloniasurl + user).pipe(
        timeout(3000),
        map((response: ColoniaResponse) => response.dsdatos.Colonia),
        take(1),
        tap((response) => {
          this.setLocalColonias(response.sort((x, y) => x.descripcion.localeCompare(y.descripcion)));
          return response;
        }),
        catchError(() => {
          return this.getLocalColonias();
        })
      );
    }
  }

  public getCalles(user: string): Observable<Calle[]> {
    // check for network status
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return this.getLocalCalles();
    } else {
      return this.http.get(this.callesurl + user).pipe(
        timeout(3000),
        map((response: CalleResponse) => response.dsdatos.Calle),
        take(1),
        tap((response) => {
          this.setLocalCalles(response.sort((x, y) => x.descripcion.localeCompare(y.descripcion)));
          return response;
        }),
        catchError(() => this.getLocalCalles())
      );
    }
  }

  public printLocalData(): Observable<any> {
    return zip(
      this.getLocalCiudades(),
      this.getLocalColonias(),
      this.getLocalCalles(),
    ).pipe(
      take(1),
      tap(([cds, col, call]) => {
        console.log('ciudades', cds);
        console.log('colonias', col);
        console.log('calles', call);
      })
    );
  }

  public deleteLocalData() {
    this.storage.remove(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CIUDADES}`);
    this.storage.remove(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.COLONIAS}`);
    this.storage.remove(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CALLES}`);
    console.log('local locations deleted!');
  }

  // Set Ciudades locally
  private setLocalCiudades(data: Ciudad[]): Observable<Ciudad[]> {
    return from(this.storage.set(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CIUDADES}`, data));
  }

  // Get all Ciudades saved locally
  private getLocalCiudades(): Observable<Ciudad[]> {
    return from(this.storage.get(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CIUDADES}`));
  }

  // Set Colonias locally
  private setLocalColonias(data: Ciudad[]): Observable<Colonia[]> {
    return from(this.storage.set(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.COLONIAS}`, data));
  }

  // Get all Colonias saved locally
  private getLocalColonias(): Observable<Colonia[]> {
    return from(this.storage.get(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.COLONIAS}`));
  }

  // Set Calles locally
  private setLocalCalles(data: Calle[]): Observable<Calle[]> {
    return from(this.storage.set(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CALLES}`, data));
  }

  // Get all Calles saved locally
  private getLocalCalles(): Observable<Calle[]> {
    return from(this.storage.get(`${LocalStorageKeys.LOCATION_STORAGE_KEY}-${LocalStorageKeys.CALLES}`));
  }
}
