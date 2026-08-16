import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';

export interface CinemaHall {
  id: string;
  branchName: string;
  hallName: string;
  totalCapacity: number;
  seatMapMatrixJson: string;
}

@Component({
  selector: 'app-manage-halls',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-halls.html',
  styleUrl: './manage-halls.scss'
})
export class ManageHalls implements OnInit {
  private apiService = inject(CineFlowApiService);
  private router = inject(Router);

  halls: CinemaHall[] = [];
  loading: boolean = true;
  showAddForm: boolean = false;
  editingId: string | null = null;

  newHall: Partial<CinemaHall> = {
    branchName: '',
    hallName: '',
    totalCapacity: 36,
    seatMapMatrixJson: ''
  };

  message: string = '';
  isSuccess: boolean = false;

  ngOnInit(): void {
    this.loadHalls();
  }

  loadHalls(): void {
    this.loading = true;
    this.apiService.getCinemaHalls().subscribe({
      next: (data) => {
        this.halls = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load halls', err);
        this.loading = false;
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
    this.newHall = {
      branchName: '',
      hallName: '',
      totalCapacity: 36,
      seatMapMatrixJson: ''
    };
    this.editingId = null;
    this.message = '';
  }

  

calculateSeats(rows: number, seatsPerRow: number): void {
  const seatMatrix = {
    rows: this.generateRows(rows),
    seatsPerRow: seatsPerRow
  };

  this.newHall.seatMapMatrixJson = JSON.stringify(seatMatrix);
  this.newHall.totalCapacity = rows * seatsPerRow;
}


onSeatsChange(rows: number, event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const seatsPerRow = Number(selectElement.value);
  this.calculateSeats(rows, seatsPerRow);
}

  generateRows(count: number): string[] {
    const rows = [];
    for (let i = 0; i < count; i++) {
      rows.push(String.fromCharCode(65 + i)); // A, B, C, D, E...
    }
    return rows;
  }

  submitHall(): void {
    if (!this.newHall.branchName || !this.newHall.hallName || !this.newHall.totalCapacity) {
      this.message = 'Please fill all fields';
      this.isSuccess = false;
      return;
    }

    // If seatMapMatrixJson is empty, create a default one
    if (!this.newHall.seatMapMatrixJson) {
      const rows = Math.ceil(this.newHall.totalCapacity! / 6);
      this.calculateSeats(rows, 6);
    }

    this.apiService.createCinemaHall(this.newHall as CinemaHall).subscribe({
      next: () => {
        this.message = '✓ Cinema hall created successfully!';
        this.isSuccess = true;
        this.resetForm();
        this.showAddForm = false;
        this.loadHalls();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to create hall';
        this.isSuccess = false;
      }
    });
  }

  deleteHall(id: string): void {
    if (confirm('Are you sure you want to delete this hall?')) {
      this.apiService.deleteCinemaHall(id).subscribe({
        next: () => {
          this.message = '✓ Hall deleted successfully!';
          this.isSuccess = true;
          this.loadHalls();
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          this.message = err.error?.message || 'Failed to delete hall';
          this.isSuccess = false;
        }
      });
    }
  }

  editHall(hall: CinemaHall): void {
    this.newHall = { ...hall };
    this.editingId = hall.id;
    this.showAddForm = true;
    window.scrollTo(0, 0);
  }

  updateHall(): void {
    if (this.editingId) {
      this.apiService.updateCinemaHall(this.editingId, this.newHall as CinemaHall).subscribe({
        next: () => {
          this.message = '✓ Hall updated successfully!';
          this.isSuccess = true;
          this.resetForm();
          this.showAddForm = false;
          this.loadHalls();
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          this.message = err.error?.message || 'Failed to update hall';
          this.isSuccess = false;
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
