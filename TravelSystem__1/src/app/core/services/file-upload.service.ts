import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface BulkExpenseItem {
  Category: string;
  Amount: number;
  Description: string;
  FileIndex: number;
  File?: File;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  // ========================================
  // FILE UPLOAD APIs
  // ========================================

  uploadReceipt(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // POST multipart/form-data upload endpoint here
    return this.http.post<any>(API_ENDPOINTS.EXPENSES.UPLOAD, formData);
  }

  uploadBulkReceipts(travelRequestId: number, items: BulkExpenseItem[]): Observable<any> {
    const formData = new FormData();
    
    // Append the travel request ID
    formData.append('TravelRequestId', travelRequestId.toString());

    // Iterate through each expense item to append file and details
    items.forEach((item, index) => {
      // Append the receipt file to the 'receipts' array if it exists
      if (item.File) {
        formData.append('receipts', item.File);
      }
      
      // Append expense details with exact keys expected by the .NET model binder
      formData.append(`Expenses[${index}].Category`, item.Category);
      formData.append(`Expenses[${index}].Amount`, item.Amount.toString());
      formData.append(`Expenses[${index}].Description`, item.Description);
      formData.append(`Expenses[${index}].FileIndex`, item.FileIndex.toString());
    });

    return this.http.post<any>(API_ENDPOINTS.EXPENSES.UPLOAD, formData);
  }
}
