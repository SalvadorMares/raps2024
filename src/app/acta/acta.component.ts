import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Component, OnInit, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { PopoverController, ToastController, Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { take, tap } from 'rxjs/operators';

import { Acta, Detalle, LocalActa, ActaLocation, EstadoActa, SaveActaResponse, OpcionMultiple, DetalleImg } from '../models/acta-model';
import { ActaService } from '../services/acta.service';
import { DefectosPopoverComponent } from '../modals/defectos/defectos-popover.component';
import { MejorasPopoverComponent } from '../modals/mejoras/mejoras-popover.component';
import { ImagesArray } from '../consts/images.const';
import { MultipleOptionsType } from '../enums/multiple-options-type.enum';

@Component({
  selector: 'app-acta-form',
  templateUrl: 'acta.component.html',
  styleUrls: ['acta.component.scss'],
})
export class ActaComponent implements OnInit, AfterViewInit {
  @Input() isPendingActa: boolean;
  @Input() selectedActa: Acta;
  @Input() selectedActaMulOpt?: Detalle[];
  @Input() selectedActaImages: DetalleImg[];
  @Output() actaSaved: EventEmitter<{isSavedLocally: boolean, localActas?: LocalActa[], numberOfActas?: number, actaSavedId: number }> = new EventEmitter();
  @Output() backBtnPress: EventEmitter<{isBtnPressed: boolean}> = new EventEmitter();
  public geoAddress = new ActaLocation();
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  cameraOptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    targetWidth: 720,
    correctOrientation: true
  };

  accionSelected = false;
  isLoaded = false;
  isSendingActa = false;

  aparatosOptionsDisabled = false;
  areaMejoraOptionsDisabled = false;
  controlHermOptionsDisabled = false;
  coDiluidoOptionsDisabled = false;
  equiposMejoraOptionsDisabled = false;

  areaMejoraFormValid = false;
  controlHermFormValid = false;
  coDiluidoFormValid = false;
  equipoConsumoFormValid = false;

  estadoActaOptions = new EstadoActa();
  accionesOptions = new EstadoActa();
  areaMejoraOptions = new Array<Detalle>();
  aparatosOptions = new Array<Detalle>();
  controlHermOptions = new Array<Detalle>();
  coDiluidoOptions = new Array<Detalle>();
  equiposMejoraOptions = new Array<Detalle>();
  resultadosOptions = new Array<Detalle>();

  imagenComprobanteInspeccion: string;
  imagenIdentificacion: string;
  imagenInfo: string;
  imagenVisita: string;
  imagenesArray: DetalleImg[];



  constructor(
    private actaService: ActaService,
    private camera: Camera,
    private platform: Platform,
    private popOverController: PopoverController,
    private toastController: ToastController,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder) { }

  ngOnInit(): void {
    this.getGeolocation();
    this.imagenesArray = JSON.parse(JSON.stringify(ImagesArray));
    if (!this.isPendingActa) {
      this.actaService.getMultipleOptions().pipe(
        take(1),
        tap((options: OpcionMultiple[]) => {
          this.assignMultipleOpt(options);
        })
      ).subscribe(() => {});
    } else {
      this.assignMultipleOpt(this.selectedActaMulOpt);
      this.selectedActaImages.forEach((image) => {
        switch (image.nombreArchivo) {
          case 'imagenInfo.png' : {
            this.imagenInfo = 'data:image/jpeg;base64,' + image.fotoBase;
            break;
          }
          case 'imagenVisita.png' : {
            this.imagenVisita = 'data:image/jpeg;base64,' + image.fotoBase;
            break;
          }
          case 'imagenIdentificacion.png' : {
            this.imagenIdentificacion = 'data:image/jpeg;base64,' + image.fotoBase;
            break;
          }
          case 'imagenComprobanteInspeccion.png' : {
            this.imagenComprobanteInspeccion = 'data:image/jpeg;base64,' + image.fotoBase;
            break;
          }
        }});
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true; // still not in use
    this.platform.backButton.subscribe(() => {
      this.backBtnPress.emit({isBtnPressed: true});
    });
  }

  /**
   * Asign the multiple options of the Acta to the corresponding array of options
   * @param OpcionMultiple[] options
   */
  public assignMultipleOpt(options: OpcionMultiple[]): void {
    this.estadoActaOptions.options = new Array<Detalle>();
    this.accionesOptions.options = new Array<Detalle>();
    options.forEach((op: Detalle) => {
      switch (op.tipo) {
        case MultipleOptionsType.RAP_ACCIONES: {
          // this.isPendingActa ? this.accionSelected = true : this.accionSelected = false;
          this.accionesOptions.optionSelected = this.isPendingActa ? op.indice : null;
          this.accionesOptions.options.push(op);
          break;
        }
        case MultipleOptionsType.RAP_APARATOS: {
          this.aparatosOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_CONTROL_HERMETICIDAD: {
          op.valor = op.indice;
          this.controlHermOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_CO_DILUIDO: {
          op.valor = op.indice;
          this.coDiluidoOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_AREAS_MEJORA: {
          this.areaMejoraOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_MEJORA_EQUIPOS: {
          this.equiposMejoraOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_RESULTADOS: {
          this.resultadosOptions.push(op);
          break;
        }
        case MultipleOptionsType.RAP_SINGULARES: {
          this.estadoActaOptions.optionSelected = this.isPendingActa ? op.indice : null;
          this.estadoActaOptions.options.push(op);
          break;
        }
        default: break;
      }
    });
  }

  /**
   * Collapse the Acta sections depending on the sectionCode recieve as a parameter
   * @param number sectionCode
   */
  public goToNext(sectionCode: number): void {
    let element: HTMLElement;
    let belowElement: HTMLElement;
    switch (sectionCode) {
      case 1: {
        element = document.getElementById('informacion-collaps') as HTMLElement;
        belowElement = document.getElementById('visita-collaps') as HTMLElement;
        break;
      }
      case 2: {
        element = document.getElementById('visita-collaps') as HTMLElement;
        belowElement = document.getElementById('prueba-litrage-collaps') as HTMLElement;
        break;
      }
      case 3: {
        element = document.getElementById('prueba-litrage-collaps') as HTMLElement;
        belowElement = document.getElementById('aparatos-collaps') as HTMLElement;
        break;
      }
      case 4 : {
        element = document.getElementById('aparatos-collaps') as HTMLElement;
        belowElement = document.getElementById('relacion-defectos-collaps') as HTMLElement;
        break;
      }
      case 5 : {
        element = document.getElementById('relacion-defectos-collaps') as HTMLElement;
        belowElement = document.getElementById('area-mejora-collaps') as HTMLElement;
        break;
      }
      case 6: {
        element = document.getElementById('area-mejora-collaps') as HTMLElement;
        belowElement = document.getElementById('resultados-collaps') as HTMLElement;
        break;
      }
      case 7: {
        element = document.getElementById('resultados-collaps') as HTMLElement;
        belowElement = document.getElementById('accion-collaps') as HTMLElement;
        break;
      }
      case 8: {
        element = document.getElementById('accion-collaps') as HTMLElement;
        belowElement = document.getElementById('identificacion-collaps') as HTMLElement;
        break;
      }
      default: {
        break;
      }
    }
    element.click();
    belowElement.click();
  }

  /**
   * Send Acta request to the Acta Service
   * @param boolean fullFlow
   */
  public sendRequest(fullFlow: boolean): void {
    const optMulArray = new Array<Detalle>();
    this.isSendingActa = true;
    this.selectedActa.latitude = this.geoAddress.latitude;
    this.selectedActa.longitude = this.geoAddress.longitude;
    this.selectedActa.ubicacionActa = this.geoAddress.location;
    const dateAux = new Date().toLocaleString('es').split(' ');
    this.selectedActa.fechaUltVisita = this.formatDatetoStringPut(new Date());
    this.selectedActa.horaUltVisita = dateAux[1];

    this.imagenesArray = this.imagenesArray.filter((img) => img.fotoBase !== '');
    this.imagenesArray.forEach((img) => img.folio = this.selectedActa.id);

    if (fullFlow) {
      this.selectedActa.estatus = 'TERMINADA';
      optMulArray.push(...this.accionesOptions.options.filter((opt) => opt.indice === this.accionesOptions.optionSelected));
      optMulArray.push(...this.areaMejoraOptions.filter((opt) => opt.isChecked));
      optMulArray.push(...this.aparatosOptions.filter((opt) => opt.isChecked));
      optMulArray.push(...this.controlHermOptions.filter((opt) => opt.isChecked));
      optMulArray.push(...this.coDiluidoOptions.filter((opt) => opt.isChecked));
      optMulArray.push(...this.equiposMejoraOptions.filter((opt) => opt.isChecked));
      optMulArray.push(...this.resultadosOptions.filter((opt) => opt.isChecked));
      if (this.aparatosOptionsDisabled) {
        const emptyDetalle = new Detalle();
        emptyDetalle.isChecked = true;
        emptyDetalle.indice = 'N/A';
        emptyDetalle.valor = 'N/A';
        emptyDetalle.tipo = MultipleOptionsType.RAP_APARATOS;
        optMulArray.push(emptyDetalle);
      }
      if (this.controlHermOptionsDisabled) {
        const emptyDetalle = new Detalle();
        emptyDetalle.isChecked = true;
        emptyDetalle.indice = 'N/A';
        emptyDetalle.valor = 'N/A';
        emptyDetalle.tipo = MultipleOptionsType.RAP_CONTROL_HERMETICIDAD;
        optMulArray.push(emptyDetalle);
      }
      if (this.coDiluidoOptionsDisabled) {
        const emptyDetalle = new Detalle();
        emptyDetalle.isChecked = true;
        emptyDetalle.indice = 'N/A';
        emptyDetalle.valor = 'N/A';
        emptyDetalle.tipo = MultipleOptionsType.RAP_CO_DILUIDO;
        optMulArray.push(emptyDetalle);
      }
      if (this.areaMejoraOptionsDisabled) {
        const emptyDetalle = new Detalle();
        emptyDetalle.isChecked = true;
        emptyDetalle.indice = 'N/A';
        emptyDetalle.valor = 'N/A';
        emptyDetalle.tipo = MultipleOptionsType.RAP_AREAS_MEJORA;
        optMulArray.push(emptyDetalle);
      }
      if (this.equiposMejoraOptionsDisabled) {
        const emptyDetalle = new Detalle();
        emptyDetalle.isChecked = true;
        emptyDetalle.indice = 'N/A';
        emptyDetalle.valor = 'N/A';
        emptyDetalle.tipo = MultipleOptionsType.RAP_MEJORA_EQUIPOS;
        optMulArray.push(emptyDetalle);
      }
    } else {
      this.selectedActa.estatus = 'VISITADA';
    }
    optMulArray.push(...this.estadoActaOptions.options.filter((opt) => opt.indice === this.estadoActaOptions.optionSelected));
    optMulArray.map((opt) => opt.idActa = this.selectedActa.id);

    this.actaService.sendActa(this.selectedActa, optMulArray, this.imagenesArray).pipe(
      take(1),
      tap((response: SaveActaResponse) => {
        if (!response.successApi) {
          response.localActas = response.localActas.filter((acta) => acta !== null);
          this.actaSaved.emit({isSavedLocally: true, localActas: response.localActas, numberOfActas: response.localActas.length, actaSavedId: response.actaSavedId });
        } else {
          this.actaSaved.emit({isSavedLocally: false, actaSavedId: response.actaSavedId });
        }
      })
    ).subscribe(() => {});
  }

  // Function triggered when the user clicks the N/A option on control hereticidad options
  public conHermNaClick() {
    this.controlHermOptions.forEach((opt) => opt.isChecked = false);
    this.controlHermOptionsDisabled = !this.controlHermOptionsDisabled;
    this.controlHermFormValid =  this.controlHermOptionsDisabled;
  }

  // Function triggered when the user clicks the N/A option on CO diluhido options
  public codNaClick() {
    this.coDiluidoOptions.forEach((opt) => opt.isChecked = false);
    this.coDiluidoOptionsDisabled = !this.coDiluidoOptionsDisabled;
    this.coDiluidoFormValid = this.coDiluidoOptionsDisabled;
  }

  // Function triggered when the user clicks the N/A option on area mejora options
  public areaMejoraNaClick() {
    this.areaMejoraOptions.forEach((opt) => opt.isChecked = false);
    this.areaMejoraOptionsDisabled = !this.areaMejoraOptionsDisabled;
    this.areaMejoraFormValid = this.areaMejoraOptionsDisabled;
  }

  // Function triggered when the user clicks the N/A option on equipos mejora options
  public eqMejoraNaClick() {
    this.equiposMejoraOptions.forEach((opt) => opt.isChecked = false);
    this.equiposMejoraOptionsDisabled = !this.equiposMejoraOptionsDisabled;
    this.equipoConsumoFormValid = this.equiposMejoraOptionsDisabled;
  }

  public aparatoNaClick() {
    this.aparatosOptionsDisabled = !this.aparatosOptionsDisabled;
    this.aparatosOptions.forEach((opt) => {
      opt.isChecked = false;
      opt.valorNum = undefined;
    });
  }

  public updateControlHermForm(ev: Detalle) {
    if (this.controlHermOptions.find((opt) => opt.isChecked)) {
      if (this.controlHermOptions.filter((opt) => opt.isChecked).length > 1 ) {
        this.controlHermFormValid = true;
      } else if (this.controlHermOptions.find((opt) => opt.isChecked && opt.indice === ev.indice)) {
        this.controlHermFormValid = false;
      } else {
        this.controlHermFormValid = true;
      }
    } else {
      this.controlHermFormValid = true;
    }
  }

  public updateCoDiluidoForm(ev: Detalle) {
    if (this.coDiluidoOptions.find((opt) => opt.isChecked)) {
      if (this.coDiluidoOptions.filter((opt) => opt.isChecked).length > 1 ) {
        this.coDiluidoFormValid = true;
      } else if (this.coDiluidoOptions.find((opt) => opt.isChecked && opt.indice === ev.indice)) {
        this.coDiluidoFormValid = false;
      } else {
        this.coDiluidoFormValid = true;
      }
    } else {
      this.coDiluidoFormValid = true;
    }
  }

  public updateAreaMejoraForm(ev: Detalle) {
    if (this.areaMejoraOptions.find((opt) => opt.isChecked)) {
      if (this.areaMejoraOptions.filter((opt) => opt.isChecked).length > 1 ) {
        this.areaMejoraFormValid = true;
      } else if (this.areaMejoraOptions.find((opt) => opt.isChecked && opt.indice === ev.indice)) {
        this.areaMejoraFormValid = false;
      } else {
        this.areaMejoraFormValid = true;
      }
    } else {
      this.areaMejoraFormValid = true;
    }
  }

  public updateEquiposConsumoForm(ev: Detalle) {
    if (this.equiposMejoraOptions.find((opt) => opt.isChecked)) {
      if (this.equiposMejoraOptions.filter((opt) => opt.isChecked).length > 1 ) {
        this.equipoConsumoFormValid = true;
      } else if (this.equiposMejoraOptions.find((opt) => opt.isChecked && opt.indice === ev.indice)) {
        this.equipoConsumoFormValid = false;
      } else {
        this.equipoConsumoFormValid = true;
      }
    } else {
      this.equipoConsumoFormValid = true;
    }
  }

  public get isFormValid(): boolean {
    return !document.getElementById('infoClientBtn').hasAttribute('disabled') &&
     !document.getElementById('visitaBtn').hasAttribute('disabled') &&
     !document.getElementById('pruebaLitBtn').hasAttribute('disabled') &&
     !((document.getElementById('aparatosBtn') && document.getElementById('aparatosBtn').hasAttribute('disabled')) || (document.getElementById('aparatosNaBtn') && document.getElementById('aparatosNaBtn').hasAttribute('disabled'))) &&
     !document.getElementById('relacionDefBtn').hasAttribute('disabled') &&
     !document.getElementById('areaMejoraBtn').hasAttribute('disabled') &&
     !document.getElementById('resultadosBtn').hasAttribute('disabled');
  }

  public capture(section: number) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.camera.getPicture(this.cameraOptions).then((imageData) => {
          // imageData is either a base64 encoded string or a file URI
          // If it's base64:
          if (section === 1) {
            this.imagenInfo = 'data:image/jpeg;base64,' + imageData;
            this.imagenesArray.forEach((opt) => opt.nombreArchivo === 'imagenInfo.png' ? opt.fotoBase = imageData : '');
          } else if (section === 2) {
            this.imagenVisita = 'data:image/jpeg;base64,' + imageData;
            this.imagenesArray.forEach((opt) => opt.nombreArchivo === 'imagenVisita.png' ? opt.fotoBase = imageData : '');
          } else if (section === 3) {
            this.imagenIdentificacion = 'data:image/jpeg;base64,' + imageData;
            this.imagenesArray.forEach((opt) => opt.nombreArchivo === 'imagenIdentificacion.png' ? opt.fotoBase = imageData : '');
          } else if (section === 4) {
            this.imagenComprobanteInspeccion = 'data:image/jpeg;base64,' + imageData;
            this.imagenesArray.forEach((opt) => opt.nombreArchivo === 'imagenComprobanteInspeccion.png' ? opt.fotoBase = imageData : '');
          }
        }, (err) => {
          // Handle error
        });
      }
    });
  }

  /**
   * Displays visita info popover
   * @param any ev
   */
  public async openDefectosPopover(ev: any) {
    const popover = await this.popOverController.create({
      component: DefectosPopoverComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  /**
   * Displays mejoras info popover
   * @param any ev
   */
  public async openMejorasPopover(ev: any) {
    const popover = await this.popOverController.create({
      component: MejorasPopoverComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  // Get current coordinates of device
  private getGeolocation(): void {
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.geoAddress.latitude = resp.coords.latitude.toString();
        this.geoAddress.longitude = resp.coords.longitude.toString();
        this.getGeoencoder(resp.coords.latitude, resp.coords.longitude);
      }).catch((error) => {
        // alert('Error getting location' + JSON.stringify(error));
      });
    });
  }

  // Geocoder method to fetch address from coordinates passed as arguments
  private getGeoencoder(latitude: number, longitude: number): void {
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.geoAddress.location = this.generateAddress(result[0]);
      })
      .catch((error: any) => {
        // alert('Error getting location' + JSON.stringify(error));
      });
  }

  // Return Comma saperated address
  private generateAddress(addressObj: any): string {
     const obj = [];
     let address = '';

     // tslint:disable-next-line: forin
     for (const key in addressObj) {
       obj.push(addressObj[key]);
     }

     obj.reverse();
     for (const val in obj) {
       if (obj[val].length) {
         address += obj[val] + ', ';
       }
     }
     return address.slice(0, -2);
  }

  private formatDatetoStringPut(date: Date): string {
    const año = date.getFullYear();
    const month = date.getMonth() + 1 ;
    const mes = (month < 10) ? '0' + month.toString() : month;
    const dia = (date.getDate() < 10) ? '0' + date.getDate().toString() : date.getDate();
    return año + '-' + mes + '-' + dia;
  }

}
