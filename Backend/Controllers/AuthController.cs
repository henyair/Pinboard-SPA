using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserItem userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Username) || string.IsNullOrWhiteSpace(userDto.Password))
            {
                return BadRequest("Username and Password are required.");
            }

            try
            {
                var user = await _userRepository.RegisterAsync(userDto);
                
                // Remove password before returning
                user.Password = null;
                
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserItem loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Username) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest("Username and Password are required.");
            }

            var user = await _userRepository.LoginAsync(loginDto.Username, loginDto.Password);
            
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            // Remove password before returning
            user.Password = null;
            
            return Ok(user);
        }
    }
}
