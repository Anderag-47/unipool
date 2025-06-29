const { useState } = React;
const UserAPI = window.UserAPI;
const RideAPI = window.RideAPI;
const LocationPicker = window.LocationPicker;

function RideManager() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('FCC');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [recurring, setRecurring] = useState(false);
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setPickup('');
    setDropoff('FCC');
    setDepartureTime('');
    setSeats(1);
    setRecurring(false);
    setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  const handleCreateRide = async () => {
    // Validation
    if (!pickup.trim()) {
      alert('Please enter a pickup location');
      return;
    }
    if (!dropoff.trim()) {
      alert('Please enter a destination');
      return;
    }
    if (!departureTime) {
      alert('Please select a departure time');
      return;
    }
    if (seats < 1) {
      alert('Please enter a valid number of seats');
      return;
    }

    setLoading(true);
    setSuccess(false);
    
    try {
      const user = await UserAPI.getCurrentUser();
      if (!user) {
        alert('Please select a user first');
        return;
      }

      const rideData = {
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        departureTime: new Date(departureTime).toISOString(),
        seats,
        availableSeats: seats,
        driverId: user.id,
        recurring: recurring ? { enabled: true, days } : { enabled: false },
        bookings: [],
      };

      const ride = await RideAPI.createRide(rideData);
      setSuccess(true);
      alert(`Ride created successfully! Ride ID: ${ride.id}`);
      resetForm();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating ride:', error);
      alert('Failed to create ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ride-manager bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Create a Ride</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Ride created successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <LocationPicker 
          label="Pickup Location" 
          value={pickup} 
          onChange={setPickup} 
        />
        <LocationPicker 
          label="Destination" 
          value={dropoff} 
          onChange={setDropoff} 
          defaultOption="FCC" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-2">Departure Time</label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Number of Seats</label>
          <input
            type="number"
            min="1"
            max="10"
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="mr-2"
          />
          <span className="text-gray-700">Recurring Ride (Mon-Fri)</span>
        </label>
        {recurring && (
          <p className="text-sm text-gray-600 mt-1">
            This ride will be created for the next 7 days on selected weekdays
          </p>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleCreateRide}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Ride'}
        </button>
        <button
          onClick={resetForm}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          Reset Form
        </button>
      </div>
    </div>
  );
}

window.RideManager = RideManager;