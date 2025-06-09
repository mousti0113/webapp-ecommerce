import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCartFromStorage();
    }
  }

  // Observable per il carrello
  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  // Aggiunge un prodotto al carrello
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        product,
        quantity,
        addedAt: new Date()
      });
    }
    
    this.updateCart();
  }

  // Aggiorna la quantità di un prodotto
  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }

  // Rimuove un prodotto dal carrello
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCart();
  }

  // Svuota il carrello
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Calcola il totale
  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Calcola il numero totale di items
  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // Verifica se un prodotto è nel carrello
  isInCart(productId: number): boolean {
    return this.cartItems.some(item => item.product.id === productId);
  }

  // Aggiorna il BehaviorSubject e salva nel localStorage
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    if (this.isBrowser) {
      this.saveCartToStorage();
    }
  }

  // Salva nel localStorage (solo se siamo nel browser)
  private saveCartToStorage(): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }

  // Carica dal localStorage (solo se siamo nel browser)
  private loadCartFromStorage(): void {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('cart');
        if (stored) {
          this.cartItems = JSON.parse(stored);
          this.cartSubject.next([...this.cartItems]);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        this.cartItems = [];
      }
    }
  }
}