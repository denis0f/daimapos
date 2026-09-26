using backend.Data;
using backend.Dtos.Products;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class InventoryService(AppDbContext context)
{
    public async Task<InventoryBatchDto?> RestockProductAsync(
        RestockProductRequest request)
    {
        if (request.Quantity <= 0)
        {
            throw new InvalidOperationException(
                "Restock quantity must be greater than zero.");
        }

        if (request.UnitCost < 0)
        {
            throw new InvalidOperationException(
                "Unit cost cannot be negative.");
        }

        var product = await context.Products.FindAsync(request.ProductId);

        if (product is null)
        {
            return null;
        }

        var batch = new InventoryBatch
        {
            ProductId = product.Id,
            QuantityReceived = request.Quantity,
            QuantityRemaining = request.Quantity,
            UnitCost = request.UnitCost,
            Supplier = request.Supplier,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };

        product.Stock += request.Quantity;

        context.InventoryBatches.Add(batch);

        await context.SaveChangesAsync();

        return new InventoryBatchDto
        {
            Id = batch.Id,
            ProductId = batch.ProductId,
            QuantityReceived = batch.QuantityReceived,
            QuantityRemaining = batch.QuantityRemaining,
            UnitCost = batch.UnitCost,
            Supplier = batch.Supplier,
            Reason = batch.Reason,
            CreatedAt = batch.CreatedAt
        };
    }

    public async Task<List<InventoryBatchDto>> GetProductBatchesAsync(
        int productId)
    {
        return await context.InventoryBatches
            .Where(batch => batch.ProductId == productId)
            .OrderBy(batch => batch.CreatedAt)
            .Select(batch => new InventoryBatchDto
            {
                Id = batch.Id,
                ProductId = batch.ProductId,
                QuantityReceived = batch.QuantityReceived,
                QuantityRemaining = batch.QuantityRemaining,
                UnitCost = batch.UnitCost,
                Supplier = batch.Supplier,
                Reason = batch.Reason,
                CreatedAt = batch.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<StockConsumptionDto>> ConsumeStockAsync(
        int productId,
        int quantity)
    {
        if (quantity <= 0)
        {
            throw new InvalidOperationException(
                "Quantity must be greater than zero.");
        }

        var product = await context.Products.FindAsync(productId);

        if (product is null)
        {
            throw new InvalidOperationException(
                "Product does not exist.");
        }

        if (product.Stock < quantity)
        {
            throw new InvalidOperationException(
                "Insufficient stock.");
        }

        var batches = await context.InventoryBatches
            .Where(batch =>
                batch.ProductId == productId &&
                batch.QuantityRemaining > 0)
            .OrderBy(batch => batch.CreatedAt)
            .ThenBy(batch => batch.Id)
            .ToListAsync();

        var availableBatchStock = batches.Sum(
            batch => batch.QuantityRemaining);

        if (availableBatchStock < quantity)
        {
            throw new InvalidOperationException(
                "Inventory batches do not contain enough stock.");
        }

        var consumptions = new List<StockConsumptionDto>();
        var remainingQuantity = quantity;

        foreach (var batch in batches)
        {
            if (remainingQuantity == 0)
            {
                break;
            }

            var quantityToConsume = Math.Min(
                batch.QuantityRemaining,
                remainingQuantity);

            batch.QuantityRemaining -= quantityToConsume;

            consumptions.Add(new StockConsumptionDto
            {
                InventoryBatchId = batch.Id,
                Quantity = quantityToConsume,
                UnitCost = batch.UnitCost
            });

            remainingQuantity -= quantityToConsume;
        }

        product.Stock -= quantity;

        return consumptions;
    }
}