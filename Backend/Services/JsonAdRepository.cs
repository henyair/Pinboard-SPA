using Backend.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class JsonAdRepository : IAdRepository
    {
        private readonly string _filePath = "ads.json";
        private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

        public JsonAdRepository()
        {
            if (!File.Exists(_filePath))
            {
                File.WriteAllText(_filePath, "[]");
            }
        }

        private async Task<List<AdItem>> InternalReadAllAsync()
        {
            using var stream = new FileStream(_filePath, FileMode.OpenOrCreate, FileAccess.Read, FileShare.Read);
            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync();
            if (string.IsNullOrWhiteSpace(content)) return new List<AdItem>();
            return JsonSerializer.Deserialize<List<AdItem>>(content) ?? new List<AdItem>();
        }

        private async Task InternalWriteAllAsync(List<AdItem> items)
        {
            var content = JsonSerializer.Serialize(items, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, content);
        }

        public async Task<IEnumerable<AdItem>> GetAllAsync()
        {
            await _lock.WaitAsync();
            try
            {
                return await InternalReadAllAsync();
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<AdItem> GetByIdAsync(Guid id)
        {
            await _lock.WaitAsync();
            try
            {
                var items = await InternalReadAllAsync();
                return items.FirstOrDefault(x => x.Id == id);
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<AdItem> AddAsync(AdItem item)
        {
            await _lock.WaitAsync();
            try
            {
                var items = await InternalReadAllAsync();
                if (item.Id == Guid.Empty)
                {
                    item.Id = Guid.NewGuid();
                }
                if (item.CreatedAt == default)
                {
                    item.CreatedAt = DateTime.UtcNow;
                }
                items.Add(item);
                await InternalWriteAllAsync(items);
                return item;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<AdItem> UpdateAsync(AdItem item)
        {
            await _lock.WaitAsync();
            try
            {
                var items = await InternalReadAllAsync();
                var index = items.FindIndex(x => x.Id == item.Id);
                if (index == -1) return null;
                
                items[index] = item;
                await InternalWriteAllAsync(items);
                return item;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _lock.WaitAsync();
            try
            {
                var items = await InternalReadAllAsync();
                var index = items.FindIndex(x => x.Id == id);
                if (index == -1) return false;

                items.RemoveAt(index);
                await InternalWriteAllAsync(items);
                return true;
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}
