using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Services
{
    public interface IUserRepository
    {
        Task<UserItem> RegisterAsync(UserItem user);
        Task<UserItem> LoginAsync(string username, string password);
    }
}
