using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Services
{
    public class JsonUserRepository : IUserRepository
    {
        private readonly string _filePath = "users.json";
        private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { WriteIndented = true };

        public JsonUserRepository()
        {
            if (!File.Exists(_filePath))
            {
                File.WriteAllText(_filePath, "[]");
            }
        }

        private async Task<List<UserItem>> InternalReadAllAsync()
        {
            try
            {
                using var stream = new FileStream(_filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                return await JsonSerializer.DeserializeAsync<List<UserItem>>(stream) ?? new List<UserItem>();
            }
            catch
            {
                return new List<UserItem>();
            }
        }

        private async Task InternalWriteAllAsync(List<UserItem> users)
        {
            using var stream = new FileStream(_filePath, FileMode.Create, FileAccess.Write, FileShare.None);
            await JsonSerializer.SerializeAsync(stream, users, _jsonOptions);
        }

        public async Task<UserItem> RegisterAsync(UserItem user)
        {
            await _lock.WaitAsync();
            try
            {
                var users = await InternalReadAllAsync();
                
                if (users.Any(u => u.Username.Equals(user.Username, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidOperationException("Username already exists.");
                }

                user.Id = Guid.NewGuid();
                user.CreatedAt = DateTime.UtcNow;
                
                users.Add(user);
                await InternalWriteAllAsync(users);
                
                return user;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<UserItem> LoginAsync(string username, string password)
        {
            await _lock.WaitAsync();
            try
            {
                var users = await InternalReadAllAsync();
                
                var user = users.FirstOrDefault(u => 
                    u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) && 
                    u.Password == password);
                    
                return user;
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}
