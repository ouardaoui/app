import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit, Save, X } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://your-api.com/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (macAddress) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`http://your-api.com/admin/users/${macAddress}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle user update
  const handleUpdateUser = async (macAddress) => {
    try {
      await fetch(`http://your-api.com/admin/users/${macAddress}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playlist: newPlaylistUrl,
          isAuthenticated: true
        })
      });
      setEditingUser(null);
      setNewPlaylistUrl('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.macAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Streaming App Admin Panel</h1>
        
        {/* Search and Add User Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by MAC address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pr-10 border rounded-lg"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">
              <UserPlus size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">MAC Address</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Playlist URL</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.macAddress}>
                  <td className="px-6 py-4">{user.macAddress}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isAuthenticated ? 'Authenticated' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.macAddress ? (
                      <input
                        type="text"
                        value={newPlaylistUrl}
                        onChange={(e) => setNewPlaylistUrl(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter playlist URL"
                      />
                    ) : (
                      user.playlist || 'No playlist assigned'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.macAddress ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateUser(user.macAddress)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save size={20} />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user.macAddress)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.macAddress)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;