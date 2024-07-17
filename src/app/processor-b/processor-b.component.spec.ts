import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorBComponent } from './processor-b.component';

describe('ProcessorBComponent', () => {
  let component: ProcessorBComponent;
  let fixture: ComponentFixture<ProcessorBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorBComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessorBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
