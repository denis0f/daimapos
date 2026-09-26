using backend.Data;
using backend.Dtos.Statistics;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StatisticsService(AppDbContext context)
{
    public async Task<StatisticsDataDto> GetStatisticsAsync(string period)
    {
        var (startDate, endDate) = GetPeriodDates(period);

        var orders = await context.Orders
            .Include(order => order.Items)
                .ThenInclude(item => item.Product)
                    .ThenInclude(product => product.Category)
            .Include(order => order.Items)
                .ThenInclude(item => item.BatchConsumptions)
            .Where(order =>
                order.Date >= startDate &&
                order.Date < endDate)
            .OrderBy(order => order.Date)
            .ToListAsync();

        var restocks = await context.InventoryBatches
            .Include(batch => batch.Product)
            .Where(batch =>
                batch.CreatedAt >= startDate &&
                batch.CreatedAt < endDate)
            .OrderByDescending(batch => batch.CreatedAt)
            .ToListAsync();

        var products = await context.Products
            .Include(product => product.Category)
            .OrderBy(product => product.Name)
            .ToListAsync();

        var totalSales = orders.Sum(order => order.Total);

        var totalCost = orders
            .SelectMany(order => order.Items)
            .SelectMany(item => item.BatchConsumptions)
            .Sum(batch => batch.Quantity * batch.UnitCost);

        var totalProfit = totalSales - totalCost;

        var roi = totalCost == 0
            ? 0
            : totalProfit / totalCost * 100;

        var lowStockProducts = products
            .Where(product => product.Stock <= 10)
            .OrderBy(product => product.Stock)
            .ThenBy(product => product.Name)
            .Select(product => new LowStockProductDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Stock = product.Stock
            })
            .ToList();

        return new StatisticsDataDto
        {
            Summary = new StatisticsSummaryDto
            {
                TotalSales = totalSales,
                TotalProfit = totalProfit,
                Roi = roi,
                TotalOrders = orders.Count,
                AverageOrderValue = orders.Count == 0
                    ? 0
                    : totalSales / orders.Count,
                LowStockItems = lowStockProducts.Count
            },

            Sales = BuildSales(orders),

            TopProducts = BuildTopProducts(orders),

            Stock = products
                .Select(product => new StockStatisticDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Stock = product.Stock
                })
                .ToList(),

            CategoryStock = products
                .GroupBy(product => new
                {
                    product.CategoryId,
                    CategoryName = product.Category.Name
                })
                .Select(group => new CategoryStockStatisticDto
                {
                    CategoryId = group.Key.CategoryId,
                    CategoryName = group.Key.CategoryName,
                    Quantity = group.Sum(product => product.Stock)
                })
                .OrderByDescending(category => category.Quantity)
                .ToList(),

            Payments = orders
                .GroupBy(order => order.PaymentMethod)
                .Select(group => new PaymentStatisticDto
                {
                    PaymentMethod = group.Key,
                    Amount = group.Sum(order => order.Total)
                })
                .OrderByDescending(payment => payment.Amount)
                .ToList(),

            TopOrders = orders
                .Select(order => new TopOrderDto
                {
                    OrderId = order.Id,
                    ReceiptNumber = order.ReceiptNumber,
                    Total = order.Total,
                    Profit = CalculateOrderProfit(order),
                    Date = order.Date
                })
                .OrderByDescending(order => order.Total)
                .Take(5)
                .ToList(),

            LowStockProducts = lowStockProducts,

            CategoryPerformance = BuildCategoryPerformance(orders),

            Restocks = restocks
                .Select(batch => new RestockHistoryDto
                {
                    Id = batch.Id,
                    ProductId = batch.ProductId,
                    ProductName = batch.Product.Name,
                    Quantity = batch.QuantityReceived,
                    UnitCost = batch.UnitCost,
                    Supplier = batch.Supplier,
                    Reason = batch.Reason,
                    Date = batch.CreatedAt
                })
                .ToList()
        };
    }

    private static List<SalesPointDto> BuildSales(
        List<Models.Order> orders)
    {
        return orders
            .GroupBy(order => order.Date.Date)
            .Select(group => new SalesPointDto
            {
                Date = group.Key.ToString("yyyy-MM-dd"),
                Sales = group.Sum(order => order.Total),
                Profit = group.Sum(CalculateOrderProfit)
            })
            .OrderBy(point => point.Date)
            .ToList();
    }

    private static List<TopProductDto> BuildTopProducts(
        List<Models.Order> orders)
    {
        return orders
            .SelectMany(order => order.Items)
            .GroupBy(item => new
            {
                item.ProductId,
                ProductName = item.Product.Name
            })
            .Select(group =>
            {
                var sales = group.Sum(item =>
                    item.Quantity * item.UnitPrice);

                var cost = group
                    .SelectMany(item => item.BatchConsumptions)
                    .Sum(batch =>
                        batch.Quantity * batch.UnitCost);

                return new TopProductDto
                {
                    ProductId = group.Key.ProductId,
                    ProductName = group.Key.ProductName,
                    QuantitySold = group.Sum(item => item.Quantity),
                    Sales = sales,
                    Profit = sales - cost
                };
            })
            .OrderByDescending(product => product.QuantitySold)
            .Take(10)
            .ToList();
    }

    private static List<CategoryPerformanceDto> BuildCategoryPerformance(
        List<Models.Order> orders)
    {
        return orders
            .SelectMany(order => order.Items)
            .GroupBy(item => new
            {
                item.Product.CategoryId,
                CategoryName = item.Product.Category.Name
            })
            .Select(group =>
            {
                var sales = group.Sum(item =>
                    item.Quantity * item.UnitPrice);

                var cost = group
                    .SelectMany(item => item.BatchConsumptions)
                    .Sum(batch =>
                        batch.Quantity * batch.UnitCost);

                return new CategoryPerformanceDto
                {
                    CategoryId = group.Key.CategoryId,
                    CategoryName = group.Key.CategoryName,
                    Sales = sales,
                    Profit = sales - cost
                };
            })
            .OrderByDescending(category => category.Sales)
            .ToList();
    }

    private static decimal CalculateOrderProfit(
        Models.Order order)
    {
        var cost = order.Items
            .SelectMany(item => item.BatchConsumptions)
            .Sum(batch =>
                batch.Quantity * batch.UnitCost);

        return order.Total - cost;
    }

    private static (DateTime StartDate, DateTime EndDate) GetPeriodDates(
        string period)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;

        return period.ToLowerInvariant() switch
        {
            "today" => (
                today,
                today.AddDays(1)
            ),

            "7days" => (
                today.AddDays(-6),
                today.AddDays(1)
            ),

            "30days" => (
                today.AddDays(-29),
                today.AddDays(1)
            ),

            "3months" => (
                today.AddMonths(-3),
                today.AddDays(1)
            ),

            "1year" => (
                today.AddYears(-1),
                today.AddDays(1)
            ),

            _ => throw new InvalidOperationException(
                "Invalid statistics period.")
        };
    }
}