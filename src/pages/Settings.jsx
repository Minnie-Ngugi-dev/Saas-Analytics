import React, { useState, useEffect } from 'react';
import { FiSave, FiGlobe, FiDollarSign, FiCalendar, FiBell, FiShield } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    settings: {
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      notifications: {
        email: true,
        browser: true
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      const response = await api.get('/tenants');
      const { tenant } = response.data.data;
      setSettings({
        companyName: tenant.companyName,
        settings: tenant.settings || {
          currency: 'KES',
          timezone: 'Africa/Nairobi',
          dateFormat: 'DD/MM/YYYY',
          notifications: { email: true, browser: true }
        }
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/tenants', {
        companyName: settings.companyName,
        settings: settings.settings
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>
      
      {/* Company Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>
      
      {/* Regional Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Regional Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiDollarSign className="inline mr-1" /> Currency
            </label>
            <select
              value={settings.settings.currency}
              onChange={(e) => setSettings({
                ...settings,
                settings: { ...settings.settings, currency: e.target.value }
              })}
              className="input-field"
            >
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiGlobe className="inline mr-1" /> Timezone
            </label>
            <select
              value={settings.settings.timezone}
              onChange={(e) => setSettings({
                ...settings,
                settings: { ...settings.settings, timezone: e.target.value }
              })}
              className="input-field"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="inline mr-1" /> Date Format
            </label>
            <select
              value={settings.settings.dateFormat}
              onChange={(e) => setSettings({
                ...settings,
                settings: { ...settings.settings, dateFormat: e.target.value }
              })}
              className="input-field"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FiBell className="inline mr-2" /> Notifications
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Email Notifications</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.settings.notifications?.email}
                onChange={(e) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    notifications: { ...settings.settings.notifications, email: e.target.checked }
                  }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Browser Notifications</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.settings.notifications?.browser}
                onChange={(e) => setSettings({
                  ...settings,
                  settings: {
                    ...settings.settings,
                    notifications: { ...settings.settings.notifications, browser: e.target.checked }
                  }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <FiShield className="inline mr-2" /> Security
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (confirm('This will log out all devices. Continue?')) {
                toast.success('All devices logged out');
              }
            }}
            className="text-red-600 hover:text-red-700"
          >
            Log out all devices
          </button>
          <button
            onClick={() => window.location.href = '/forgot-password'}
            className="text-primary-600 hover:text-primary-700 ml-4"
          >
            Change Password
          </button>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <FiSave />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;