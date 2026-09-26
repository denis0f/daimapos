using backend.Data;
using backend.Dtos.Categories;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CategoryService(AppDbContext context)
{
    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        return await context.Categories
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(
        int id,
        UpdateCategoryRequest request)
    {
        var category = await context.Categories.FindAsync(id);

        if (category is null)
        {
            return null;
        }

        category.Name = request.Name;

        await context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await context.Categories.FindAsync(id);

        if (category is null)
        {
            return false;
        }

        var hasProducts = await context.Products
            .AnyAsync(product => product.CategoryId == id);

        if (hasProducts)
        {
            throw new InvalidOperationException(
                "Cannot delete a category that has products.");
        }

        context.Categories.Remove(category);
        await context.SaveChangesAsync();

        return true;
    }
}