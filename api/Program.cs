using System.Collections.Concurrent;
using System.Text.Json.Serialization;
using TeatApp.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors();

var ttl = TimeSpan.FromMinutes(5);
var codes = new ConcurrentDictionary<string, CaptchaEntry>();

void PurgeExpired()
{
    var now = DateTimeOffset.UtcNow;
    foreach (var (id, entry) in codes)
    {
        if (entry.ExpiresAt <= now) codes.TryRemove(id, out _);
    }
}

app.MapGet("/api/captcha", () =>
{
    PurgeExpired();
    var (code, svg) = CaptchaGenerator.Generate();
    var id = Guid.NewGuid().ToString();
    codes[id] = new CaptchaEntry(code, DateTimeOffset.UtcNow + ttl);
    return Results.Ok(new { id, svg, expiresIn = (int)ttl.TotalSeconds });
});

app.MapPost("/api/captcha/verify", (VerifyRequest? request) =>
{
    if (string.IsNullOrEmpty(request?.Id) || string.IsNullOrEmpty(request?.Code))
    {
        return Results.BadRequest(new { valid = false, reason = "missing id or code" });
    }

    // Single-use: the id is consumed on the first verification attempt,
    // whether it matches or not.
    codes.TryRemove(request.Id, out var entry);

    if (entry is null)
    {
        return Results.Ok(new { valid = false, reason = "expired or unknown code" });
    }
    if (entry.ExpiresAt <= DateTimeOffset.UtcNow)
    {
        return Results.Ok(new { valid = false, reason = "expired" });
    }

    var valid = entry.Code == request.Code;
    return Results.Ok(new { valid, reason = valid ? null : "mismatch" });
});

app.Run("http://localhost:4000");

record CaptchaEntry(string Code, DateTimeOffset ExpiresAt);

record VerifyRequest(string? Id, string? Code);
