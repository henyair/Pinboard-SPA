using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdsController : ControllerBase
    {
        private readonly IAdRepository _repository;

        public AdsController(IAdRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAds(
            [FromQuery] string search = null,
            [FromQuery] string category = null,
            [FromQuery] double? lat = null,
            [FromQuery] double? lng = null,
            [FromQuery] double? radiusKm = null)
        {
            var ads = await _repository.GetAllAsync();
            var query = ads.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLowerInvariant();
                query = query.Where(a => 
                    (a.Title != null && a.Title.ToLowerInvariant().Contains(lowerSearch)) ||
                    (a.Description != null && a.Description.ToLowerInvariant().Contains(lowerSearch)));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(a => a.Category != null && a.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            if (lat.HasValue && lng.HasValue && radiusKm.HasValue)
            {
                query = query.Where(a => CalculateHaversineDistance(lat.Value, lng.Value, a.Latitude, a.Longitude) <= radiusKm.Value);
            }

            return Ok(query.ToList());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAd(Guid id)
        {
            var ad = await _repository.GetByIdAsync(id);
            if (ad == null) return NotFound();
            return Ok(ad);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAd([FromBody] AdItem item)
        {
            if (item == null) return BadRequest();
            var created = await _repository.AddAsync(item);
            
            // Requires the GetAd method to generate the Location header
            return CreatedAtAction(nameof(GetAd), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAd(Guid id, [FromBody] AdItem item)
        {
            if (item == null || item.Id != id) return BadRequest();
            
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var updated = await _repository.UpdateAsync(item);
            if (updated == null) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAd(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Radius of the earth in km
            var dLat = Deg2Rad(lat2 - lat1);
            var dLon = Deg2Rad(lon2 - lon1);
            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        private double Deg2Rad(double deg)
        {
            return deg * (Math.PI / 180);
        }
    }
}
