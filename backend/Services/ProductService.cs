using backend.Data;
using backend.Dtos.Products;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ProductService(AppDbContext context)
{
    public async Task<List<ProductDto>> GetProductsAsync()
    {
        return await context.Products
            .Select(product => new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                BuyingPrice = product.BuyingPrice,
                Stock = product.Stock,
                ImageUrl = product.ImageUrl,
                CategoryId = product.CategoryId
            })
            .ToListAsync();
    }

    public async Task<ProductDto?> CreateProductAsync(
        CreateProductRequest request)
    {
        var categoryExists = await context.Categories
            .AnyAsync(category => category.Id == request.CategoryId);

        if (!categoryExists)
        {
            return null;
        }

        var product = new Models.Product
        {
            Name = request.Name,
            Price = request.Price,
            BuyingPrice = request.BuyingPrice,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            CategoryId = request.CategoryId
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        return MapProduct(product);
    }

    public async Task<ProductDto?> UpdateProductAsync(
        int id,
        CreateProductRequest request)
    {
        var product = await context.Products.FindAsync(id);

        if (product is null)
        {
            return null;
        }

        var categoryExists = await context.Categories
            .AnyAsync(category => category.Id == request.CategoryId);

        if (!categoryExists)
        {
            return null;
        }

        product.Name = request.Name;
        product.Price = request.Price;
        product.BuyingPrice = request.BuyingPrice;
        product.Stock = request.Stock;
        product.ImageUrl = request.ImageUrl;
        product.CategoryId = request.CategoryId;

        await context.SaveChangesAsync();

        return MapProduct(product);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await context.Products.FindAsync(id);

        if (product is null)
        {
            return false;
        }

        context.Products.Remove(product);
        await context.SaveChangesAsync();

        return true;
    }

    private static ProductDto MapProduct(Models.Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            BuyingPrice = product.BuyingPrice,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId
        };
    }
}