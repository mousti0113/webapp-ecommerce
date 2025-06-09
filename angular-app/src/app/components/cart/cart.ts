import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Services
import { CartService, CartItem } from '../../services/cart-service';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit, OnDestroy {
  
  cartItems: CartItem[] = [];
  loading = false;
  private cartSubscription: Subscription = new Subscription();

  // Discount/Coupon
  couponControl = new FormControl('');
  discountAmount = 0;
  discountPercentage = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  getProductImageUrl(cartItem: CartItem): string {
    if (cartItem.product.id) {
      return this.productService.getProductImage(cartItem.product.id);
    }
    return 'https://via.placeholder.com/100x100?text=No+Image';
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    
    this.cartService.updateQuantity(productId, quantity);
    this.snackBar.open('Quantity updated', 'Close', { duration: 1500 });
  }

  increaseQuantity(item: CartItem): void {
    const maxQuantity = item.product.stockQuantity;
    if (item.quantity < maxQuantity) {
      this.updateQuantity(item.product.id, item.quantity + 1);
    } else {
      this.snackBar.open('Maximum quantity reached', 'Close', { duration: 2000 });
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.snackBar.open('Item removed from cart', 'Undo', { 
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
      this.snackBar.open('Cart cleared', 'Close', { duration: 2000 });
    }
  }

  applyCoupon(): void {
    const couponCode = this.couponControl.value?.trim().toLowerCase();
    
    // Mock coupon logic - in real app, call backend API
    const validCoupons = {
      'save10': { percentage: 10, description: '10% off' },
      'save20': { percentage: 20, description: '20% off' },
      'welcome': { percentage: 15, description: '15% off for new customers' },
      'freeship': { fixed: 5.99, description: 'Free shipping' }
    };

    if (couponCode && validCoupons[couponCode as keyof typeof validCoupons]) {
      const coupon = validCoupons[couponCode as keyof typeof validCoupons];
      
      if ('percentage' in coupon) {
        this.discountPercentage = coupon.percentage;
        this.discountAmount = this.getSubtotal() * (coupon.percentage / 100);
      } else if ('fixed' in coupon) {
        this.discountAmount = coupon.fixed;
        this.discountPercentage = 0;
      }
      
      this.snackBar.open(`Coupon applied: ${coupon.description}`, 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open('Invalid coupon code', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeCoupon(): void {
    this.discountAmount = 0;
    this.discountPercentage = 0;
    this.couponControl.setValue('');
    this.snackBar.open('Coupon removed', 'Close', { duration: 2000 });
  }

  getSubtotal(): number {
    return this.cartService.getTotal();
  }

  getShipping(): number {
    // Free shipping over $50, otherwise $5.99
    return this.getSubtotal() > 50 ? 0 : 5.99;
  }

  getTax(): number {
    // 8.5% tax on subtotal
    const taxableAmount = this.getSubtotal() - this.discountAmount;
    return taxableAmount * 0.085;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const tax = this.getTax();
    const discount = this.discountAmount;
    
    return Math.max(0, subtotal + shipping + tax - discount);
  }

  getTotalItems(): number {
    return this.cartService.getItemCount();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.snackBar.open('Your cart is empty', 'Close', { duration: 2000 });
      return;
    }

    // Check stock availability
    const outOfStockItems = this.cartItems.filter(item => 
      !item.product.productAvailable || item.quantity > item.product.stockQuantity
    );

    if (outOfStockItems.length > 0) {
      this.snackBar.open('Some items are out of stock. Please update your cart.', 'Close', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // TODO: Implement checkout flow
    this.snackBar.open('Checkout functionality coming soon!', 'Close', { duration: 3000 });
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  isStockAvailable(item: CartItem): boolean {
    return item.product.productAvailable && item.quantity <= item.product.stockQuantity;
  }

  getStockWarning(item: CartItem): string | null {
    if (!item.product.productAvailable) {
      return 'Out of stock';
    }
    if (item.quantity > item.product.stockQuantity) {
      return `Only ${item.product.stockQuantity} available`;
    }
    if (item.product.stockQuantity <= 5) {
      return `Low stock: ${item.product.stockQuantity} left`;
    }
    return null;
  }
}