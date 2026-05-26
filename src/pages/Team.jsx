import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiMail, FiTrash2, FiUser, FiShield, FiStar } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'viewer'
  });
  const [tenant, setTenant] = useState(null);
  
  useEffect(() => {
    fetchTeam();
    fetchTenant();
  }, []);
  
  const fetchTeam = async () => {
    try {
      const response = await api.get('/tenants');
      setTeamMembers(response.data.data.users || []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTenant = async () => {
    try {
      const response = await api.get('/tenants');
      setTenant(response.data.data.tenant);
    } catch (error) {
      console.error('Failed to load tenant:', error);
    }
  };
  
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tenants/invite', inviteData);
      toast.success(`Invitation sent to ${inviteData.email}`);
      setShowInviteModal(false);
      setInviteData({ email: '', name: '', role: 'viewer' });
      fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    }
  };
  
  const handleRemoveUser = async (userId, userName) => {
    if (confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      try {
        await api.delete(`/tenants/users/${userId}`);
        toast.success(`${userName} removed from team`);
        fetchTeam();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to remove user');
      }
    }
  };
  
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/tenants/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };
  
  const getRoleIcon = (role) => {
    switch(role) {
      case 'owner': return <FiStar className="text-yellow-500" />;
      case 'admin': return <FiShield className="text-blue-500" />;
      default: return <FiUser className="text-gray-500" />;
    }
  };
  
  const getRoleBadge = (role) => {
    const styles = {
      owner: 'bg-yellow-100 text-yellow-700',
      admin: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    return styles[role] || styles.viewer;
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiUserPlus /> Invite Member
        </button>
      </div>
      
      {/* Tenant Info */}
      {tenant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Company:</strong> {tenant.companyName} | 
            <strong className="ml-4">Plan:</strong> {tenant.subscriptionTier.toUpperCase()} |
            <strong className="ml-4">Team Slots:</strong> {teamMembers.length} / {tenant.maxUsers}
          </p>
        </div>
      )}
      
      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Member</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Last Login</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  </td>
                </tr>
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No team members yet. Invite your first member!
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          {member.role === 'owner' && (
                            <span className="text-xs text-yellow-600">Account Owner</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span className="text-gray-600">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.role === 'owner' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                          Owner
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                          className="px-2 py-1 border rounded-lg text-sm bg-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveUser(member._id, member.name)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="input-field"
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="viewer">Viewer - Read only</option>
                </select>
              </div>
              
              <button type="submit" className="btn-primary w-full">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;