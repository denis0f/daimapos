using backend.Dtos.Products;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/inventory")]
public class InventoryController(InventoryService inventoryService)
    : ControllerBase
{
    [HttpPost("restock")]
    public async Task<ActionResult<InventoryBatchDto>> Restock(
        RestockProductRequest request)
    {
        try
        {
            var batch = await inventoryService.RestockProductAsync(request);

            if (batch is null)
            {
                return NotFound(new
                {
                    message = "Product does not exist."
                });
            }

            return Ok(batch);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<List<InventoryBatchDto>>> GetProductBatches(
        int productId)
    {
        return Ok(
            await inventoryService.GetProductBatchesAsync(productId));
    }
}