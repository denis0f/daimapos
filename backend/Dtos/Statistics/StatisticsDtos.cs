namespace backend.Dtos.Statistics;

public class StatisticsSummaryDto
{
    public decimal TotalSales { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal Roi { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int LowStockItems { get; set; }
}

public class SalesPointDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Profit { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Sales { get; set; }
    public decimal Profit { get; set; }
}

public class StockStatisticDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Stock { get; set; }
}

public class CategoryStockStatisticDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public class PaymentStatisticDto
{
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class TopOrderDto
{
    public int OrderId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Profit { get; set; }
    public DateTime Date { get; set; }
}

public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Stock { get; set; }
}

public class CategoryPerformanceDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Profit { get; set; }
}

public class RestockHistoryDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string Supplier { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class StatisticsDataDto
{
    public StatisticsSummaryDto Summary { get; set; } = new();
    public List<SalesPointDto> Sales { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<StockStatisticDto> Stock { get; set; } = new();
    public List<CategoryStockStatisticDto> CategoryStock { get; set; } = new();
    public List<PaymentStatisticDto> Payments { get; set; } = new();
    public List<TopOrderDto> TopOrders { get; set; } = new();
    public List<LowStockProductDto> LowStockProducts { get; set; } = new();
    public List<CategoryPerformanceDto> CategoryPerformance { get; set; } = new();
    public List<RestockHistoryDto> Restocks { get; set; } = new();
}