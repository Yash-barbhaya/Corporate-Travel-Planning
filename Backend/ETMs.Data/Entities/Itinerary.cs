using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Entities
{
    public class Itinerary
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TravelRequestId { get; set; }

        [ForeignKey("TravelRequestId")]
        public TravelRequest? TravelRequest { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ActivityDetails { get; set; } = string.Empty;

        [StringLength(200)]
        public string? HotelOrAccommodation { get; set; }
    }
}
