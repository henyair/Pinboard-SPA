using Backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IAdRepository
    {
        Task<IEnumerable<AdItem>> GetAllAsync();
        Task<AdItem> GetByIdAsync(Guid id);
        Task<AdItem> AddAsync(AdItem item);
        Task<AdItem> UpdateAsync(AdItem item);
        Task<bool> DeleteAsync(Guid id);
    }
}
