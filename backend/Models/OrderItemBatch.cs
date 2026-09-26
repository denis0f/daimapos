namespace backend.Models;

public class OrderItemBatch
{
    public int Id { get; set; }

    public int OrderItemId { get; set; }

    public int InventoryBatchId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public OrderItem OrderItem { get; set; } = null!;

    public InventoryBatch InventoryBatch { get; set; } = null!;
}