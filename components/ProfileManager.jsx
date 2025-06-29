const { useState, useEffect } = React;
const ProfileAPI = window.ProfileAPI;
const AuthAPI = window.AuthAPI;

function ProfileManager({ userId, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileData, statsData, historyData] = await Promise.all([
        ProfileAPI.getProfile(userId),
        ProfileAPI.getUserStats(userId),
        ProfileAPI.getRideHistory(userId)
      ]);

      if (profileData.error) {
        setError(profileData.error);
      } else {
        setProfile(profileData);
      }

      if (statsData.error) {
        console.error('Failed to load stats:', statsData.error);
      } else {
        setStats(statsData);
      }

      if (historyData.error) {
        console.error('Failed to load history:', historyData.error);
      } else {
        setRideHistory(historyData);
      }
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await ProfileAPI.updateProfile(userId, updatedData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setProfile(result.user);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (preferences) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await ProfileAPI.updatePreferences(userId, preferences);
      
      if (result.error) {
        setError(result.error);
      } else {
        setProfile(prev => ({
          ...prev,
          preferences: result.preferences
        }));
        setMessage('Preferences updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Force logout even if API fails
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.name || 'User'}</h1>
            <p className="text-blue-100">{profile?.email}</p>
            <p className="text-blue-100 text-sm">{profile?.role} • Member since {stats?.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'stats', label: 'Statistics', icon: '📊' },
            { id: 'history', label: 'Ride History', icon: '🚗' },
            { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            { id: 'security', label: 'Security', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <ProfileTab 
            profile={profile} 
            onUpdate={handleProfileUpdate}
            saving={saving}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab stats={stats} />
        )}

        {activeTab === 'history' && (
          <HistoryTab history={rideHistory} />
        )}

        {activeTab === 'preferences' && (
          <PreferencesTab 
            preferences={profile?.preferences}
            onUpdate={handlePreferencesUpdate}
            saving={saving}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTab 
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ profile, onUpdate, saving }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    studentId: profile?.studentId || '',
    department: profile?.department || '',
    year: profile?.year || ''
  });

  useEffect(() => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      studentId: profile?.studentId || '',
      department: profile?.department || '',
      year: profile?.year || ''
    });
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Arts">Arts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Statistics Tab Component
function StatsTab({ stats }) {
  if (!stats) {
    return <div className="text-gray-500">No statistics available</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Your Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRides}</div>
          <div className="text-sm text-gray-600">Total Rides</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalRidesAsDriver}</div>
          <div className="text-sm text-gray-600">As Driver</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRidesAsRider}</div>
          <div className="text-sm text-gray-600">As Rider</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Ratings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Driver Rating:</span>
              <span className="font-medium">{stats.averageDriverRating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rider Rating:</span>
              <span className="font-medium">{stats.averageRiderRating}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Account Info</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="font-medium">{stats.memberSince}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Active:</span>
              <span className="font-medium">{stats.lastActive}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No ride history available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Ride History</h2>
      
      <div className="space-y-4">
        {history.map((ride) => (
          <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-800">
                  {ride.pickup} → {ride.dropoff}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-500">
                  Role: {ride.role} • Status: {ride.bookingStatus || 'Completed'}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ride.role === 'Driver' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ride.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Preferences Tab Component
function PreferencesTab({ preferences, onUpdate, saving }) {
  const [formData, setFormData] = useState({
    notifications: preferences?.notifications ?? true,
    autoBook: preferences?.autoBook ?? false,
    preferredPickup: preferences?.preferredPickup ?? '',
    preferredDropoff: preferences?.preferredDropoff ?? ''
  });

  useEffect(() => {
    setFormData({
      notifications: preferences?.notifications ?? true,
      autoBook: preferences?.autoBook ?? false,
      preferredPickup: preferences?.preferredPickup ?? '',
      preferredDropoff: preferences?.preferredDropoff ?? ''
    });
  }, [preferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="autoBook"
              checked={formData.autoBook}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Auto-book matching rides
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Pickup Location
            </label>
            <input
              type="text"
              name="preferredPickup"
              value={formData.preferredPickup}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter preferred pickup location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Dropoff Location
            </label>
            <input
              type="text"
              name="preferredDropoff"
              value={formData.preferredDropoff}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter preferred dropoff location"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ onLogout }) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
      
      {/* Logout */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Session Management</h3>
        
        <button
          onClick={onLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

window.ProfileManager = ProfileManager; 