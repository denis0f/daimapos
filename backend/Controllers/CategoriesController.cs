using backend.Dtos.Categories;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(CategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        return Ok(await categoryService.GetCategoriesAsync());
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory(
        CreateCategoryRequest request)
    {
        return Ok(await categoryService.CreateCategoryAsync(request));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(
        int id,
        UpdateCategoryRequest request)
    {
        var category = await categoryService.UpdateCategoryAsync(id, request);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var deleted = await categoryService.DeleteCategoryAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}