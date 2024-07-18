import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCareListComponent } from './health-care-list.component';

describe('HealthCareListComponent', () => {
  let component: HealthCareListComponent;
  let fixture: ComponentFixture<HealthCareListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthCareListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthCareListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
