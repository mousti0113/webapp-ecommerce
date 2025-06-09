import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { ProductDetail } from './components/product-detail/product-detail';
import { Cart } from './components/cart/cart';
import { AddProduct } from './components/add-product/add-product';
import { Admin } from './components/admin/admin';


export const routes: Routes = [ 
    {path: 'home',component: Home},
    {path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'products', component: Products },           // Lista tutti i prodotti
  { path: 'products/:id', component: ProductDetail },  // Dettaglio singolo prodotto
  { path: 'cart', component: Cart },
  { path: 'admin', component: Admin },
   { path: '**', redirectTo: 'home' }
]