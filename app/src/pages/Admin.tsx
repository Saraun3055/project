import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Image,
  FolderOpen,
  BarChart3,
  Shield,
  Trash2,
  Search,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Ban,
  Undo2,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState({ users: 0, nfts: 0, collections: 0, listedNFTs: 0, totalVolume: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchNFTs();
    fetchCollections();
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNFTs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/nfts?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNfts(data.nfts);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/collections?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        toast.success('User role updated');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will also delete all their NFTs.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json().catch(() => ({ message: 'Failed to delete user' }));
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBanned })
      });
      if (res.ok) {
        toast.success(isBanned ? 'User banned' : 'User unbanned');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to ban/unban user');
    }
  };

  const handleDeleteNFT = async (nftId: string) => {
    if (!confirm('Are you sure you want to delete this NFT?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/nfts/${nftId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('NFT deleted');
        fetchNFTs();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete NFT');
    }
  };

  const handleToggleListNFT = async (nftId: string, isListed: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/nfts/${nftId}/list`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isListed: !isListed })
      });
      if (res.ok) {
        toast.success(!isListed ? 'NFT listed' : 'NFT unlisted');
        fetchNFTs();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update NFT listing status');
    }
  };

  const handleVerifyCollection = async (collectionId: string, isVerified: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/collections/${collectionId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified })
      });
      if (res.ok) {
        toast.success(isVerified ? 'Collection verified' : 'Verification removed');
        fetchCollections();
      }
    } catch (error) {
      toast.error('Failed to update collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure? This will also delete all NFTs in this collection.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/collections/${collectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Collection deleted');
        fetchCollections();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Shield className="w-8 h-8 text-purple-500" />
          <span className="text-xl font-bold text-white">Admin</span>
        </div>
        <nav className="space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Site
          </Link>
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 mb-4">
            <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.users}</p>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <Image className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.nfts}</p>
                  <p className="text-sm text-gray-400">Total NFTs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-900/30 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.collections}</p>
                  <p className="text-sm text-gray-400">Collections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.listedNFTs}</p>
                  <p className="text-sm text-gray-400">Listed NFTs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalVolume.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">ETH Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-gray-800 border border-gray-700 p-1">
            <TabsTrigger value="users" className="gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Image className="w-4 h-4" /> NFTs
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4" /> Collections
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Manage Users</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-300">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Verified</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Banned</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="w-8 h-8 rounded-full" />
                              <span className="font-medium text-white">{u.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <select value={u.role || 'user'} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">{u.verified ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-400" />}</td>
                          <td className="py-3 px-4">{u.isBanned ? <Ban className="w-5 h-5 text-red-500" /> : <Check className="w-5 h-5 text-green-500" />}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleBanUser(u.id, !u.isBanned)} title={u.isBanned ? 'Unban User' : 'Ban User'} className={u.isBanned ? 'text-green-500 hover:text-green-600' : 'text-orange-500 hover:text-orange-600'}>
                                {u.isBanned ? <Undo2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} title="Delete User" className="text-red-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nfts" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Manage NFTs</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search NFTs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-300">NFT</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Collection</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Listed</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Owner</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nfts.map((nft) => (
                        <tr key={nft._id} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={nft.imageUrl || 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-medium text-white">{nft.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{nft.collection}</td>
                          <td className="py-3 px-4 text-white">{nft.price} {nft.currency}</td>
                          <td className="py-3 px-4">{nft.isListed ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-400" />}</td>
                          <td className="py-3 px-4 text-gray-400">{nft.owner?.username || 'Unknown'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleToggleListNFT(nft._id, nft.isListed)} title={nft.isListed ? 'Unlist NFT' : 'List NFT'} className={nft.isListed ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600'}>
                                {nft.isListed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteNFT(nft._id)} title="Delete NFT" className="text-red-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="collections" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Manage Collections</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search collections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Collection</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Creator</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Floor Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Volume</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Verified</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((col) => (
                        <tr key={col._id} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={col.image || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-medium text-white">{col.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{col.creator?.username || 'Unknown'}</td>
                          <td className="py-3 px-4 text-white">{col.floorPrice} ETH</td>
                          <td className="py-3 px-4 text-white">{col.totalVolume} ETH</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" onClick={() => handleVerifyCollection(col._id, !col.isVerified)} className={col.isVerified ? 'text-green-500' : 'text-gray-400'}>
                              {col.isVerified ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </Button>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCollection(col._id)} className="text-red-500 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
