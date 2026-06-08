import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';
import { TravelRequest } from '../shared/models/travel-request.model';
import { TravelRequestService } from '../services/travel-request.service';

@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './add-request.component.html',
  styleUrl: './add-request.component.scss'
})
export class AddRequestComponent implements OnInit {
  currentUser: User | null = null;
  assignedManager: User | null = null;
  requestForm!: FormGroup;
  isSidebarCollapsed: boolean = true;
  isSubmitted: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;
  requestId: number | null = null;
  existingRequest: TravelRequest | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private travelRequestService: TravelRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser && this.currentUser.managerId) {
      const mName = this.currentUser.managerName || 'Assigned Manager';
      this.assignedManager = { id: this.currentUser.managerId, name: mName, email: '', role: 'manager' } as User;
    }

    this.initForm();

    // Check for edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = +params['id'];
        this.isEditMode = true;
        this.loadRequestForEdit();
      }
    });
  }

  get tripMinDate(): string {
    const val = this.requestForm?.get('startDate')?.value;
    return val ? this.formatDate(val) : '';
  }

  get tripMaxDate(): string {
    const val = this.requestForm?.get('endDate')?.value;
    return val ? this.formatDate(val) : '';
  }

  private formatDate(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') {
      const datePart = val.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  get maxItineraryDays(): number {
    const startVal = this.requestForm?.get('startDate')?.value;
    const endVal = this.requestForm?.get('endDate')?.value;
    if (!startVal || !endVal) {
      return 0;
    }
    const start = new Date(startVal);
    const end = new Date(endVal);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  get itineraryFormArray(): FormArray {
    return this.requestForm.get('itineraries') as FormArray;
  }

  addDay(): void {
    if (this.itineraryFormArray.length >= this.maxItineraryDays) {
      return;
    }
    const dayGroup = this.fb.group({
      date: ['', Validators.required],
      location: ['', Validators.required],
      activityDetails: ['', Validators.required],
      hotelOrAccommodation: ['']
    });
    this.itineraryFormArray.push(dayGroup);
  }

  removeDay(index: number): void {
    this.itineraryFormArray.removeAt(index);
  }

  loadRequestForEdit(): void {
    if (this.requestId) {
      this.travelRequestService.getRequestById(this.requestId).subscribe({
        next: (request: any) => {
          if (request) {
            this.existingRequest = request;
            const formattedStartDate = request.startDate ? request.startDate.split('T')[0] : '';
            const formattedEndDate = request.endDate ? request.endDate.split('T')[0] : '';

            this.requestForm.patchValue({
              fromLocation: request.fromLocation,
              destination: request.destination,
              purpose: request.purpose,
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              // Fallback safety to check both properties
              estimatedBudget: request.estimatedBudget || request.amount 
            });

            this.itineraryFormArray.clear();
            if (request.itineraries && Array.isArray(request.itineraries)) {
              request.itineraries.forEach((itinerary: any) => {
                const dayGroup = this.fb.group({
                  date: [itinerary.date ? itinerary.date.split('T')[0] : '', Validators.required],
                  location: [itinerary.location || '', Validators.required],
                  activityDetails: [itinerary.activityDetails || '', Validators.required],
                  hotelOrAccommodation: [itinerary.hotelOrAccommodation || '']
                });
                this.itineraryFormArray.push(dayGroup);
              });
            }
          }
        },
        error: (error) => console.error('Error fetching request', error)
      });
    }
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      fromLocation: ['', [Validators.required, Validators.minLength(3)]],
      destination: ['', [Validators.required, Validators.minLength(3)]],
      purpose: ['', [Validators.required, Validators.minLength(5)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      // 🎯 FIXED NAME MATCHING: Changed from 'amount' to 'estimatedBudget'
      estimatedBudget: ['', [Validators.required, Validators.min(1)]],
      projectManager: [{ value: this.assignedManager ? this.assignedManager.name : 'N/A', disabled: true }],
      itineraries: this.fb.array([])
    });

    // Date change listeners to clear itineraries when user edits dates
    this.requestForm.get('startDate')?.valueChanges.subscribe(() => {
      if (this.requestForm.get('startDate')?.dirty) {
        this.itineraryFormArray.clear();
      }
    });
    this.requestForm.get('endDate')?.valueChanges.subscribe(() => {
      if (this.requestForm.get('endDate')?.dirty) {
        this.itineraryFormArray.clear();
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    
    if (this.requestForm.valid) {
      const formValues = this.requestForm.getRawValue();
      
      if (this.isEditMode && this.existingRequest) {
        const updatedRequest: any = {
          ...this.existingRequest,
          fromLocation: formValues.fromLocation,
          destination: formValues.destination,
          purpose: formValues.purpose,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          // 🎯 FIXED KEY: Pass as property expected by .NET Core binder
          estimatedBudget: Number(formValues.estimatedBudget),
          itineraries: formValues.itineraries
        };
        this.travelRequestService.updateRequest(updatedRequest.id, updatedRequest).subscribe({
          next: () => {
            this.successMessage = 'Travel request updated successfully! Redirecting...';
            this.redirectAfterSubmit();
          },
          error: (error) => {
            console.error('Error updating request', error);
            this.errorMessage = error.error?.message || 'Failed to update request. Please check the console.';
          }
        });
      } else {
        const newRequest = {
          fromLocation: formValues.fromLocation,
          destination: formValues.destination,
          purpose: formValues.purpose,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          // 🎯 FIXED KEY: Use decimal data-type cast format 
          estimatedBudget: Number(formValues.estimatedBudget),
          itineraries: formValues.itineraries
        };
        
        this.travelRequestService.createRequest(newRequest as any).subscribe({
          next: () => {
            this.successMessage = 'Travel request created successfully! Redirecting...';
            this.redirectAfterSubmit();
          },
          error: (error) => {
            console.error('Error creating request', error);
            this.errorMessage = error.error?.message || 'Failed to create request. Please check the console for details.';
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill out all required fields correctly.';
    }
  }

  private redirectAfterSubmit(): void {
    setTimeout(() => {
      const path = this.currentUser?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
      this.router.navigate([path]);
    }, 2000);
  }
}