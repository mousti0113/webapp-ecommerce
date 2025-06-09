import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

// Services
import { ProductService, Product } from '../../services/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  
  product: Product | null = null;
  loading = true;
  error = false;
  quantity = new FormControl(1);
  selectedImageIndex = 0;

  // Mock related products - in futuro potresti implementare una chiamata API
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = false;
    
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.loadRelatedProducts();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Error loading product details', 'Close', { duration: 3000 });
      }
    });
  }

  loadRelatedProducts(): void {
    if (this.product) {
      // Carica prodotti correlati della stessa categoria
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.relatedProducts = products
            .filter(p => p.category === this.product?.category && p.id !== this.product?.id)
            .slice(0, 4);
        },
        error: (error) => {
          console.error('Error loading related products:', error);
        }
      });
    }
  }

  getProductImageUrl(product?: Product): string {
    const targetProduct = product || this.product;
    if (targetProduct?.id) {
      return this.productService.getProductImage(targetProduct.id);
    }
    return 'https://via.placeholder.com/600x600?text=No+Image';
  }

  addToCart(): void {
    if (this.product && this.quantity.value) {
      // TODO: Implement cart service
      const qty = this.quantity.value;
      this.snackBar.open(`${qty} x ${this.product.name} added to cart!`, 'Close', { 
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  buyNow(): void {
    if (this.product) {
      // TODO: Implement direct checkout
      this.addToCart();
      this.router.navigate(['/cart']);
    }
  }

  shareProduct(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.name,
        text: this.product.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Product link copied to clipboard!', 'Close', { duration: 2000 });
    }
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  increaseQuantity(): void {
    const currentValue = this.quantity.value || 1;
    if (this.product && currentValue < this.product.stockQuantity) {
      this.quantity.setValue(currentValue + 1);
    }
  }

  decreaseQuantity(): void {
    const currentValue = this.quantity.value || 1;
    if (currentValue > 1) {
      this.quantity.setValue(currentValue - 1);
    }
  }

  isInStock(): boolean {
    return !!(this.product?.productAvailable && (this.product?.stockQuantity || 0) > 0);
  }

  getStockStatus(): string {
    if (!this.product?.productAvailable) return 'Out of Stock';
    if (this.product.stockQuantity <= 5) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusClass(): string {
    if (!this.product?.productAvailable) return 'text-red-600';
    if (this.product.stockQuantity <= 5) return 'text-orange-600';
    return 'text-green-600';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}