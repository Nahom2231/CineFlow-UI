import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketConfirmation } from './ticket-confirmation';
import { Router } from '@angular/router';

describe('TicketConfirmation', () => {
  let component: TicketConfirmation;
  let fixture: ComponentFixture<TicketConfirmation>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    await TestBed.configureTestingModule({
      imports: [TicketConfirmation],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketConfirmation);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should download QR code', () => {
    component.qrCodeUrl = 'data:image/png;base64,...';
    component.ticketId = 'test-123';
    
    spyOn(document, 'createElement').and.returnValue({
      click: jasmine.createSpy('click'),
      href: '',
      download: ''
    } as any);

    component.downloadQRCode();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should navigate back to movies', () => {
    component.goToMovies();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/movies']);
  });
});
