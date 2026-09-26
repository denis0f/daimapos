using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync())
        {
            var user = new User
            {
                FullName = "Denis",
                Username = "denoh"
            };

            var passwordHasher = new PasswordHasher<User>();

            user.PasswordHash = passwordHasher.HashPassword(
                user,
                "denohgt3");

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "Cereals" },
                new Category { Name = "Machinery" },
                new Category { Name = "Snacks" },
                new Category { Name = "Beverages" },
                new Category { Name = "Household" },
                new Category { Name = "Electronics" }
            );

            await context.SaveChangesAsync();
        }

        if (!await context.Products.AnyAsync())
        {
            var categories = await context.Categories
                .ToDictionaryAsync(category => category.Name);

            context.Products.AddRange(
                new Product
                {
                    Name = "Maize Flour",
                    Price = 180,
                    BuyingPrice = 140,
                    Stock = 50,
                    ImageUrl = "https://images.unsplash.com/photo-1603046891744-76e6300f4e5d",
                    CategoryId = categories["Cereals"].Id
                },
                new Product
                {
                    Name = "Wheat Flour",
                    Price = 170,
                    BuyingPrice = 130,
                    Stock = 40,
                    ImageUrl = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b",
                    CategoryId = categories["Cereals"].Id
                },
                new Product
                {
                    Name = "Rice 5kg",
                    Price = 850,
                    BuyingPrice = 700,
                    Stock = 25,
                    ImageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c",
                    CategoryId = categories["Cereals"].Id
                },
                new Product
                {
                    Name = "Cooking Oil 2L",
                    Price = 650,
                    BuyingPrice = 540,
                    Stock = 30,
                    ImageUrl = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
                    CategoryId = categories["Cereals"].Id
                },
                new Product
                {
                    Name = "Industrial Drill",
                    Price = 8500,
                    BuyingPrice = 6500,
                    Stock = 12,
                    ImageUrl = "https://images.unsplash.com/photo-1504148455328-c376907d081c",
                    CategoryId = categories["Machinery"].Id
                },
                new Product
                {
                    Name = "Grinding Machine",
                    Price = 12000,
                    BuyingPrice = 9000,
                    Stock = 10,
                    ImageUrl = "https://images.unsplash.com/photo-1530124566582-a618bc2615dc",
                    CategoryId = categories["Machinery"].Id
                },
                new Product
                {
                    Name = "Power Saw",
                    Price = 15000,
                    BuyingPrice = 11500,
                    Stock = 8,
                    ImageUrl = "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
                    CategoryId = categories["Machinery"].Id
                },
                new Product
                {
                    Name = "Hammer",
                    Price = 1200,
                    BuyingPrice = 800,
                    Stock = 20,
                    ImageUrl = "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8",
                    CategoryId = categories["Machinery"].Id
                },
                new Product
                {
                    Name = "Potato Crisps",
                    Price = 106,
                    BuyingPrice = 70,
                    Stock = 55,
                    ImageUrl = "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
                    CategoryId = categories["Snacks"].Id
                },
                new Product
                {
                    Name = "Chocolate Bar",
                    Price = 150,
                    BuyingPrice = 100,
                    Stock = 35,
                    ImageUrl = "https://images.unsplash.com/photo-1575377427642-087cf684f04d",
                    CategoryId = categories["Snacks"].Id
                },
                new Product
                {
                    Name = "Biscuits",
                    Price = 120,
                    BuyingPrice = 80,
                    Stock = 45,
                    ImageUrl = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
                    CategoryId = categories["Snacks"].Id
                },
                new Product
                {
                    Name = "Coca Cola 500ml",
                    Price = 80,
                    BuyingPrice = 55,
                    Stock = 60,
                    ImageUrl = "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e",
                    CategoryId = categories["Beverages"].Id
                },
                new Product
                {
                    Name = "Dishwashing Liquid",
                    Price = 250,
                    BuyingPrice = 180,
                    Stock = 25,
                    ImageUrl = "https://images.unsplash.com/photo-1583947215259-38e31be8751f",
                    CategoryId = categories["Household"].Id
                },
                new Product
                {
                    Name = "Laundry Detergent",
                    Price = 350,
                    BuyingPrice = 260,
                    Stock = 20,
                    ImageUrl = "https://images.unsplash.com/photo-1607672632458-9e6a0e0a4c8e",
                    CategoryId = categories["Household"].Id
                },
                new Product
                {
                    Name = "USB Keyboard",
                    Price = 1200,
                    BuyingPrice = 800,
                    Stock = 15,
                    ImageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
                    CategoryId = categories["Electronics"].Id
                }
            );

            await context.SaveChangesAsync();
        }

        if (!await context.InventoryBatches.AnyAsync())
        {
            var products = await context.Products
                .ToDictionaryAsync(product => product.Name);

            var productsWithCosts = new[]
            {
                new { Name = "Maize Flour", Cost = 140m },
                new { Name = "Wheat Flour", Cost = 130m },
                new { Name = "Rice 5kg", Cost = 700m },
                new { Name = "Cooking Oil 2L", Cost = 540m },
                new { Name = "Industrial Drill", Cost = 6500m },
                new { Name = "Grinding Machine", Cost = 9000m },
                new { Name = "Power Saw", Cost = 11500m },
                new { Name = "Hammer", Cost = 800m },
                new { Name = "Potato Crisps", Cost = 70m },
                new { Name = "Chocolate Bar", Cost = 100m },
                new { Name = "Biscuits", Cost = 80m },
                new { Name = "Coca Cola 500ml", Cost = 55m },
                new { Name = "Dishwashing Liquid", Cost = 180m },
                new { Name = "Laundry Detergent", Cost = 260m },
                new { Name = "USB Keyboard", Cost = 800m }
            };

            foreach (var item in productsWithCosts)
            {
                var product = products[item.Name];

                context.InventoryBatches.Add(
                    new InventoryBatch
                    {
                        ProductId = product.Id,
                        QuantityReceived = product.Stock,
                        QuantityRemaining = product.Stock,
                        UnitCost = item.Cost,
                        Supplier = "Initial Stock",
                        Reason = "Initial database stock",
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await context.SaveChangesAsync();
        }
    }
}