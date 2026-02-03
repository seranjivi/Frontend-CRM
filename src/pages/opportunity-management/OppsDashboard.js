import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { RefreshCw, Users, Mail, Download, Filter } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { getUsers } from '../../services/userService';
import { toast } from 'sonner';

const OppsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [month, setMonth] = useState('All Months');

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      const allUsers = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

      console.log('All Users API Response:', allUsers);

      const salesUsers = allUsers.filter(user => {
        const roleName = (user.role_name ||
          (user.roles && (user.roles[0]?.name || user.roles[0])) ||
          user.role ||
          '').toLowerCase();

        return roleName.includes('presales') ||
          roleName.includes('sales') ||
          roleName.includes('manager') ||
          roleName.includes('admin') ||
          roleName.includes('lead') ||
          roleName.includes('head');
      });

      setUsers(salesUsers.length > 0 ? salesUsers : allUsers);
      if (salesUsers.length > 0) {
        setSelectedUser(salesUsers[0]);
      } else if (allUsers.length > 0) {
        setSelectedUser(allUsers[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load team members');
      setLoading(false);
    }
  };

  const fetchPerformance = async (userId) => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const response = await dashboardService.getSalesPerformance(userId);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance metrics');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser?.id) {
      fetchPerformance(selectedUser.id);
    }
  }, [selectedUser]);

  const handleRefresh = () => {
    if (selectedUser?.id) {
      fetchPerformance(selectedUser.id);
    }
  };

  const metrics = performanceData?.metrics || {
    totalProposals: 0,
    proposalsWon: 0,
    winRate: 0,
    totalDealValue: 0,
    averageDealValue: 0,
    openProposals: 0,
    lostProposals: 0,
    onHoldProposals: 0
  };

  const kpis = [
    { label: 'Total Proposals', value: metrics.totalProposals, color: 'text-blue-600' },
    { label: 'Proposals Won', value: metrics.proposalsWon, color: 'text-emerald-600' },
    { label: 'Win Rate (%)', value: `${metrics.winRate}%`, color: 'text-indigo-600' },
    { label: 'Total Deal Value', value: `$${(metrics.totalDealValue || 0).toLocaleString()}`, color: 'text-blue-700' },
    { label: 'Average Deal', value: `$${(metrics.averageDealValue || 0).toLocaleString()}`, color: 'text-slate-700' },
    { label: 'Open', value: metrics.openProposals, color: 'text-amber-600' },
    { label: 'Lost', value: metrics.lostProposals, color: 'text-rose-600' },
    { label: 'On Hold', value: metrics.onHoldProposals, color: 'text-slate-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Employees — Sales Performance</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-700">Salespeople</h2>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedUser?.id === user.id
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium text-sm ${selectedUser?.id === user.id ? 'text-blue-700' : 'text-slate-900'}`}>{user.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {user.role_name || (user.roles && user.roles[0]?.name) || user.role || 'Team Member'}
                    </p>
                  </div>
                  {/* Mock proposal count for sidebar as requested in UI screenshot */}
                  <span className="text-xs text-slate-400">? proposals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* User Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedUser?.full_name || 'No Member Selected'}</h2>
                <div className="flex items-center text-slate-500 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{selectedUser?.email || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Month:</span>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Months">All Months</SelectItem>
                      <SelectItem value="Jan">January</SelectItem>
                      <SelectItem value="Feb">February</SelectItem>
                      <SelectItem value="Mar">March</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Export CSV (this person)</Button>
                <Button variant="outline" size="sm">Export CSV (all)</Button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 text-center">
                  <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Proposals Table */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Proposals</h3>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">TITLE</TableHead>
                      <TableHead className="font-bold text-slate-700">CUSTOMER</TableHead>
                      <TableHead className="font-bold text-slate-700">TYPE</TableHead>
                      <TableHead className="font-bold text-slate-700">STATUS</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">DEAL VALUE</TableHead>
                      <TableHead className="font-bold text-slate-700">UPDATED DATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData?.proposals && performanceData.proposals.length > 0 ? (
                      performanceData.proposals.map((prop, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{prop.opportunity_name || prop.title}</TableCell>
                          <TableCell>{prop.client_name || prop.customer}</TableCell>
                          <TableCell className="text-xs text-slate-500 uppercase">{prop.type || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${prop.status?.toLowerCase() === 'won' ? 'bg-emerald-100 text-emerald-700' :
                              prop.status?.toLowerCase() === 'lost' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                              {prop.status || 'Open'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(prop.amount || prop.deal_value || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {prop.updated_at ? new Date(prop.updated_at).toISOString().split('T')[0] : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          No proposals found for this member
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OppsDashboard;
