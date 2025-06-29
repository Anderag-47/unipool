const UserAPI = {
  getCurrentUser: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = DataService.getCurrentUser();
        resolve(user);
      }, 300);
    });
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('current_user');
  },
  getUserById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = DataService.getUserById(id);
        resolve(user);
      }, 300);
    });
  },
  updateUserRating: async (userId, rating, type, raterId = null, review = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (user) {
          user.ratings = user.ratings || { driver: [], rider: [] };
          
          // Create rating object with metadata
          const ratingObj = {
            rating: rating,
            raterId: raterId,
            review: review,
            timestamp: new Date().toISOString()
          };
          
          // Check if user has already rated this person
          const existingRatingIndex = user.ratings[type].findIndex(r => r.raterId === raterId);
          if (existingRatingIndex !== -1) {
            // Update existing rating
            user.ratings[type][existingRatingIndex] = ratingObj;
          } else {
            // Add new rating
            user.ratings[type].push(ratingObj);
          }
          
          DataService.saveData(data);
          resolve(user);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },
  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!userData.email.endsWith('fcccollege.edu.pk')) {
          resolve({ error: 'Invalid university email' });
          return;
        }
        
        // Check if user already exists
        const data = DataService.getData();
        const existingUser = data.users.find(u => u.email === userData.email);
        if (existingUser) {
          resolve({ error: 'User with this email already exists' });
          return;
        }
        
        const newUser = {
          id: DataService.generateId('u'),
          ...userData,
          ratings: { driver: [], rider: [] },
          rideHistory: [],
        };
        data.users.push(newUser);
        DataService.saveData(data);
        resolve(newUser);
      }, 300);
    });
  },
  getUserRatings: async (userId, type = 'driver') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (user && user.ratings && user.ratings[type]) {
          resolve(user.ratings[type]);
        } else {
          resolve([]);
        }
      }, 300);
    });
  },
  getAverageRating: async (userId, type = 'driver') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = DataService.getData();
        const user = data.users.find((u) => u.id === userId);
        if (user && user.ratings && user.ratings[type] && user.ratings[type].length > 0) {
          const avgRating = user.ratings[type].reduce((sum, r) => sum + r.rating, 0) / user.ratings[type].length;
          resolve(avgRating.toFixed(1));
        } else {
          resolve('No ratings');
        }
      }, 300);
    });
  }
};
window.UserAPI = UserAPI;