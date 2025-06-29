const { useState, useEffect } = React;
const UserAPI = window.UserAPI;
const RideAPI = window.RideAPI;
const DataService = window.DataService;

function RatingSystem({ rideId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const r = await RideAPI.getRidesByRoute({ id: rideId });
        if (r.length > 0) {
          const rideData = r[0];
          setRide(rideData);
          
          // Get driver information
          const driverData = DataService.getUserById(rideData.driverId);
          setDriver(driverData);
        }
      } catch (error) {
        console.error('Error loading ride:', error);
      }
    };
    if (rideId) {
      loadRide();
    }
  }, [rideId]);

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          className={`text-2xl ${
            i <= displayRating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }
    if (review.length > 200) {
      alert('Review must be 200 characters or less');
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

      // Check if user has already rated this driver
      const existingRating = driver?.ratings?.driver?.find(r => r.raterId === user.id);
      if (existingRating) {
        if (!window.confirm('You have already rated this driver. Do you want to update your rating?')) {
          return;
        }
      }

      await UserAPI.updateUserRating(ride.driverId, rating, 'driver', user.id, review);
      setSuccess(true);
      alert('Rating submitted successfully!');
      setRating(0);
      setReview('');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!ride) {
    return (
      <div className="rating-system bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Rate Ride</h2>
        <p className="text-gray-500">Loading ride information...</p>
      </div>
    );
  }

  return (
    <div className="rating-system bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Rate Ride</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Rating submitted successfully!</p>
        </div>
      )}

      {ride && driver && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Ride Details</h3>
          <p className="text-gray-700">From: {ride.pickup} → To: {ride.dropoff}</p>
          <p className="text-gray-700">Driver: {driver.name}</p>
          <p className="text-gray-700">Departure: {new Date(ride.departureTime).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 mb-3 font-medium">Rating</label>
        <div className="flex items-center gap-2">
          {renderStars()}
          <span className="ml-2 text-gray-600">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Review (optional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength="200"
          rows="3"
          placeholder="Share your experience with this ride..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {review.length}/200 characters
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmitRating}
          disabled={loading || rating === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
        <button
          onClick={() => {
            setRating(0);
            setReview('');
            setHoverRating(0);
          }}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

window.RatingSystem = RatingSystem;