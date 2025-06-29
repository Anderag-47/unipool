const AIAPI = {
  getRecommendations: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (!user) {
          resolve([]);
          return;
        }
        
        const rides = data.rides.filter((ride) => {
          const rideTime = new Date(ride.departureTime);
          const now = new Date();
          const timeDiff = Math.abs(rideTime - now) / 1000 / 60;
          return ride.dropoff === 'FCC' && timeDiff <= 30 && ride.availableSeats > 0;
        });
        
        // Sort by driver rating and time proximity
        rides.sort((a, b) => {
          const driverA = data.users.find((u) => u.id === a.driverId);
          const driverB = data.users.find((u) => u.id === b.driverId);
          
          // Calculate average ratings
          const ratingA = driverA?.ratings?.driver?.length >= 3
            ? driverA.ratings.driver.reduce((sum, r) => sum + (r.rating || r), 0) / driverA.ratings.driver.length
            : 0;
          const ratingB = driverB?.ratings?.driver?.length >= 3
            ? driverB.ratings.driver.reduce((sum, r) => sum + (r.rating || r), 0) / driverB.ratings.driver.length
            : 0;
          
          // Calculate time proximity (closer rides get higher priority)
          const timeA = new Date(a.departureTime);
          const timeB = new Date(b.departureTime);
          const now = new Date();
          const proximityA = Math.abs(timeA - now);
          const proximityB = Math.abs(timeB - now);
          
          // Combined score: 70% rating + 30% time proximity
          const scoreA = (ratingA * 0.7) + ((1 / (proximityA / 1000 / 60)) * 0.3);
          const scoreB = (ratingB * 0.7) + ((1 / (proximityB / 1000 / 60)) * 0.3);
          
          return scoreB - scoreA;
        });
        
        resolve(rides);
      }, 300);
    });
  },
  
  matchRides: async (request) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = DataService.getRides(request);
        resolve(rides);
      }, 300);
    });
  },
  
  parseLocation: async (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(text.trim().toLowerCase());
      }, 300);
    });
  },
  
  getSmartRecommendations: async (userId, preferences = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (!user) {
          resolve([]);
          return;
        }
        
        let rides = data.rides.filter((ride) => {
          const rideTime = new Date(ride.departureTime);
          const now = new Date();
          const timeDiff = Math.abs(rideTime - now) / 1000 / 60;
          
          // Basic filters
          if (ride.availableSeats <= 0) return false;
          if (timeDiff > 60) return false; // Only rides within 1 hour
          
          // Apply preferences
          if (preferences.destination && ride.dropoff !== preferences.destination) return false;
          if (preferences.maxTime && timeDiff > preferences.maxTime) return false;
          
          return true;
        });
        
        // Smart scoring based on multiple factors
        rides = rides.map(ride => {
          const driver = data.users.find((u) => u.id === ride.driverId);
          const rideTime = new Date(ride.departureTime);
          const now = new Date();
          const timeDiff = Math.abs(rideTime - now) / 1000 / 60;
          
          // Calculate driver rating
          const driverRating = driver?.ratings?.driver?.length >= 3
            ? driver.ratings.driver.reduce((sum, r) => sum + (r.rating || r), 0) / driver.ratings.driver.length
            : 3.0; // Default rating for new drivers
          
          // Calculate time proximity score (closer = higher score)
          const timeScore = Math.max(0, 1 - (timeDiff / 60));
          
          // Calculate seat availability score (more seats = higher score)
          const seatScore = Math.min(1, ride.availableSeats / 4);
          
          // Combined score
          const totalScore = (driverRating * 0.5) + (timeScore * 0.3) + (seatScore * 0.2);
          
          return { ...ride, score: totalScore };
        });
        
        // Sort by score
        rides.sort((a, b) => b.score - a.score);
        
        resolve(rides.slice(0, 10)); // Return top 10 recommendations
      }, 300);
    });
  },
  
  analyzeUserPreferences: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (!user) {
          resolve({});
          return;
        }
        
        const userBookings = data.bookings.filter(b => b.riderId === userId);
        const preferences = {
          favoriteDestinations: [],
          preferredTimes: [],
          favoriteDrivers: []
        };
        
        // Analyze booking history
        userBookings.forEach(booking => {
          const ride = data.rides.find(r => r.id === booking.rideId);
          if (ride) {
            // Track destinations
            if (!preferences.favoriteDestinations.includes(ride.dropoff)) {
              preferences.favoriteDestinations.push(ride.dropoff);
            }
            
            // Track times
            const hour = new Date(ride.departureTime).getHours();
            if (!preferences.preferredTimes.includes(hour)) {
              preferences.preferredTimes.push(hour);
            }
            
            // Track drivers
            if (!preferences.favoriteDrivers.includes(ride.driverId)) {
              preferences.favoriteDrivers.push(ride.driverId);
            }
          }
        });
        
        resolve(preferences);
      }, 300);
    });
  }
};

window.AIAPI = AIAPI;