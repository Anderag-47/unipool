const { useState, useEffect } = React;
const RideAPI = window.RideAPI;
const UserAPI = window.UserAPI;
const AIAPI = window.AIAPI;
const DataService = window.DataService;
const LocationPicker = window.LocationPicker;

function App({ onShowRating }) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('FCC');
  const [time, setTime] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await UserAPI.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        loadUserBookings(user.id);
        loadRecommendations(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  const loadUserBookings = async (userId) => {
    const data = DataService.getData();
    const userBookings = data.bookings.filter(booking => booking.riderId === userId);
    setUserBookings(userBookings);
  };

  const loadRecommendations = async (userId) => {
    try {
      const recs = await AIAPI.getRecommendations(userId);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSearch = async () => {
    if (!pickup.trim()) {
      alert('Please enter a pickup location');
      return;
    }
    if (!time) {
      alert('Please select a time');
      return;
    }

    setLoading(true);
    try {
      const results = await RideAPI.getRidesByRoute({ pickup, dropoff: destination, time });
      setRides(results);
      setShowRecommendations(false);
    } catch (error) {
      console.error('Error fetching rides:', error);
      alert('Failed to fetch rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (rideId) => {
    if (!currentUser) {
      alert('Please select a user first');
      return;
    }

    setBookingLoading(prev => ({ ...prev, [rideId]: true }));
    try {
      const booking = await RideAPI.bookRide(rideId, { riderId: currentUser.id });
      if (booking) {
        alert('Ride booked successfully!');
        // Refresh the rides list and user bookings
        handleSearch();
        loadUserBookings(currentUser.id);
        loadRecommendations(currentUser.id);
      } else {
        alert('Failed to book ride. It may no longer be available.');
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    } finally {
      setBookingLoading(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const handleCancelBooking = async (rideId) => {
    if (!currentUser) {
      alert('Please select a user first');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const result = await RideAPI.cancelBooking(rideId, currentUser.id);
        if (result) {
          alert('Booking cancelled successfully');
          loadUserBookings(currentUser.id);
          handleSearch();
        } else {
          alert('Failed to cancel booking');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const getDriverName = (driverId) => {
    const data = DataService.getData();
    const driver = data.users.find(user => user.id === driverId);
    return driver ? driver.name : driverId;
  };

  const getDriverRating = (driverId) => {
    const data = DataService.getData();
    const driver = data.users.find(user => user.id === driverId);
    if (driver && driver.ratings && driver.ratings.driver.length > 0) {
      const avgRating = driver.ratings.driver.reduce((sum, r) => sum + (r.rating || r), 0) / driver.ratings.driver.length;
      return avgRating.toFixed(1);
    }
    return 'No ratings';
  };

  const resetDatabase = () => {
    if (window.confirm('Are you sure you want to reset the database?')) {
      localStorage.removeItem('unipool_db');
      localStorage.removeItem('current_user');
      window.location.reload();
    }
  };

  const displayRides = showRecommendations ? recommendations : rides;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Search Rides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LocationPicker
            label="Pickup Location"
            value={pickup}
            onChange={setPickup}
          />
          <LocationPicker
            label="Destination"
            value={destination}
            onChange={setDestination}
            defaultOption="FCC"
          />
          <div>
            <label className="block text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Rides'}
          </button>
          <button
            onClick={() => {
              setShowRecommendations(!showRecommendations);
              if (!showRecommendations && currentUser) {
                loadRecommendations(currentUser.id);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {showRecommendations ? 'Show Search Results' : 'Show Recommendations'}
          </button>
        </div>
      </div>

      {/* User Bookings */}
      {currentUser && userBookings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBookings.map((booking) => {
              const ride = DataService.getRideById(booking.rideId);
              if (!ride) return null;
              return (
                <div key={booking.id} className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold">Ride from {ride.pickup} to {ride.dropoff}</h3>
                  <p>Departure: {new Date(ride.departureTime).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}</p>
                  <p>Driver: {getDriverName(ride.driverId)}</p>
                  <p>Status: {booking.status}</p>
                  <div className="flex gap-2 mt-2">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(ride.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'completed' && onShowRating && (
                      <button
                        onClick={() => onShowRating(ride.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Rate Ride
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rides Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {showRecommendations ? 'Recommended Rides' : 'Available Rides'}
        </h2>
        {displayRides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {showRecommendations ? 'No recommendations available' : 'No rides found matching your criteria'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRides.map((ride) => (
              <div key={ride.id} className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold">Ride from {ride.pickup} to {ride.dropoff}</h3>
                <p>Departure: {new Date(ride.departureTime).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}</p>
                <p>Seats Available: {ride.availableSeats}</p>
                <p>Driver: {getDriverName(ride.driverId)}</p>
                <p>Rating: {getDriverRating(ride.driverId)} ⭐</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleBookRide(ride.id)}
                    disabled={bookingLoading[ride.id] || ride.availableSeats <= 0}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading[ride.id] ? 'Booking...' : ride.availableSeats <= 0 ? 'No Seats Available' : 'Book Ride'}
                  </button>
                  {onShowRating && (
                    <button
                      onClick={() => onShowRating(ride.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Rate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Reset */}
      <div className="text-center">
        <button
          onClick={resetDatabase}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Reset Database
        </button>
      </div>
    </div>
  );
}

window.App = App;