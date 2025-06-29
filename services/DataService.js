class DataService {
  constructor() {
    this.DB_KEY = 'unipool_db';
    this.initializeData();
  }

  async initializeData() {
    try {
      if (!localStorage.getItem(this.DB_KEY)) {
        const response = await fetch('/db.json');
        if (!response.ok) {
          console.warn('db.json not found, using default data');
          const initialData = {
            users: [
              { id: 'u1', name: 'Ali Khan', email: 'ali@fcccollege.edu.pk', role: 'Driver', ratings: { driver: [], rider: [] }, rideHistory: [] },
              { id: 'u2', name: 'Sara Ahmed', email: 'sara@fcccollege.edu.pk', role: 'Rider', ratings: { driver: [], rider: [] }, rideHistory: [] }
            ],
            rides: [],
            bookings: []
          };
          localStorage.setItem(this.DB_KEY, JSON.stringify(initialData));
          return;
        }
        const initialData = await response.json();
        localStorage.setItem(this.DB_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Fallback to default data if initialization fails
      const fallbackData = {
        users: [
          { id: 'u1', name: 'Ali Khan', email: 'ali@fcccollege.edu.pk', role: 'Driver', ratings: { driver: [], rider: [] }, rideHistory: [] },
          { id: 'u2', name: 'Sara Ahmed', email: 'sara@fcccollege.edu.pk', role: 'Rider', ratings: { driver: [], rider: [] }, rideHistory: [] }
        ],
        rides: [],
        bookings: []
      };
      localStorage.setItem(this.DB_KEY, JSON.stringify(fallbackData));
    }
  }

  getData() {
    try {
      const data = localStorage.getItem(this.DB_KEY);
      const parsedData = data ? JSON.parse(data) : { users: [], rides: [], bookings: [] };
      
      // Ensure data structure is valid
      return {
        users: parsedData.users || [],
        rides: parsedData.rides || [],
        bookings: parsedData.bookings || []
      };
    } catch (error) {
      console.error('Error reading data:', error);
      return { users: [], rides: [], bookings: [] };
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Failed to save data');
    }
  }

  getRides(filters = {}) {
    const data = this.getData();
    let rides = data.rides || [];
    
    if (filters.pickup) {
      rides = rides.filter((r) => r.pickup.toLowerCase().includes(filters.pickup.toLowerCase()));
    }
    if (filters.dropoff) {
      rides = rides.filter((r) => r.dropoff === filters.dropoff);
    }
    if (filters.time) {
      const inputTime = new Date(filters.time);
      rides = rides.filter((r) => {
        const rideTime = new Date(r.departureTime);
        const diff = Math.abs(rideTime - inputTime) / 1000 / 60;
        return diff <= 30;
      });
    }
    if (filters.id) {
      rides = rides.filter((r) => r.id === filters.id);
    }
    
    return rides.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
  }

  getRideById(rideId) {
    const data = this.getData();
    return data.rides.find((r) => r.id === rideId) || null;
  }

  addRide(rideData) {
    try {
      const data = this.getData();
      const ride = {
        id: this.generateId('r'),
        ...rideData,
        availableSeats: rideData.seats,
        bookings: [],
        createdAt: new Date().toISOString()
      };
      
      data.rides.push(ride);
      
      // Handle recurring rides
      if (ride.recurring && ride.recurring.enabled) {
        const now = new Date();
        for (let i = 1; i <= 7; i++) {
          const nextDate = new Date(now);
          nextDate.setDate(now.getDate() + i);
          const day = nextDate.toLocaleString('en-US', { weekday: 'short' });
          
          if (ride.recurring.days.includes(day)) {
            const recurringRide = {
              ...ride,
              id: this.generateId('r'),
              departureTime: new Date(
                `${nextDate.toISOString().split('T')[0]}T${ride.departureTime.split('T')[1]}`
              ).toISOString(),
              isRecurring: true,
              parentRideId: ride.id
            };
            data.rides.push(recurringRide);
          }
        }
      }
      
      this.saveData(data);
      return ride;
    } catch (error) {
      console.error('Error adding ride:', error);
      throw new Error('Failed to create ride');
    }
  }

  bookRide(rideId, bookingData) {
    try {
      const data = this.getData();
      const ride = data.rides.find((r) => r.id === rideId);
      
      if (!ride) {
        throw new Error('Ride not found');
      }
      
      if (ride.availableSeats <= 0) {
        throw new Error('No seats available');
      }
      
      // Check if user has already booked this ride
      const existingBooking = ride.bookings.find(b => b.riderId === bookingData.riderId);
      if (existingBooking) {
        throw new Error('You have already booked this ride');
      }
      
      const booking = {
        id: this.generateId('b'),
        rideId,
        riderId: bookingData.riderId,
        driverId: ride.driverId,
        status: 'confirmed',
        pickupPoint: bookingData.pickupPoint || ride.pickup,
        bookingTime: new Date().toISOString(),
      };
      
      ride.bookings.push(booking);
      ride.availableSeats -= 1;
      data.bookings.push(booking);
      
      this.saveData(data);
      return booking;
    } catch (error) {
      console.error('Error booking ride:', error);
      throw error;
    }
  }

  cancelBooking(rideId, userId) {
    try {
      const data = this.getData();
      const ride = data.rides.find((r) => r.id === rideId);
      
      if (!ride) {
        return false;
      }
      
      const bookingIndex = ride.bookings.findIndex((b) => b.riderId === userId);
      if (bookingIndex === -1) {
        return false;
      }
      
      const booking = ride.bookings[bookingIndex];
      const timeDiff = (new Date(ride.departureTime) - new Date()) / 1000 / 60;
      
      // Apply penalty for late cancellation
      if (timeDiff < 60) {
        const user = data.users.find((u) => u.id === userId);
        if (user) {
          user.ratings = user.ratings || { driver: [], rider: [] };
          user.ratings.rider.push({
            rating: 2,
            raterId: 'system',
            review: 'Late cancellation penalty',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      ride.bookings.splice(bookingIndex, 1);
      ride.availableSeats += 1;
      
      const bookingRecord = data.bookings.find((b) => b.id === booking.id);
      if (bookingRecord) {
        bookingRecord.status = 'cancelled';
        bookingRecord.cancelledAt = new Date().toISOString();
      }
      
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('current_user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  getUserById(userId) {
    const data = this.getData();
    return data.users.find((u) => u.id === userId) || null;
  }

  getUserBookings(userId) {
    const data = this.getData();
    return data.bookings.filter(b => b.riderId === userId);
  }

  getDriverRides(driverId) {
    const data = this.getData();
    return data.rides.filter(r => r.driverId === driverId);
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  // Data validation and cleanup methods
  validateData() {
    const data = this.getData();
    let isValid = true;
    const errors = [];

    // Validate users
    data.users.forEach((user, index) => {
      if (!user.id || !user.name || !user.email) {
        errors.push(`Invalid user at index ${index}`);
        isValid = false;
      }
    });

    // Validate rides
    data.rides.forEach((ride, index) => {
      if (!ride.id || !ride.pickup || !ride.dropoff || !ride.departureTime) {
        errors.push(`Invalid ride at index ${index}`);
        isValid = false;
      }
    });

    if (!isValid) {
      console.warn('Data validation errors:', errors);
    }

    return isValid;
  }

  cleanupOldRides() {
    const data = this.getData();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    data.rides = data.rides.filter(ride => {
      const rideTime = new Date(ride.departureTime);
      return rideTime > oneDayAgo;
    });
    
    this.saveData(data);
  }
}

window.DataService = new DataService();