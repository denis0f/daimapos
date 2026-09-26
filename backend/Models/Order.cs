namespace backend.Models;

public class Order
{
    public int Id { get; set; }

    public string ReceiptNumber { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public decimal AmountPaid { get; set; }

    public decimal Change { get; set; }

    public string TransactionId { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}