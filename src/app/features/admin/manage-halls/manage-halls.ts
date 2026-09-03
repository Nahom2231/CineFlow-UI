import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { CinemaHall } from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-manage-halls',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-halls.html',
  styleUrl: './manage-halls.scss'
})
export class ManageHalls implements OnInit {
  private apiService = inject(CineFlowApiService);
  private cdr = inject(ChangeDetectorRef);

  halls: CinemaHall[] = [];
  loading: boolean = true;
  showAddForm: boolean = false;
  editingId: string | null = null;

  selectedRows: number = 6;
  selectedSeatsPerRow: number = 6;

  newHall: Partial<CinemaHall> = {
    branchName: '',
    hallName: '',
    totalCapacity: 36,
    seatMapMatrixJson: ''
  };

  message: string = '';
  isSuccess: boolean = false;

  ngOnInit(): void {
    this.calculateSeats();
    this.loadHalls();
  }

  loadHalls(): void {
    this.loading = true;
    this.apiService.getCinemaHalls().subscribe({
      next: (data) => {
        this.halls = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load halls', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.selectedRows = 6;
    this.selectedSeatsPerRow = 6;
    this.newHall = {
      branchName: '',
      hallName: '',
      totalCapacity: 36,
      seatMapMatrixJson: ''
    };
    this.calculateSeats();
    this.editingId = null;
    this.message = '';
  }

  onLayoutChange(): void {
    this.calculateSeats();
  }

  calculateSeats(rows: number = this.selectedRows, seatsPerRow: number = this.selectedSeatsPerRow): void {
    const seatMatrix = {
      rows: this.generateRows(rows),
      seatsPerRow: seatsPerRow
    };

    this.newHall.seatMapMatrixJson = JSON.stringify(seatMatrix);
    this.newHall.totalCapacity = rows * seatsPerRow;
  }

  generateRows(count: number): string[] {
    const rows: string[] = [];
    for (let i = 0; i < count; i++) {
      rows.push(String.fromCharCode(65 + i)); // A, B, C, D, E...
    }
    return rows;
  }

  submitHall(): void {
    if (!this.newHall.branchName || !this.newHall.hallName || !this.newHall.totalCapacity) {
      this.message = 'Please fill out all required fields.';
      this.isSuccess = false;
      return;
    }

    if (!this.newHall.seatMapMatrixJson) {
      this.calculateSeats();
    }

    this.apiService.createCinemaHall(this.newHall as CinemaHall).subscribe({
      next: () => {
        this.message = '✓ Cinema hall created successfully!';
        this.isSuccess = true;
        this.resetForm();
        this.showAddForm = false;
        this.loadHalls();
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 3500);
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to create hall';
        this.isSuccess = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteHall(id: string): void {
    const targetHall = this.halls.find(h => h.id === id);
    const hallName = targetHall ? targetHall.hallName : 'this hall';

    if (confirm(`Are you sure you want to delete "${hallName}"?`)) {
      // 1. Optimistically remove from UI immediately for 0ms lag
      this.halls = this.halls.filter(h => String(h.id).toLowerCase() !== String(id).toLowerCase());
      this.message = `✓ "${hallName}" deleted successfully!`;
      this.isSuccess = true;
      this.cdr.detectChanges();

      // 2. Execute deletion via service
      this.apiService.deleteCinemaHall(id).subscribe({
        next: () => {
          this.loadHalls();
          setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
          }, 3500);
        },
        error: () => {
          this.loadHalls();
          setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
          }, 3500);
        }
      });
    }
  }

  editHall(hall: CinemaHall): void {
    this.newHall = { ...hall };
    this.editingId = hall.id;
    this.showAddForm = true;

    try {
      if (hall.seatMapMatrixJson) {
        const seatMap = JSON.parse(hall.seatMapMatrixJson);
        this.selectedRows = seatMap.rows?.length || 6;
        this.selectedSeatsPerRow = seatMap.seatsPerRow || 6;
      }
    } catch {
      this.selectedRows = 6;
      this.selectedSeatsPerRow = 6;
    }

    this.calculateSeats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateHall(): void {
    if (this.editingId) {
      this.apiService.updateCinemaHall(this.editingId, this.newHall as CinemaHall).subscribe({
        next: () => {
          this.message = '✓ Cinema hall updated successfully!';
          this.isSuccess = true;
          this.resetForm();
          this.showAddForm = false;
          this.loadHalls();
          setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
          }, 3500);
        },
        error: (err) => {
          this.message = err.error?.message || 'Failed to update hall';
          this.isSuccess = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getSeatsInfo(seatMapJson: string): string {
    try {
      const seatMap = JSON.parse(seatMapJson);
      const rows = seatMap.rows?.length || 5;
      const seatsPerRow = seatMap.seatsPerRow || 6;
      return `${rows} rows × ${seatsPerRow} seats`;
    } catch {
      return 'N/A';
    }
  }
}
