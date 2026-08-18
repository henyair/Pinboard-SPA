import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AdItem } from '../models/ad-item.model';
import { AuthService } from './auth.service';

export interface AdFilterState {
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = '/api/ads';
  public refreshAds$ = new Subject<void>();
  
  private filterStateSubject = new BehaviorSubject<AdFilterState>({});
  public filterChanges$ = this.filterStateSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  get currentUserId(): string | undefined {
    return this.authService.currentUserValue?.id;
  }
  
  updateFilters(filters: Partial<AdFilterState>) {
    const current = this.filterStateSubject.value;
    this.filterStateSubject.next({ ...current, ...filters });
  }

  getAds(search?: string, category?: string, lat?: number, lng?: number, radiusKm?: number): Observable<AdItem[]> {
    let params = new HttpParams();
    
    // Use passed params or fallback to current filter state
    const currentFilters = this.filterStateSubject.value;
    const finalSearch = search !== undefined ? search : currentFilters.search;
    const finalCat = category !== undefined ? category : currentFilters.category;
    const finalLat = lat !== undefined ? lat : currentFilters.lat;
    const finalLng = lng !== undefined ? lng : currentFilters.lng;
    const finalRadius = radiusKm !== undefined ? radiusKm : currentFilters.radiusKm;

    if (finalSearch) params = params.set('search', finalSearch);
    if (finalCat) params = params.set('category', finalCat);
    if (finalLat !== undefined && finalLat !== null) params = params.set('lat', finalLat.toString());
    if (finalLng !== undefined && finalLng !== null) params = params.set('lng', finalLng.toString());
    if (finalRadius !== undefined && finalRadius !== null) params = params.set('radiusKm', finalRadius.toString());

    return this.http.get<AdItem[]>(this.apiUrl, { params });
  }

  getAdById(id: string): Observable<AdItem> {
    return this.http.get<AdItem>(`${this.apiUrl}/${id}`);
  }

  createAd(ad: AdItem): Observable<AdItem> {
    ad.authorId = this.currentUserId;
    return this.http.post<AdItem>(this.apiUrl, ad);
  }

  updateAd(id: string, ad: AdItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, ad);
  }

  deleteAd(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
