package com.telusko.ecom_project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.telusko.ecom_project.model.Product;
import com.telusko.ecom_project.repository.ProductRepository;

@Service
public class ProductService {
@Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
       return  productRepository.findAll();
      
    }

    public Product getProductById(int id) {
        return productRepository.findById(id).orElse(null);
    }

}
