import { Component } from '@angular/core';

@Component({
  selector: 'app-add-product',
  imports: [],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss'
})
export class AddProduct {

}
/*
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';

// Services
import { ProductService, Product } from '../../services/product';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-products',
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatMenuModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  loading = true;
  
  // Filtri e ricerca
  searchControl = new FormControl('');
  selectedCategory = '';
  selectedSortBy = 'name';
  
  // Paginazione
  pageSize = 12;
  pageIndex = 0;
  totalProducts = 0;
  
  // Categorie disponibili
  categories: string[] = [];
  
  // Opzioni di ordinamento
  sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'date', label: 'Newest First' },
    { value: 'date-desc', label: 'Oldest First' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar, private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadQueryParams();
    this.loadProducts();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filterAndSortProducts();
      });
  }

  loadQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      const search = params['search'] || '';
      if (search) {
        this.searchControl.setValue(search, { emitEvent: false });
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.extractCategories();
        this.filterAndSortProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.allProducts.map(p => p.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterAndSortProducts(): void {
    let filtered = [...this.allProducts];
    
    // Filtro per categoria
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    // Filtro per ricerca
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Ordinamento
    filtered = this.sortProducts(filtered);
    
    this.filteredProducts = filtered;
    this.totalProducts = filtered.length;
    this.pageIndex = 0; // Reset alla prima pagina
    this.updateDisplayedProducts();
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.selectedSortBy) {
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'price':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'date':
        return products.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      case 'date-desc':
        return products.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      default:
        return products;
    }
  }

  updateDisplayedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedProducts();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterAndSortProducts();
    this.updateUrl();
  }

  onSortChange(): void {
    this.filterAndSortProducts();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchControl.setValue('');
    this.selectedSortBy = 'name';
    this.filterAndSortProducts();
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams: any = {};
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.searchControl.value) queryParams.search = this.searchControl.value;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  getProductImageUrl(product: Product): string {
    if (product.id) {

      return this.productService.getProductImage(product.id);
    }
    console.warn('No product ID found, returning placeholder image');
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

 addToCart(product: Product): void {
  this.cartService.addToCart(product, 1);
  this.snackBar.open(`${product.name} added to cart!`, 'Close', { 
    duration: 2000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  });
}
}
*/