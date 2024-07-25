import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LandingScreenComponent } from './landing-screen.component';
import { Camera } from '@ionic-native/camera/ngx';
import { DefectosPopoverComponent } from '../modals/defectos/defectos-popover.component';
import { MejorasPopoverComponent } from '../modals/mejoras/mejoras-popover.component';

import { ActaComponent } from '../acta/acta.component';
import { LoginComponent } from '../login/login.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: LandingScreenComponent }])
  ],
  declarations: [
    ActaComponent,
    LandingScreenComponent,
    LoginComponent,
    DefectosPopoverComponent,
    MejorasPopoverComponent
  ],
  entryComponents: [DefectosPopoverComponent, MejorasPopoverComponent],
  providers: [
    Camera
  ]
})
export class LandingScreenModule {}
