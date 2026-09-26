using backend.Dtos.Products;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts()
    {
        return Ok(await productService.GetProductsAsync());
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(
        CreateProductRequest request)
    {
        var product = await productService.CreateProductAsync(request);

        if (product is null)
        {
            return BadRequest(new { message = "Category does not exist." });
        }

        return Ok(product);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(
        int id,
        CreateProductRequest request)
    {
        var product = await productService.UpdateProductAsync(id, request);

        if (product is null)
        {
            return BadRequest(new { message = "Product or category does not exist." });
        }

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var deleted = await productService.DeleteProductAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}