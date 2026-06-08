using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ETMs.Data.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public int? Manager_Id { get; set; } // Matches Manager_Id snake_case
        public string Department { get; set; }
        public DateTime Created_At { get; set; }

        // Soft delete / Status indicator
        public bool IsActive { get; set; } = true; // Default to true for new employees
        // ==========================================
        // 👇 ADDED SELF-REFERENCING RELATIONSHIP HERE
        // ==========================================

        /// <summary>
        /// This maps the foreign key property to a full virtual User object.
        /// EF Core will look at Manager_Id and fetch the corresponding Manager record automatically.
        /// </summary>
        [ForeignKey("Manager_Id")]
        public virtual User? Manager { get; set; }

        /// <summary>
        /// Inverse navigation property representing employees reporting directly to this user.
        /// [JsonIgnore] prevents circular JSON serialization errors during API calls.
        /// </summary>
        [JsonIgnore]
        public virtual ICollection<User> Subordinates { get; set; } = new List<User>();
    }
}
