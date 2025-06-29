const ProfileAPI = {
  // Get user profile by ID
  getProfile: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const user = data.users.find(u => u.id === userId);
          
          if (!user) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Return profile data (excluding sensitive info)
          const profile = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            studentId: user.studentId || '',
            department: user.department || '',
            year: user.year || '',
            preferences: user.preferences || {
              notifications: true,
              autoBook: false,
              preferredPickup: '',
              preferredDropoff: ''
            },
            ratings: user.ratings || { driver: [], rider: [] },
            rideHistory: user.rideHistory || [],
            createdAt: user.createdAt,
            lastActive: user.lastActive
          };
          
          resolve(profile);
        } catch (error) {
          resolve({ error: 'Failed to load profile' });
        }
      }, 300);
    });
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const userIndex = data.users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Update allowed fields
          const allowedFields = ['name', 'phone', 'studentId', 'department', 'year'];
          const updatedUser = { ...data.users[userIndex] };
          
          allowedFields.forEach(field => {
            if (profileData[field] !== undefined) {
              updatedUser[field] = profileData[field];
            }
          });
          
          // Update preferences if provided
          if (profileData.preferences) {
            updatedUser.preferences = {
              ...updatedUser.preferences,
              ...profileData.preferences
            };
          }
          
          updatedUser.lastActive = new Date().toISOString();
          data.users[userIndex] = updatedUser;
          DataService.saveData(data);
          
          resolve({ user: updatedUser, success: true });
        } catch (error) {
          resolve({ error: 'Failed to update profile' });
        }
      }, 400);
    });
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const userIndex = data.users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            resolve({ error: 'User not found' });
            return;
          }
          
          data.users[userIndex].preferences = {
            ...data.users[userIndex].preferences,
            ...preferences
          };
          
          data.users[userIndex].lastActive = new Date().toISOString();
          DataService.saveData(data);
          
          resolve({ 
            preferences: data.users[userIndex].preferences, 
            success: true 
          });
        } catch (error) {
          resolve({ error: 'Failed to update preferences' });
        }
      }, 300);
    });
  },

  // Get user statistics
  getUserStats: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const user = data.users.find(u => u.id === userId);
          
          if (!user) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Calculate statistics
          const userRides = data.rides.filter(r => r.driverId === userId);
          const userBookings = data.bookings.filter(b => b.riderId === userId);
          
          const stats = {
            totalRidesAsDriver: userRides.length,
            totalRidesAsRider: userBookings.length,
            totalRides: userRides.length + userBookings.length,
            averageDriverRating: 'No ratings',
            averageRiderRating: 'No ratings',
            memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
            lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Unknown'
          };
          
          // Calculate average ratings
          if (user.ratings && user.ratings.driver && user.ratings.driver.length > 0) {
            const avgDriverRating = user.ratings.driver.reduce((sum, r) => sum + r.rating, 0) / user.ratings.driver.length;
            stats.averageDriverRating = avgDriverRating.toFixed(1);
          }
          
          if (user.ratings && user.ratings.rider && user.ratings.rider.length > 0) {
            const avgRiderRating = user.ratings.rider.reduce((sum, r) => sum + r.rating, 0) / user.ratings.rider.length;
            stats.averageRiderRating = avgRiderRating.toFixed(1);
          }
          
          resolve(stats);
        } catch (error) {
          resolve({ error: 'Failed to load statistics' });
        }
      }, 300);
    });
  },

  // Get user ride history
  getRideHistory: async (userId, type = 'all') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          let history = [];
          
          if (type === 'all' || type === 'driver') {
            const driverRides = data.rides.filter(r => r.driverId === userId);
            history.push(...driverRides.map(ride => ({
              ...ride,
              type: 'driver',
              role: 'Driver'
            })));
          }
          
          if (type === 'all' || type === 'rider') {
            const riderBookings = data.bookings.filter(b => b.riderId === userId);
            const riderRides = riderBookings.map(booking => {
              const ride = data.rides.find(r => r.id === booking.rideId);
              return ride ? {
                ...ride,
                type: 'rider',
                role: 'Rider',
                bookingId: booking.id,
                bookingStatus: booking.status
              } : null;
            }).filter(Boolean);
            history.push(...riderRides);
          }
          
          // Sort by date (newest first)
          history.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
          
          resolve(history);
        } catch (error) {
          resolve({ error: 'Failed to load ride history' });
        }
      }, 300);
    });
  },

  // Delete user account
  deleteAccount: async (userId, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Validate password (in real app, check against hash)
          if (password !== 'password123') {
            resolve({ error: 'Invalid password' });
            return;
          }
          
          const data = DataService.getData();
          const userIndex = data.users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Remove user's rides and bookings
          data.rides = data.rides.filter(r => r.driverId !== userId);
          data.bookings = data.bookings.filter(b => b.riderId !== userId);
          
          // Remove user
          data.users.splice(userIndex, 1);
          
          DataService.saveData(data);
          
          // Clear session
          localStorage.removeItem('auth_session');
          localStorage.removeItem('current_user');
          
          resolve({ success: true, message: 'Account deleted successfully' });
        } catch (error) {
          resolve({ error: 'Failed to delete account' });
        }
      }, 500);
    });
  },

  // Upload profile picture (mock implementation)
  uploadProfilePicture: async (userId, file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // In a real app, you'd upload to a cloud service
          // For demo purposes, we'll just return success
          resolve({ 
            success: true, 
            message: 'Profile picture uploaded successfully',
            url: 'https://via.placeholder.com/150x150?text=Profile'
          });
        } catch (error) {
          resolve({ error: 'Failed to upload profile picture' });
        }
      }, 1000);
    });
  },

  // Get user verification status
  getVerificationStatus: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const user = data.users.find(u => u.id === userId);
          
          if (!user) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Mock verification status
          const verification = {
            emailVerified: true,
            phoneVerified: !!user.phone,
            studentIdVerified: !!user.studentId,
            profileComplete: !!(user.name && user.email && user.phone),
            isVerified: true // Overall verification status
          };
          
          resolve(verification);
        } catch (error) {
          resolve({ error: 'Failed to get verification status' });
        }
      }, 200);
    });
  }
};

window.ProfileAPI = ProfileAPI; 