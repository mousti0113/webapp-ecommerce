import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckOutPopup } from './check-out-popup';

describe('CheckOutPopup', () => {
  let component: CheckOutPopup;
  let fixture: ComponentFixture<CheckOutPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckOutPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckOutPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
