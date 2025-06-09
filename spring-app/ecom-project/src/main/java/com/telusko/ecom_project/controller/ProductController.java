package com.telusko.ecom_project.controller;

import com.telusko.ecom_project.model.Product;
import com.telusko.ecom_project.service.ProductService;

import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ProductController {

  @Autowired
  private ProductService service;

  @GetMapping("/products")
  public ResponseEntity<List<Product>> getProducts() {
    return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
  }

  @GetMapping("/products/{id}")
  public ResponseEntity<Product> getProductById(@PathVariable int id) {
    Product product = service.getProductById(id);
    if (product == null) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    return new ResponseEntity<>(service.getProductById(id), HttpStatus.OK);
  }

  @PostMapping("/product")
  public ResponseEntity<?> addProduct(
    @RequestPart Product product,
    @RequestPart MultipartFile imageFile
  ) {
    try {
      Product product1 = service.addProduct(product, imageFile);
      return new ResponseEntity<>(product1, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>(
        e.getMessage(),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @GetMapping("/product/{id}/image")
  @CrossOrigin(origins = "http://localhost:4200") 
  public ResponseEntity<byte[]> getProductImage(@PathVariable int id) {
    // AGGIUNGI LOGGING PER DEBUG
    System.out.println("=== IMAGE REQUEST DEBUG ===");
    System.out.println("Requested product ID: " + id);
    
    Product product = service.getProductById(id);
    System.out.println("Product found: " + (product != null));
    
    if (product == null) {
        System.err.println("Product not found for ID: " + id);
        return ResponseEntity.notFound().build();
    }
    
    // AGGIUNGI PIÙ DEBUG
    System.out.println("Product name: " + product.getName());
    System.out.println("Image data exists: " + (product.getImageData() != null));
    System.out.println("Image data length: " + (product.getImageData() != null ? product.getImageData().length : 0));
    System.out.println("Image type: " + product.getImageType());

    byte[] imageFile = product.getImageData();
    String imageType = product.getImageType();

    if (imageFile == null || imageFile.length == 0) {
        System.err.println("Image data is missing for product ID: " + id);
        return ResponseEntity.notFound().build();
    }

    if (imageType == null || imageType.trim().isEmpty()) {
        System.err.println("Image type is missing or empty for product ID: " + id);
        // Usa un tipo di default
        imageType = "image/jpeg";
        System.out.println("Using default image type: " + imageType);
    }

    MediaType mediaType;
    try {
        mediaType = MediaType.valueOf(imageType);
    } catch (IllegalArgumentException e) {
        System.err.println("Invalid image type '" + imageType + "' for product ID: " + id);
        // Usa JPEG come fallback
        mediaType = MediaType.IMAGE_JPEG;
    }

    System.out.println("Returning image with media type: " + mediaType);
    return ResponseEntity.ok()
        .contentType(mediaType)
        .body(imageFile);
  }

  // ENDPOINT TEMPORANEO PER DEBUG
  @GetMapping("/debug/products")
  public ResponseEntity<String> debugProducts() {
    List<Product> products = service.getAllProducts();
    StringBuilder debug = new StringBuilder();
    debug.append("Total products: ").append(products.size()).append("\n\n");
    
    for (Product product : products) {
        debug.append("ID: ").append(product.getId())
             .append(", Name: ").append(product.getName())
             .append(", Has Image: ").append(product.getImageData() != null)
             .append(", Image Size: ").append(product.getImageData() != null ? product.getImageData().length : 0)
             .append(", Image Type: ").append(product.getImageType())
             .append("\n");
    }
    
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .body(debug.toString());
  }

  @PutMapping("/product/{id}")
  public ResponseEntity<String> updateProduct(
    @PathVariable int id,
    @RequestPart Product product,
    @RequestPart MultipartFile imageFile
  ) {
    Product product1 = null;
    try {
      product1 = service.updateProduct(id, product, imageFile);
    } catch (IOException e) {
       return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
    }
    if(product1 != null) {
      return new ResponseEntity<>("Product updated successfully", HttpStatus.OK);
    } else {
      return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
    }
  }

  @DeleteMapping("/product/{id}")
  public ResponseEntity<String> deleteProduct(@PathVariable int id) {
    Product product = service.getProductById(id);
    if (product == null) {
      return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
    }
    service.deleteProduct(id);
    return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
  }

  @GetMapping("/products/search")
  public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
    List<Product> products = service.searchProducts(keyword);
    return new ResponseEntity<>(products, HttpStatus.OK);
  }
}

/*   @GetMapping("/product/{id}/image")
  public ResponseEntity<byte[]> getProductImage(@PathVariable int id) {
    Product product = service.getProductById(id);
    byte[] imageFile = product.getImageData();

    return ResponseEntity.ok()
      .contentType(MediaType.valueOf(product.getImageType()))
      .body(imageFile);
  } */

