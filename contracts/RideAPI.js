const RideAPI = {
  createRide: async (rideData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ride = DataService.addRide(rideData);
        resolve(ride);
      }, 300);
    });
  },
  bookRide: async (rideId, bookingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = DataService.bookRide(rideId, bookingData);
        resolve(booking);
      }, 300);
    });
  },
  cancelBooking: async (rideId, userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = DataService.cancelBooking(rideId, userId);
        resolve(result);
      }, 300);
    });
  },
  getRidesByRoute: async (filters) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = DataService.getRides(filters);
        resolve(rides);
      }, 300);
    });
  },
};
window.RideAPI = RideAPI;