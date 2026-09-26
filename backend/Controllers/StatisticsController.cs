using backend.Dtos.Statistics;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/statistics")]
public class StatisticsController(StatisticsService statisticsService)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StatisticsDataDto>> GetStatistics(
        [FromQuery] string period = "7days")
    {
        try
        {
            var statistics =
                await statisticsService.GetStatisticsAsync(period);

            return Ok(statistics);
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