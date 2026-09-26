namespace backend.Dtos.Orders;

public class OrderItemRequest
{
    public int ProductId { get; set; }

    public int Quantity { get; set; }
}

public class CompleteOrderRequest
{
    public List<OrderItemRequest> Items { get; set; } = new();

    public string PaymentMethod { get; set; } = string.Empty;

    public decimal AmountPaid { get; set; }

    public string TransactionId { get; set; } = string.Empty;
}

public class CompleteOrderResponse
{
    public string ReceiptNumber { get; set; } = string.Empty;

    public decimal Total { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public decimal AmountPaid { get; set; }

    public decimal Change { get; set; }

    public string TransactionId { get; set; } = string.Empty;

    public DateTime Date { get; set; }
}

public class MpesaPaymentRequest
{
    public string CustomerName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public decimal Amount { get; set; }
}

public class MpesaPaymentResponse
{
    public string TransactionId { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}