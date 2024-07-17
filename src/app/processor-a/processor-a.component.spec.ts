import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorAComponent } from './processor-a.component';

describe('ProcessorAComponent', () => {
  let component: ProcessorAComponent;
  let fixture: ComponentFixture<ProcessorAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorAComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessorAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
