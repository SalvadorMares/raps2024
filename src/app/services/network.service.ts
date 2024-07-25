import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { BehaviorSubject, Observable, merge, of, fromEvent } from 'rxjs';
import { ToastController, Platform } from '@ionic/angular';

export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);
  private online$: Observable<boolean> = undefined;
  constructor(private network: Network, private toastController: ToastController, private platform: Platform) {
    this.platform.ready().then(() => {
      this.initializeNetworkEvents();
      const status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
    this.network.onDisconnect().subscribe(() => {
      console.log('ondisconect');
      if (this.status.getValue() === ConnectionStatus.Online) {
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });

    this.network.onConnect().subscribe(() => {
      console.log('onconnect');
      setTimeout(() => {
        if (this.status.getValue() === ConnectionStatus.Offline && this.network.type !== 'unknown') {
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      }, 3000);
    });
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);

    const connection = status === ConnectionStatus.Offline ? 'Offline' : 'Online';
    const toast = this.toastController.create({
      message: `You are now ${connection}` + this.network.type,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toastSignal => toastSignal.present());
  }
}
