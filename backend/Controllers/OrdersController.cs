using backend.Dtos.Orders;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/completeorder")]
public class OrdersController(OrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<CompleteOrderResponse>> CompleteOrder(
        CompleteOrderRequest request)
    {
        try
        {
            var response =
                await orderService.CompleteOrderAsync(request);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}