using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.DTOs
{
    public class TravelRequestCreateDTO
    {
        [Required]
        public string FromLocation { get; set; } = string.Empty;
        [Required]
        public string Destination { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Purpose { get; set; }

        [Required]
        [Range(1, 100000, ErrorMessage = "Budget must be greater than 0")]
        public decimal EstimatedBudget { get; set; }

        public List<ItineraryDTO> Itineraries { get; set; } = new List<ItineraryDTO>();
    }

    public class ItineraryDTO
    {
        public DateTime Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public string ActivityDetails { get; set; } = string.Empty;
        public string? HotelOrAccommodation { get; set; }
    }

}
