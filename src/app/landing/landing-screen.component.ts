import { Component, OnInit, AfterViewInit, ViewChild  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { take, map, tap } from 'rxjs/operators';
import { zip, of } from 'rxjs';

import { Acta, LocalActa, Detalle, DetalleImg } from '../models/acta-model';
import { ActaService } from '../services/acta.service';
import { LocationsService } from '../services/locations.service';
import { OfflineManagerService } from '../services/offline-manager.service';
import { LoginService } from '../services/login.service';
import { Ciudad, Colonia, Calle } from '../models/locations-model';
import { ToastController } from '@ionic/angular';
import { NetworkService } from '../services/network.service';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing-screen.component.html',
  styleUrls: ['landing-screen.component.scss'],
})

export class LandingScreenComponent implements OnInit, AfterViewInit {
  hideloggin = false; // TEMPORAL
  showMainOpt = false;

  actasArray: Acta[];
  actasArrayToShow: Acta[];
  pendingActasArray: LocalActa[];
  pendingActaOptMul: Detalle[];
  pendingActaImages: DetalleImg[];
  pendingActasNumber: number;
  ciudades: Ciudad[];
  colonias: Colonia[];
  coloniasFiltered: Colonia[];
  calles: Calle[];
  callesFiltered: Calle[];
  isPendingActa: boolean;
  isLoggedIn = false;

  ciudadDisabled = false;
  coloniaDisabled = false;
  calleDisabled = false;

  selectedActa = new Acta();
  selectedCiudad = new Ciudad();
  selectedColonia = new Colonia();
  selectedCalle = new Calle();

  showActaForm = false;
  showActasList = false;
  showBackBtn = false;
  showColoniaInput = false;
  showCalleInput = false;
  showDropList = false;
  showLocationsDrops = false;
  showMainOptions = true;

  showPendingBadge = false;
  hideMainImg = false;

  user: string;

  constructor(
    private actaService: ActaService,
    private locationService: LocationsService,
    private loginService: LoginService,
    private offlineManager: OfflineManagerService,
    private networkService: NetworkService,
    private platform: Platform,
    private toastController: ToastController) { }

  public ngOnInit(): void {

  }

  public ngAfterViewInit(): void {
    // this.handleInput(document.querySelector('.ciudad-search-bar'));
    this.platform.backButton.subscribe(() => {
      this.backBtnPress();
      // if (this.showActaForm) {
      //   this.showActaForm = false;
      //   this.showActasList = true;
      // } else if (this.showActasList) {
      //   this.showActasList = false;
      //   if (this.isPendingActa) {
      //     this.showLocationsDrops = false;
      //     this.showMainOptions = true;
      //   } else {
      //     this.showLocationsDrops = true;
      //   }
      // } else if (this.showLocationsDrops) {
      //   this.showLocationsDrops = false;
      //   this.showMainOptions = true;
      //   this.showActasList = false;
      // }
    });
  }

  public onActaBackBtnPress(): void {
    this.showActaForm = false;
    this.showActasList = true;
  }

  public backBtnPress(): void {
    this.handleInput(document.querySelector('.ciudad-search-bar'));
    // this.platform.backButton.subscribe(() => {
    if (this.showActaForm) {
      this.showActaForm = false;
      this.showActasList = true;
    } else if (this.showActasList) {
      this.showActasList = false;
      if (this.isPendingActa) {
        this.showLocationsDrops = false;
        this.showMainOptions = true;
      } else {
        this.showLocationsDrops = true;
      }
    } else if (this.showLocationsDrops) {
      this.showLocationsDrops = false;
      this.showMainOptions = true;
      this.showActasList = false;
    }
    // });
    // set everything to his initial state
    // this.handleInput(document.querySelector('.ciudad-search-bar'));
    // this.resetLocations();
    // this.showActaForm = false;
    // this.showActasList = false;
    // this.showBackBtn = false;
    // this.showMainOptions = true;
    // this.showLocationsDrops = false;
  }

  public capturarActaOption(): void {
    this.resetLocations();
    this.isPendingActa = false;
    this.showBackBtn = true;
    this.showMainOptions = false;
    this.showLocationsDrops = true;
  }

  public ActasPendientesOption() {
    // to add location filter
    // this.resetLocations();
    // this.showLocationsDrops = true;
    if (this.pendingActasArray && this.pendingActasArray.length > 0) {
      this.actasArrayToShow = this.pendingActasArray.map((acta) => acta.acta);
      this.actasArrayToShow.sort((a, b) => {
        return a.prioridad - b.prioridad;
      });
      this.isPendingActa = true;
      this.showActasList = true;
      this.showBackBtn = true;
      this.showMainOptions = false;
      this.showLocationsDrops = false;
    } else {
      const toast = this.toastController.create({
        message: `Actualmente no cuentas con ninguna acta pendiente de enviar.`,
        duration: 2000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
    }
  }

  public clearCalleSelect(): void {
    this.selectedCalle = new Calle();
    this.calleDisabled = false;
  }

  public clearColoniaSelect(): void {
    this.selectedColonia = new Colonia();
    this.selectedCalle = new Calle();
    this.callesFiltered = [];
    this.coloniaDisabled = false;
    this.calleDisabled = false;
    this.showCalleInput = false;
    this.showDropList = true;
  }

  public clearCiudadSelect(): void {
    this.resetLocations();
    this.showDropList = true;
  }

  public initActasForm(selectedActaParam: Acta): void {
    // This is needed to make a copy of the acta and not reference it
    const elementPos = this.actasArrayToShow.map((x) => x.id).indexOf(selectedActaParam.id);
    this.selectedActa = JSON.parse(JSON.stringify(this.actasArrayToShow[elementPos]));
    if (!this.isPendingActa) {
      // Fill null or empty camps
      this.selectedActa.cantidadVisitas = this.selectedActa.cantidadVisitas ? this.selectedActa.cantidadVisitas : 1;
      this.selectedActa.fechaUltVisitaSinFormato = new Date().toISOString();
    } else {
      // Get the corresponding multiple options for the selected Acta
      this.pendingActaOptMul = this.pendingActasArray.find((acta) => acta.acta.id === this.selectedActa.id).multipleOpt;
      this.pendingActaImages = this.pendingActasArray.find((acta) => acta.acta.id === this.selectedActa.id).imagenes;
    }
    this.showActaForm = true;
    this.showActasList = false;
  }

  public logOut(): void {
    // this.hideMainImg = false;
    this.isLoggedIn = false;
    const loginElem = document.querySelector('.login-container') as HTMLElement;
    const loginElem2 = document.querySelector('.login-form-container') as HTMLElement;
    const mainOptElem = document.querySelector('.main-options') as HTMLElement;
    loginElem.classList.remove('fade-out');
    loginElem2.classList.remove('fade-out');
    mainOptElem.classList.remove('fade-in');
  }

  // Still needs to be polished
  public onActaSaved(ev: any) {
    if (ev.isSavedLocally) {
      this.actasArray = this.actasArray.filter((acta) => acta.id !== ev.actaSavedId);
      // En caso de que deseen reducir el numero de actas por calle, colonia y ciudad
      // this.actasArray = this.actasArray.filter((acta) => {
      //   if (acta.id !== ev.actaSavedId) {
      //     return acta;
      //   } else {
      //     return false;
      //     // this.calles.find((calle) => {
      //     //   if (calle.id === acta.idCalle) {
      //     //     calle.totalActas -= calle.totalActas;
      //     //     return true;
      //     //   }
      //     // });
      //   }
      // });
      this.pendingActasArray = ev.localActas;
      this.pendingActasNumber = ev.numberOfActas;
      this.showPendingBadge = true;
      const toast = this.toastController.create({
        message: `Acta guardada localmente, esta sera enviada automaticamente cuando se conecte a internet.`,
        duration: 3000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
    } else {
      this.getActas();
      const toast = this.toastController.create({
        message: `Actas registrada correctamente.`,
        duration: 3000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
    }
    this.actasArrayToShow = this.actasArrayToShow.filter((acta) => acta.id !== ev.actaSavedId);
    this.showActasList = true;
    this.showActaForm = false;
    // const contentElement: Content = document.getElementsByClassName('main-opt-container')[0];
    // contentElement.scrollTop();
  }

  public onLoggedIn(ev: any) {
    this.user = ev.user;
    this.showPendingBadge = false;
    // const loginElem = document.querySelector('.login-container ') as HTMLElement;
    // const mainOptElem = document.querySelector('.main-options') as HTMLElement;
    // let count = 1;
    // loginElem.classList.add('fade-out');
    // loginElem.onanimationend = () => {
    //   if (count === 2) {
    //     mainOptElem.classList.add('fade-in');
    //     this.isLoggedIn = true;
    //   } else {
    //     count ++;
    //   }
    // };
    this.isLoggedIn = true; // TEMP
    // this.hideMainImg = true; // TEMP
    // this.showMainOptions = true;
    // this.showMainOpt = true; // TEMP

    this.getActas();
  }

  private getActas() {
    zip(
      this.actaService.getActas(this.user),
      this.actaService.getPendingActas(this.user),
      this.locationService.getCiudades(this.user),
      this.locationService.getColonias(this.user),
      this.locationService.getCalles(this.user),
    ).pipe(
      take(1),
      map(([actas, pendingActas, ciudades, colonias, calles]) => {
        this.actasArray = actas;
        this.ciudades = ciudades;
        this.colonias = colonias;
        this.calles = calles;
        // this.hideMainImg = true;
        if (pendingActas && pendingActas.length > 0) {
          this.checkForPendingRequests();
          this.pendingActasArray = pendingActas;
          this.showPendingBadge = true;
          this.pendingActasNumber = pendingActas.length;
        } else {
          this.showPendingBadge = false;
        }
      })
    ).subscribe(() => {});
  }

  private checkForPendingRequests() {
    this.offlineManager.checkForEvents(this.user).pipe(
      take(1),
      tap((result) => {
        if (result) {
          this.actaService.getActas(this.user).pipe(
            take(1),
            tap((actas) => {
              this.showPendingBadge = false;
              this.pendingActasArray = [];
              this.pendingActasNumber = 0;
              this.actasArray = actas;
              const toast2 = this.toastController.create({
                message: `Actas pendientes de enviar han sido sincronizadas con el servidor.`,
                duration: 3000,
                position: 'bottom'
              });
              toast2.then(toastSignal => toastSignal.present());
            })
          ).subscribe(() => {});
        } else {
          const toast = this.toastController.create({
            message: `Sucedió un error al intentar enviar actas pendientes, se volverá a intentar la próxima vez que ingreses a la app con conexión.`,
            duration: 2000,
            position: 'bottom'
          });
          toast.then(toastSignal => toastSignal.present());
        }
      })
    ).subscribe(() => {});
  }

  public onCalleItemClick(calle: Calle): void {
    this.selectedCalle = calle;
    this.calleDisabled = true;
    this.showDropList = false;
    console.log(this.actasArray);
    this.actasArrayToShow = this.actasArray.filter((acta) => acta.idCalle === this.selectedCalle.id);
    this.actasArrayToShow.sort((a, b) => {
      return a.prioridad - b.prioridad;
    });
    if (this.actasArrayToShow && this.actasArrayToShow.length > 0) {
      this.showActas();
    } else {
      const toast = this.toastController.create({
        message: `No se encontraron actas con la informacion proporcionada.`,
        duration: 2000,
        position: 'bottom'
      });
      toast.then(toastSignal => toastSignal.present());
    }
  }

  public onColoniaItemClick(colonia: Colonia): void {
    this.selectedColonia = colonia;
    this.coloniaDisabled = true;
    this.showCalleInput = true;
    this.showDropList = false;
    this.callesFiltered = this.calles.filter((call) => call.idColonia === this.selectedColonia.id);
    this.handleInput(document.querySelector('.calle-search-bar'));
  }

  public onCiudadItemClick(ciudad: Ciudad): void {
    this.selectedCiudad = ciudad;
    this.ciudadDisabled = true;
    this.showColoniaInput = true;
    this.showDropList = false;
    this.coloniasFiltered = this.colonias.filter((col) => col.idCiudad === this.selectedCiudad.id);
    this.handleInput(document.querySelector('.colonia-search-bar'));
  }

  private handleInput(bar: any) {
    const searchBar = bar;
    searchBar.addEventListener('ionInput', (event: any) => {
      // this.showDropList = event.target.value.length >= 1 ? true : false;
      this.showDropList = true;
      if (this.showDropList) {
        const items = Array.from(document.querySelector('.options-list').children) as HTMLElement[];
        const query = event.target.value.toLowerCase();
        requestAnimationFrame(() => {
          items.forEach(item => {
            const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
            item.style.display = shouldShow ? 'block' : 'none';
          });
        });
      }
    });
  }

  private resetLocations(): void {
    this.selectedCalle = new Calle();
    this.selectedColonia = new Colonia();
    this.selectedCiudad = new Ciudad();
    this.callesFiltered = new Array<Calle>();
    this.coloniasFiltered = new Array<Colonia>();
    this.ciudadDisabled = false;
    this.coloniaDisabled = false;
    this.calleDisabled = false;
    this.showColoniaInput = false;
    this.showCalleInput = false;
  }

  private showActas(): void {
    this.showActasList = true;
    this.showLocationsDrops = false;
  }

  // Dev purposes only methods
  public printLocalActas() {
    this.actaService.printLocalData().subscribe(() => {});
    this.locationService.printLocalData().subscribe(() => {});
  }

  public deleteLocalData() {
    this.actaService.deleteLocalData();
    this.locationService.deleteLocalData();
    this.loginService.deleteLocalData();
  }
}
