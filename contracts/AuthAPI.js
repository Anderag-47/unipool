const AuthAPI = {
  // Login with email and password
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // Simple password validation (in real app, use proper hashing)
          if (password !== 'password123') { // Default password for demo
            resolve({ error: 'Invalid password' });
            return;
          }
          
          // Create session
          const session = {
            userId: user.id,
            email: user.email,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          };
          
          localStorage.setItem('auth_session', JSON.stringify(session));
          localStorage.setItem('current_user', user.id);
          
          // Update user's last active time
          const userIndex = data.users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            data.users[userIndex].lastActive = new Date().toISOString();
            DataService.saveData(data);
          }
          
          resolve({ user, session });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // Register new user
  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Enhanced email validation for two different domains
          const email = userData.email.toLowerCase();
          const formanitePattern = /^\d+@formanite\.fccollege\.edu\.pk$/;
          const fccPattern = /^[a-zA-Z]+@fccollege\.edu\.pk$/;
          
          if (!formanitePattern.test(email) && !fccPattern.test(email)) {
            resolve({ 
              error: 'Invalid email format. Use rollnumber@formanite.fccollege.edu.pk or name@fccollege.edu.pk' 
            });
            return;
          }
          
          // Validate password strength
          if (!userData.password || userData.password.length < 6) {
            resolve({ error: 'Password must be at least 6 characters long' });
            return;
          }
          
          const data = DataService.getData();
          const existingUser = data.users.find(u => u.email === userData.email);
          
          if (existingUser) {
            resolve({ error: 'User with this email already exists' });
            return;
          }
          
          // Create new user
          const newUser = {
            id: DataService.generateId('u'),
            name: userData.name,
            email: userData.email,
            role: userData.role || 'Rider',
            phone: userData.phone || '',
            studentId: userData.studentId || '',
            department: userData.department || '',
            year: userData.year || '',
            preferences: {
              notifications: true,
              autoBook: false,
              preferredPickup: '',
              preferredDropoff: ''
            },
            ratings: { driver: [], rider: [] },
            rideHistory: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
          };
          
          data.users.push(newUser);
          DataService.saveData(data);
          
          // Auto-login after registration
          const session = {
            userId: newUser.id,
            email: newUser.email,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          
          localStorage.setItem('auth_session', JSON.stringify(session));
          localStorage.setItem('current_user', newUser.id);
          
          resolve({ user: newUser, session });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // Logout user
  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('auth_session');
        localStorage.removeItem('current_user');
        resolve({ success: true });
      }, 200);
    });
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    try {
      const session = localStorage.getItem('auth_session');
      if (!session) return false;
      
      const sessionData = JSON.parse(session);
      const now = new Date();
      const expiresAt = new Date(sessionData.expiresAt);
      
      if (now > expiresAt) {
        // Session expired, clear it
        localStorage.removeItem('auth_session');
        localStorage.removeItem('current_user');
        return false;
      }
      
      // Refresh session if it's close to expiring (within 1 hour)
      const timeUntilExpiry = expiresAt - now;
      const oneHour = 60 * 60 * 1000;
      
      if (timeUntilExpiry < oneHour) {
        // Extend session
        sessionData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('auth_session', JSON.stringify(sessionData));
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Get current session
  getCurrentSession: () => {
    try {
      const session = localStorage.getItem('auth_session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Refresh session
  refreshSession: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const session = AuthAPI.getCurrentSession();
          if (session) {
            session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem('auth_session', JSON.stringify(session));
            resolve(session);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          resolve(null);
        }
      }, 200);
    });
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // In a real app, you'd validate the current password against a hash
          if (currentPassword !== 'password123') {
            resolve({ error: 'Current password is incorrect' });
            return;
          }
          
          if (!newPassword || newPassword.length < 6) {
            resolve({ error: 'New password must be at least 6 characters long' });
            return;
          }
          
          // In a real app, you'd hash the new password and save it
          // For demo purposes, we'll just return success
          resolve({ success: true, message: 'Password changed successfully' });
        } catch (error) {
          resolve({ error: 'Failed to change password' });
        }
      }, 500);
    });
  },

  // Reset password (forgot password)
  resetPassword: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const data = DataService.getData();
          const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            resolve({ error: 'User not found' });
            return;
          }
          
          // In a real app, you'd send a reset email
          // For demo purposes, we'll just return success
          resolve({ 
            success: true, 
            message: 'Password reset instructions sent to your email' 
          });
        } catch (error) {
          resolve({ error: 'Failed to process password reset' });
        }
      }, 500);
    });
  }
};

window.AuthAPI = AuthAPI; 