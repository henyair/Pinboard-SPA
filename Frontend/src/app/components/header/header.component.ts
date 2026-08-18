import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AdService } from '../../services/ad.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() toggleForm = new EventEmitter<void>();
  searchQuery = '';

  constructor(public authService: AuthService, private adService: AdService) {}

  onToggleForm() {
    this.toggleForm.emit();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/';
  }

  onSearch() {
    this.adService.updateFilters({ search: this.searchQuery });
  }

  onNearbyMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.adService.updateFilters({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radiusKm: 10 // Default radius
          });
        },
        (error) => {
          alert('Could not retrieve location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}
