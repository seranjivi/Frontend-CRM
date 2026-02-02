import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Utils } from 'recharts';
import { Users, Target, DollarSign, FolderOpen, Filter, Calendar, ChevronDown } from 'lucide-react';
import opportunityService from '../services/opportunityService';
import api from '../utils/api';

const Dashboard = () => {
  // State for filters
  const [filters, setFilters] = useState({
    timeRange: 'all',
    region: 'all',
    user: 'all'
  });

  // KPI data
  const [kpiData, setKpiData] = useState({
    leads: { count: 0, change: 0 },
    opportunities: { value: 0, count: 0, change: 0 },
    sales: { count: 0, change: 0 },
    projects: { count: 0, change: 0 }
  });

  const [funnelData, setFunnelData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use Promise.allSettled to run requests in parallel and handle failures independently
        const [opportunitiesResult, leadsResult] = await Promise.allSettled([
          opportunityService.getOpportunities(),
          api.get('/leads')
        ]);

        // Process Opportunities
        let opportunities = [];
        if (opportunitiesResult.status === 'fulfilled') {
          opportunities = opportunitiesResult.value.data || [];
        } else {
          console.error('Error fetching opportunities:', opportunitiesResult.reason);
        }

        // Process Leads
        let leadsData = [];
        if (leadsResult.status === 'fulfilled') {
          const response = leadsResult.value;
          if (response.data && Array.isArray(response.data)) {
            leadsData = response.data;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            leadsData = response.data.data;
          } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
            // Corrected access path if needed, but usually response.data is the body
            leadsData = response.data.data;
          }
        } else {
          console.error('Error fetching leads:', leadsResult.reason);
        }

        // Calculate counts for specified pipeline stages
        const stageCounts = {
          'Proposal Work-in-Progress': 0,
          'Proposal Review': 0,
          'Price Negotiation': 0,
          'Won': 0,
          'Lost': 0
        };

        opportunities.forEach(opp => {
          const status = opp.pipeline_status || opp.status; // Fallback to status if pipeline_status is missing
          if (stageCounts.hasOwnProperty(status)) {
            stageCounts[status]++;
          }
        });

        const newFunnelData = [
          { name: 'Proposal Work-in-Progress', value: stageCounts['Proposal Work-in-Progress'], color: '#3b82f6' }, // Blue
          { name: 'Proposal Review', value: stageCounts['Proposal Review'], color: '#8b5cf6' }, // Purple
          { name: 'Price Negotiation', value: stageCounts['Price Negotiation'], color: '#f59e0b' }, // Orange
          { name: 'Won', value: stageCounts['Won'], color: '#10b981' }, // Green
          { name: 'Lost', value: stageCounts['Lost'], color: '#ef4444' } // Red
        ];

        setFunnelData(newFunnelData);

        // Calculate counts for lead sources (Chart Data) - using Opportunities as per previous logic (or could switch to leads if requested, but staying consistent)
        const sourceCounts = {};
        const leadSources = [
          'Advertisement', 'Cold Call', 'Employee Referral', 'External Referral',
          'Online Store', 'Partner Organization', 'Partner Individual', 'Public Relations',
          'Sales Email Alias', 'Seminar Partner', 'Internal Seminar', 'Trade Show',
          'Web Download', 'Web Research', 'Chat', 'Portal', 'Others'
        ];

        leadSources.forEach(source => sourceCounts[source] = 0);

        // Note: We are using 'opportunities' for Source Distribution as it was before.
        // If the user meant "Leads Source Distribution" (from Leads table), that would be a different change.
        // Given the request was "Source Distribution widget... remove those...", it implies the existing widget.
        opportunities.forEach(opp => {
          const source = opp.lead_source || 'Others';
          const matchedSource = leadSources.find(s => s.toLowerCase() === source.toLowerCase()) || 'Others';
          if (sourceCounts.hasOwnProperty(matchedSource)) {
            sourceCounts[matchedSource]++;
          } else {
            sourceCounts['Others']++;
          }
        });

        const sourceColors = {
          'Advertisement': '#3b82f6',
          'Cold Call': '#10b981',
          'Employee Referral': '#f59e0b',
          'External Referral': '#8b5cf6',
          'Online Store': '#ec4899',
          'Partner Organization': '#06b6d4',
          'Partner Individual': '#0ea5e9',
          'Public Relations': '#f97316',
          'Sales Email Alias': '#6366f1',
          'Seminar Partner': '#14b8a6',
          'Internal Seminar': '#2dd4bf',
          'Trade Show': '#f43f5e',
          'Web Download': '#ef4444',
          'Web Research': '#a855f7',
          'Chat': '#84cc16',
          'Portal': '#22c55e',
          'Others': '#64748b'
        };

        const newSourceData = leadSources.map(source => ({
          name: source,
          value: sourceCounts[source],
          color: sourceColors[source] || '#cbd5e1'
        })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

        setSourceData(newSourceData);


        // KPI Calculations using LEADS data
        const totalLeadsCount = leadsData.length;
        const totalLeadsValue = leadsData.reduce((sum, lead) => {
          // Handle different casing or missing values
          const val = parseFloat(lead.estimated_deal_value || lead.amount || 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        setKpiData(prev => ({
          ...prev,
          leads: { count: totalLeadsCount, change: 0 },
          opportunities: { value: totalLeadsValue, count: totalLeadsCount, change: 0 }, // Using Lead Value for Opportunities KPI as requested
          sales: { count: stageCounts['Won'], change: 5.7 },
          projects: { count: 36, change: 2.3 } // Keep mock
        }));

      } catch (error) {
        // This catch block will now only run if something unexpected happens OUTSIDE the API calls execution (like logic error)
        console.error('Error in dashboard data processing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
      notation: 'compact'
    }).format(value);
  };

  const KpiCard = ({ title, value, change, icon: Icon, isCurrency = false }) => (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold mb-1">
              {isCurrency ? formatCurrency(value) : value.toLocaleString()}
            </h3>
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {change >= 0 ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h4a1 1 0 011 1v1h1a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'} from last period
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your sales and projects</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Last 30 days
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 block mb-1">Time Range</label>
              <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-gray-500 block mb-1">Region</label>
              <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="apac">APAC</SelectItem>
                  <SelectItem value="latam">LATAM</SelectItem>
                  <SelectItem value="mea">Middle East & Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-gray-500 block mb-1">Users</label>
              <Select value={filters.user} onValueChange={(value) => handleFilterChange('user', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Leads"
          value={kpiData.leads.count}
          change={kpiData.leads.change}
          icon={Users}
        />
        <KpiCard
          title="Opportunities"
          value={kpiData.opportunities.value}
          change={kpiData.opportunities.change}
          icon={Target}
          isCurrency
        />
        <KpiCard
          title="Sales"
          value={kpiData.sales.count}
          change={kpiData.sales.change}
          icon={DollarSign}
        />
        <KpiCard
          title="Projects"
          value={kpiData.projects.count}
          change={kpiData.projects.change}
          icon={FolderOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 p-4">
              {funnelData.map((stage, index) => {
                const widthPercentage = (stage.value / funnelData[0].value) * 100;
                const conversionRate = index > 0
                  ? Math.round((stage.value / funnelData[index - 1].value) * 100)
                  : 100;

                return (
                  <div key={stage.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">{stage.value}</span>
                        {index > 0 && (
                          <span className="text-xs text-gray-500">
                            ({conversionRate}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="h-8 rounded-md transition-all duration-500 ease-in-out"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: stage.color,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="h-full flex items-center justify-end pr-2">
                        {index > 0 && (
                          <span className="text-xs font-medium text-white">
                            {conversionRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Count']}
                    labelFormatter={(label) => `Source: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
