import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services
import { ProductService, Product } from '../../services/product';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  featuredProducts: Product[] = [];
  allProducts: Product[] = [];
  loading = true;
  
  categories: Category[] = [
    { id: 1, name: 'Electronics', icon: 'devices', color: 'bg-blue-500' },
    { id: 2, name: 'Fashion', icon: 'checkroom', color: 'bg-pink-500' },
    { id: 3, name: 'Home & Garden', icon: 'home', color: 'bg-green-500' },
    { id: 4, name: 'Sports', icon: 'sports_soccer', color: 'bg-orange-500' },
    { id: 5, name: 'Books', icon: 'menu_book', color: 'bg-purple-500' },
    { id: 6, name: 'Health', icon: 'health_and_safety', color: 'bg-red-500' }
  ];

  constructor(
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        // Prendi i primi 4 prodotti come featured
        this.featuredProducts = products.slice(0, 4);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getProductImageUrl(product: Product): string {
    if (product.id) {
      return this.productService.getProductImage(product.id);
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  navigateToProducts(category?: string): void {
    if (category) {
      this.router.navigate(['/products'], { queryParams: { category } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    // TODO: Implement cart service
    this.snackBar.open(`${product.name} added to cart!`, 'Close', { 
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}