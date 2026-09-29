using BugMuseum.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BugMuseum.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = default!;
    public DbSet<BugExhibit> BugExhibits { get; set; } = default!;
    public DbSet<ExhibitReaction> ExhibitReactions { get; set; } = default!;
    
    public DbSet<ExhibitComment> ExhibitComments { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ExhibitReaction>()
            .HasIndex(r => new { r.BugExhibitId, r.UserId })
            .IsUnique();
    }
    
}