import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletOpenComponent } from './wallet-open.component';

describe('WalletOpenComponent', () => {
  let component: WalletOpenComponent;
  let fixture: ComponentFixture<WalletOpenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletOpenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
