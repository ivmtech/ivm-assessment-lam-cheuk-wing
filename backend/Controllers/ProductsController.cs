using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ivm.Assessment.Backend.Data;
using Ivm.Assessment.Backend.Models;
using System.Collections.Concurrent;

namespace Ivm.Assessment.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly VendingDbContext _db;

    // [BONUS TODO 3]: Static dictionary to persist state across different controller instances (requests)
    // Key: ProductId (or generic key for global lock), Value: Last Purchase Time
    private static readonly ConcurrentDictionary<string, DateTime> _lastPurchaseTimes = new();

    public ProductsController(VendingDbContext db)
    {
        _db = db;
    }

    // GET: api/products
    // [TODO 1]: Return all products from database
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts() {
        var products = await _db.Products.ToListAsync();
        return Ok(products);
    }

    // POST: api/products/purchase
    // [TODO 2]: Implement purchase logic
    // [BONUS TODO 3]: Prevent Duplicate Purchase Within 5 Seconds
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchaseResponse>> Purchase([FromBody] PurchaseRequest? request) {
        
        // 1. Validate Payload
        if (request == null || string.IsNullOrEmpty(request.ProductID))
        {
            return BadRequest(new { message = "Invalid purchase request." });
        }

        if (request.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than zero." });
        }

        // [BONUS TODO 3] Logic: Rate Limiting
        // We use a global key for this assessment to simulate "Machine is busy". 
        // In a real app, this might be UserID or IP.
        string lockKey = "GlobalMachineLock"; 
        
        if (_lastPurchaseTimes.TryGetValue(lockKey, out DateTime lastTime))
        {
            if ((DateTime.UtcNow - lastTime).TotalSeconds < 5)
            {
                return StatusCode(429, new { message = "Please wait 5 seconds between purchases." });
            }
        }

        // Simulate processing time as per requirements
        Thread.Sleep(5000);

        // 2. Fetch Product & Validate Stock
        var product = await _db.Products.FindAsync(request.ProductID);

        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        if (product.Stock < request.Quantity)
        {
            return BadRequest(new { message = $"Out of stock. Only {product.Stock} remaining." });
        }

        // 3. Update Stock
        product.Stock -= request.Quantity;

        // 4. Create Purchase Record
        decimal totalCost = product.Price * request.Quantity;
        var purchase = new Purchase
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Quantity = request.Quantity,
            Amount = totalCost,
            PurchaseTime = DateTime.UtcNow,
            MachineId = "machine-001" // Default for this assessment
        };

        _db.Purchases.Add(purchase);

        try
        {
            await _db.SaveChangesAsync();
            
            // Update rate limit timestamp on success
            _lastPurchaseTimes.AddOrUpdate(lockKey, DateTime.UtcNow, (k, v) => DateTime.UtcNow);

            return Ok(new PurchaseResponse
            {
                Success = true,
                Message = "Purchase successful!",
                Remaining = product.Stock,
                QuantityPurchased = request.Quantity,
                TotalCost = totalCost
            });
        }
        catch (Exception)
        {
            // Log error in real scenario
            return StatusCode(500, new { message = "An error occurred while processing the purchase." });
        }
    }

    // GET: api/products/purchases
    // [TODO 4]: Return all purchases from database
    // [BONUS TODO 5]: Support server side filtering with query parameters
    [HttpGet("purchases")]
    public async Task<ActionResult<IEnumerable<Purchase>>> GetPurchases([FromQuery] PurchaseFilterParams? filter)
    {
        // Initialize Queryable
        var query = _db.Purchases.AsQueryable();

        if (filter != null)
        {
            // Filter: Search Term (Product Name)
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                string term = filter.SearchTerm.ToLower();
                query = query.Where(p => p.ProductName.ToLower().Contains(term));
            }

            // Filter: Machine ID
            if (!string.IsNullOrWhiteSpace(filter.MachineId))
            {
                query = query.Where(p => p.MachineId == filter.MachineId);
            }

            // Filter: Hours (Time Range)
            if (filter.Hours.HasValue && filter.Hours.Value > 0)
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-filter.Hours.Value);
                query = query.Where(p => p.PurchaseTime >= cutoffTime);
            }

            // Sorting
            bool isDesc = string.Equals(filter.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);

            query = filter.SortField?.ToLower() switch
            {
                "amount" => isDesc ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount),
                "product" => isDesc ? query.OrderByDescending(p => p.ProductName) : query.OrderBy(p => p.ProductName),
                "date" or _ => isDesc ? query.OrderByDescending(p => p.PurchaseTime) : query.OrderBy(p => p.PurchaseTime) // Default sort
            };
        }
        else
        {
            // Default sorting if no filter provided
            query = query.OrderByDescending(p => p.PurchaseTime);
        }

        var results = await query.ToListAsync();
        return Ok(results);
    }


    // GET: api/products/balance
    [HttpGet("balance")]
    public ActionResult GetBalance()
    {
        Random random = new Random();
        double randomNumber = random.NextDouble() * 9 + 1;
        double roundedNumber = Math.Round(randomNumber, 2);
        return Ok(new { balance = roundedNumber });
    }
}