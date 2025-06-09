import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Product {
  id: number;
  name: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  releaseDate: string;
  productAvailable: boolean;  // Corrisponde a productAvailable nel Java
  stockQuantity: number;      // Corrisponde a stockQuantity nel Java
  imageName?: string;
  imageType?: string;
  imageData?: string;         // Aggiunto per corrispondenza con Java (base64 encoded)
}
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api';

 

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getProductImage(id: number): string {
    return `${this.apiUrl}/product/${id}/image`;
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search?keyword=${keyword}`);
  }

  addProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product`, product);
  }

  updateProduct(id: number, product: FormData): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/product/${id}`, product);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/product/${id}`);
  }
}
