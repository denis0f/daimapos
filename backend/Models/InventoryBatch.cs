namespace backend.Models;

public class InventoryBatch
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int QuantityReceived { get; set; }

    public int QuantityRemaining { get; set; }

    public decimal UnitCost { get; set; }

    public string Supplier { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public Product Product { get; set; } = null!;
}