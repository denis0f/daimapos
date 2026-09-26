using backend.Data;
using backend.Dtos.Orders;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrderService(
    AppDbContext context,
    InventoryService inventoryService)
{
    public async Task<CompleteOrderResponse> CompleteOrderAsync(
        CompleteOrderRequest request)
    {
        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException(
                "Order must contain at least one item.");
        }

        if (request.PaymentMethod != "Cash" &&
            request.PaymentMethod != "Mpesa")
        {
            throw new InvalidOperationException(
                "Invalid payment method.");
        }

        await using var transaction =
            await context.Database.BeginTransactionAsync();

        try
        {
            var productIds = request.Items
                .Select(item => item.ProductId)
                .Distinct()
                .ToList();

            var products = await context.Products
                .Where(product => productIds.Contains(product.Id))
                .ToDictionaryAsync(product => product.Id);

            if (products.Count != productIds.Count)
            {
                throw new InvalidOperationException(
                    "One or more products do not exist.");
            }

            var order = new Models.Order
            {
                ReceiptNumber = GenerateReceiptNumber(),
                PaymentMethod = request.PaymentMethod,
                TransactionId = request.TransactionId,
                Date = DateTime.UtcNow
            };

            decimal total = 0;

            foreach (var item in request.Items)
            {
                if (item.Quantity <= 0)
                {
                    throw new InvalidOperationException(
                        "Order quantity must be greater than zero.");
                }

                var product = products[item.ProductId];

                if (product.Stock < item.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Insufficient stock for {product.Name}.");
                }

                var orderItem = new Models.OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                var itemTotal = product.Price * item.Quantity;

                total += itemTotal;

                order.Items.Add(orderItem);
            }

            if (request.AmountPaid < total)
            {
                throw new InvalidOperationException(
                    "Amount paid is less than the order total.");
            }

            order.Total = total;
            order.AmountPaid = request.AmountPaid;
            order.Change = request.AmountPaid - total;

            context.Orders.Add(order);

            await context.SaveChangesAsync();

            foreach (var orderItem in order.Items)
            {
                var consumptions =
                    await inventoryService.ConsumeStockAsync(
                        orderItem.ProductId,
                        orderItem.Quantity);

                foreach (var consumption in consumptions)
                {
                    var orderItemBatch = new Models.OrderItemBatch
                    {
                        OrderItemId = orderItem.Id,
                        InventoryBatchId =
                            consumption.InventoryBatchId,
                        Quantity = consumption.Quantity,
                        UnitCost = consumption.UnitCost
                    };

                    context.OrderItemBatches.Add(orderItemBatch);
                }
            }

            await context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new CompleteOrderResponse
            {
                ReceiptNumber = order.ReceiptNumber,
                Total = order.Total,
                PaymentMethod = order.PaymentMethod,
                AmountPaid = order.AmountPaid,
                Change = order.Change,
                TransactionId = order.TransactionId,
                Date = order.Date
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static string GenerateReceiptNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
    }
}