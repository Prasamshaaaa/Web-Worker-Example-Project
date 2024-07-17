import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorCComponent } from './processor-c.component';

describe('ProcessorCComponent', () => {
  let component: ProcessorCComponent;
  let fixture: ComponentFixture<ProcessorCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessorCComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessorCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
