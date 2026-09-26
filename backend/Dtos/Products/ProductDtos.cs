namespace backend.Dtos.Products;

public class ProductDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal BuyingPrice { get; set; }

    public int Stock { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int CategoryId { get; set; }
}

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal BuyingPrice { get; set; }

    public int Stock { get; set; }

    public int CategoryId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
}

public class RestockProductRequest
{
    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public string Supplier { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;
}

public class InventoryBatchDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int QuantityReceived { get; set; }

    public int QuantityRemaining { get; set; }

    public decimal UnitCost { get; set; }

    public string Supplier { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

public class StockConsumptionDto
{
    public int InventoryBatchId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }
}