import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Services
import { ProductService, Product } from '../../services/product';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatSlideToggleModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {


  // Product management
  products: Product[] = [];
  displayedProducts: Product[] = [];
  loading = false;
  
  // Table configuration
  displayedColumns: string[] = ['image', 'name', 'brand', 'category', 'price', 'stock', 'available', 'actions'];
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalProducts = 0;
  
  // Product form
  productForm: FormGroup;
  isEditing = false;
  editingProductId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Categories for form
  categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Health',
    'Beauty',
    'Automotive',
    'Toys',
    'Food'
  ];

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  createProductForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      brand: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', [Validators.required]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      productAvailable: [true],
      releaseDate: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.totalProducts = products.length;
        this.updateDisplayedProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateDisplayedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedProducts = this.products.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedProducts();
  }

  getProductImageUrl(product: Product): string {
    if (product.id) {
      return this.productService.getProductImage(product.id);
    }
    return 'https://via.placeholder.com/100x100?text=No+Image';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
      
      // Add product data
      const productData = this.productForm.value;
      formData.append('product', new Blob([JSON.stringify(productData)], {
        type: 'application/json'
      }));
      
      // Add image file
      if (this.selectedFile) {
        formData.append('imageFile', this.selectedFile);
      }

      if (this.isEditing && this.editingProductId) {
        this.updateProduct(this.editingProductId, formData);
      } else {
        this.addProduct(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  addProduct(formData: FormData): void {
    this.loading = true;
    this.productService.addProduct(formData).subscribe({
      next: (product) => {
        this.snackBar.open('Product added successfully!', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error adding product:', error);
        this.snackBar.open('Error adding product', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateProduct(id: number, formData: FormData): void {
    this.loading = true;
    this.productService.updateProduct(id, formData).subscribe({
      next: (response) => {
        this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.editingProductId = product.id;
    
    // Format date for input
    const releaseDate = new Date(product.releaseDate).toISOString().split('T')[0];
    
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      productAvailable: product.productAvailable,
      releaseDate: releaseDate
    });
    
    // Set image preview to existing product image
    this.imagePreview = this.getProductImageUrl(product);
    
    // Scroll to form
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.loading = true;
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.productForm.patchValue({
      productAvailable: true,
      releaseDate: new Date().toISOString().split('T')[0]
    });
    this.isEditing = false;
    this.editingProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.loading = false;
  }

  markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} is too short`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than 0`;
    }
    return '';
  }

 
   getAvailableProductsCount(): number {
    return this.products.filter(product => product.productAvailable).length;
  }

  getUnavailableProductsCount(): number {
    return this.products.filter(product => !product.productAvailable).length;
  }

  getLowStockProductsCount(): number {
    return this.products.filter(product => product.stockQuantity <= 5).length;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }


  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}