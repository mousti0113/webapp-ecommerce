package com.telusko.ecom_project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.telusko.ecom_project.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // This interface will automatically provide CRUD operations for Product entities
    // No additional methods are needed unless custom queries are required

    //JPQL - 
    @Query("SELECT p from Product p WHERE  "+ "LOWER(p.name) LIKE LOWER(CONCAT( '%', :keyword ,'%')) OR "+ 
           "LOWER(p.description) LIKE LOWER(CONCAT( '%', :keyword ,'%')) OR "+
           "LOWER(p.brand) LIKE LOWER(CONCAT( '%', :keyword ,'%')) OR "+
           "LOWER(p.category) LIKE LOWER(CONCAT( '%', :keyword ,'%'))")

public List<Product> searchProducts(String keyword) ;

   

}
