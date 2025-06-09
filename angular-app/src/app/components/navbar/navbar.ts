import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../services/cart-service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-navbar',
  imports: [FormsModule,    RouterModule, ReactiveFormsModule, MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatListModule,
    MatTooltipModule,RouterLink ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {
  cartItemCount = 0;
    private cartSubscription: Subscription = new Subscription();
  searchControl = new FormControl('');
  isMenuOpen = false;

  constructor(private router: Router,  private cartService: CartService) { }

  ngOnInit(): void {
this.cartSubscription = this.cartService.getCart().subscribe(items => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

   ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  onSearch(): void {
    const searchValue = this.searchControl.value;
    if (searchValue && searchValue.trim()) {
      this.router.navigate(['/products'], { 
        queryParams: { search: searchValue.trim() } 
      });
    }
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
clearSearch(): void {
  this.searchControl.setValue('');
}
}