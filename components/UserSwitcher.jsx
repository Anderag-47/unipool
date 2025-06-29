const { useState, useEffect } = React;
const UserAPI = window.UserAPI;
const DataService = window.DataService;

function UserSwitcher({ onUserChange }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      const data = DataService.getData();
      setUsers(data.users || []);
      const storedUserId = localStorage.getItem('current_user');
      if (storedUserId) {
        const user = await UserAPI.getUserById(storedUserId);
        setCurrentUser(user);
        if (onUserChange) {
          console.log('UserSwitcher: Calling onUserChange during load:', user);
          onUserChange(user);
        }
      }
    };
    loadUsers();
  }, [onUserChange]);

  const switchUser = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const user = await UserAPI.getUserById(userId);
      if (user) {
        localStorage.setItem('current_user', userId);
        localStorage.setItem('current_user_data', JSON.stringify(user));
        setCurrentUser(user);
        if (onUserChange) {
          console.log('UserSwitcher: Calling onUserChange during switch:', user);
          onUserChange(user);
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Error switching user:', error);
      alert('Failed to switch user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-switcher bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Switch User</h2>
      {currentUser ? (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800">Current User: {currentUser.name}</p>
          <p className="text-sm text-blue-600">Email: {currentUser.email}</p>
          <p className="text-sm text-blue-600">Role: {currentUser.role}</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">No user selected</p>
        </div>
      )}
      <div className="flex gap-2">
        <select
          onChange={(e) => switchUser(e.target.value)}
          disabled={loading}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
        {loading && (
          <div className="flex items-center px-3 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

window.UserSwitcher = UserSwitcher;