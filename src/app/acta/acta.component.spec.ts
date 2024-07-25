import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActaComponent } from './acta.component';

describe('ActaComponent', () => {
  let component: ActaComponent;
  let fixture: ComponentFixture<ActaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActaComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
