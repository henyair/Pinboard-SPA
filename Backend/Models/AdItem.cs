using System;

namespace Backend.Models
{
    public class AdItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string LocationName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string ContactInfo { get; set; }
        public string ImageUrl { get; set; }
        public double? Price { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
