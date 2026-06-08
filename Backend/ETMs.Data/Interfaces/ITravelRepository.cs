using ETMs.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Interfaces
{
    public interface ITravelRepository
    {
        Task<TravelRequest> AddRequestAsync(TravelRequest request);
        Task<IEnumerable<TravelRequest>> GetRequestsByUserIdAsync(int userId);
        Task<IEnumerable<TravelRequest>> GetPendingRequestsForManagerAsync(int managerId);
        Task<TravelRequest?> GetRequestByIdAsync(int requestId);
        Task UpdateRequestAsync(TravelRequest request);
        Task<IEnumerable<TravelRequest>> GetPendingClearanceRequestsAsync();
        Task<IEnumerable<TravelRequest>> GetRequestsByUserIdRawAsync(int userId);
        Task DeleteRequestAsync(TravelRequest request);
        Task<IEnumerable<TravelRequest>> GetAllRequestsAsync();
    }
}
