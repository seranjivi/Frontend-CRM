import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Building2, Target, TrendingUp, FileText, Activity, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  const fetchAnalytics = async () => {
    try {
      const params = selectedMonth !== 'all' ? { month: selectedMonth } : {};
      const response = await api.get('/dashboard/analytics', { params });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Clients',
      value: analytics?.overview?.total_clients || 0,
      icon: Building2,
      color: 'bg-[#2C6AA6]',
      testId: 'total-clients-stat'
    },
    {
      title: 'Active Leads',
      value: analytics?.leads?.active_leads || 0,
      icon: Target,
      color: 'bg-[#9B6CC9]',
      testId: 'active-leads-stat'
    },
    {
      title: 'Active Opportunities',
      value: analytics?.pipeline?.active_opportunities || 0,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      testId: 'active-opportunities-stat'
    },
    {
      title: 'Pending Tasks',
      value: analytics?.action_items?.pending || 0,
      icon: Activity,
      color: 'bg-amber-500',
      testId: 'pending-tasks-stat'
    },
    {
      title: 'Overdue Tasks',
      value: analytics?.action_items?.overdue || 0,
      icon: TrendingDown,
      color: 'bg-red-500',
      testId: 'overdue-tasks-stat'
    },
    {
      title: 'Sales Activities',
      value: analytics?.sales_activities?.total || 0,
      icon: Activity,
      color: 'bg-blue-500',
      testId: 'sales-activities-stat'
    },
    {
      title: 'Total Partners',
      value: analytics?.partners?.total_partners || 0,
      icon: Users,
      color: 'bg-purple-500',
      testId: 'partners-stat'
    },
    {
      title: 'Active SOWs',
      value: analytics?.sow_tracking?.active_sows || 0,
      icon: FileText,
      color: 'bg-cyan-500',
      testId: 'active-sows-stat'
    },
  ];

  const pipelineData = analytics?.pipeline?.opportunities_by_stage
    ? Object.entries(analytics.pipeline.opportunities_by_stage).map(([name, value]) => ({ name, value }))
    : [];

  const leadsSourceData = analytics?.leads?.leads_by_source
    ? Object.entries(analytics.leads.leads_by_source).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#2C6AA6', '#9B6CC9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-5" data-testid="dashboard-page">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-0.5">Sales performance overview</p>
        </div>
        
        {/* Month Filter */}
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-slate-500" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {getMonthOptions().map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200" data-testid={stat.testId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-['Manrope']">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue & Forecast Stats - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline space-x-1.5">
              <DollarSign className="h-4 w-4 text-[#2C6AA6]" />
              <span className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
                {(analytics?.pipeline?.total_pipeline_value || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Total estimated pipeline value</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">Forecast Amount</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline space-x-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
                {(analytics?.forecasts?.total_forecast_amount || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Total forecasted revenue</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">SOW Value</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline space-x-1.5">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
                {(analytics?.sow_tracking?.total_sow_value || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Total SOW value in execution</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">Win Probability</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline space-x-1.5">
              <TrendingUp className="h-4 w-4 text-[#9B6CC9]" />
              <span className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
                {analytics?.forecasts?.avg_win_probability || 0}%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Average forecast probability</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">Opportunities by Stage</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" fill="#2C6AA6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-500">
                No opportunity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-['Manrope']">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {leadsSourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={leadsSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: 11 }}
                  >
                    {leadsSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-500">
                No lead source data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activities Summary - Compact */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold font-['Manrope']">Activities Overview</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="text-xl font-bold text-slate-900 font-['JetBrains_Mono']">
                  {analytics?.activities?.pending_activities || 0}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Pending Activities</p>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-slate-900 font-['JetBrains_Mono']">
                  {analytics?.activities?.completed_activities || 0}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Completed Activities</p>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <Target className="h-4 w-4 text-[#2C6AA6]" />
                <span className="text-xl font-bold text-slate-900 font-['JetBrains_Mono']">
                  {analytics?.leads?.conversion_rate || 0}%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Lead Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;