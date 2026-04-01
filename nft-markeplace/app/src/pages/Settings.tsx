import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Wallet, Save, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, updateProfile, logout, linkWallet } = useAuth();
  const { connect, isConnected, address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleSave = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLinkWallet = async () => {
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    if (isConnected && address) {
      try {
        await linkWallet(address);
        toast.success('Wallet linked successfully');
      } catch (error) {
        toast.error('Failed to link wallet');
      }
    } else {
      try {
        await connect();
      } catch (error) {
        toast.error('Failed to connect wallet');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>
        
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="dark:bg-slate-950 dark:border-slate-800">
            <CardHeader>
<CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar URL</label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <Button onClick={handleSave} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="dark:bg-slate-950 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Account
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Wallet</p>
                  <p className="text-sm text-gray-500">
                    {user?.walletAddress || 'No wallet linked'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLinkWallet}>
                  <Wallet className="w-4 h-4 mr-2" />
                  {user?.walletAddress ? 'Update Wallet' : 'Link Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
