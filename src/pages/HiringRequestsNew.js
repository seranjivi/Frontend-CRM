import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import HiringRequestStatusKPI from '../components/HiringRequestStatusKPI';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Edit2, Trash2, User, Calendar, DollarSign, Clock, Briefcase } from 'lucide-react';

const HiringRequests = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hireSource, setHireSource] = useState('market');
  const [activeFilters, setActiveFilters] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    numberOfResources: '',
    jobTitle: '',
    jobDescription: '',
    skillSet: [],
    resourceType: '',
    resourceCost: '',
    resourceDuration: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    status: 'Draft',
    priority: 'Medium',
    benchResources: [],
    availabilityFromDate: '',
    allocationDuration: ''
  });

  const [hiringRequests] = useState([
    {
      id: 1,
      projectName: 'E-Commerce Platform',
      numberOfResources: 2,
      jobTitle: 'Senior React Developer',
      status: 'Open',
      priority: 'High',
      hireSource: 'Market',
      requestOwner: 'John Doe',
      assignedTo: 'HR Team',
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      projectName: 'Mobile Banking App',
      numberOfResources: 1,
      jobTitle: 'UI/UX Designer',
      status: 'Interviewing',
      priority: 'Medium',
      hireSource: 'Bench Resource',
      requestOwner: 'Jane Smith',
      assignedTo: 'Delivery Manager',
      createdDate: '2024-01-14'
    }
  ]);

  const columns = [
    { key: 'projectName', header: 'Project Name', label: 'Project Name' },
    { key: 'numberOfResources', header: 'Resources', label: 'Resources' },
    { key: 'jobTitle', header: 'Job Title', label: 'Job Title' },
    { key: 'status', header: 'Status', label: 'Status' },
    { key: 'priority', header: 'Priority', label: 'Priority' },
    { key: 'hireSource', header: 'Hire Source', label: 'Hire Source' },
    { key: 'requestOwner', header: 'Request Owner', label: 'Request Owner' },
    { key: 'assignedTo', header: 'Assigned To', label: 'Assigned To' },
    { key: 'createdDate', header: 'Created Date', label: 'Created Date' }
  ];

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Open': 'bg-blue-100 text-blue-800',
    'Interviewing': 'bg-yellow-100 text-yellow-800',
    'Offered': 'bg-purple-100 text-purple-800',
    'Filled': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-orange-100 text-orange-800',
    'High': 'bg-red-100 text-red-800',
    'Critical': 'bg-red-600 text-white'
  };

  const handleHireSourceChange = (value) => {
    setHireSource(value);
    // Clear form fields when switching hire source
    setFormData({
      ...formData,
      jobTitle: '',
      jobDescription: '',
      skillSet: [],
      resourceType: '',
      resourceCost: '',
      benchResources: [],
      availabilityFromDate: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { hireSource, ...formData });
    setShowCreateForm(false);
  };

  const getStatusBadge = (status) => (
    <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );

  const getPriorityBadge = (priority) => (
    <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>
      {priority}
    </Badge>
  );

  const handleStatusFilter = (column, values) => {
    if (values.length === 0) {
      setActiveFilters(activeFilters.filter(f => f.column !== column));
    } else {
      const existingFilter = activeFilters.find(f => f.column === column);
      if (existingFilter) {
        setActiveFilters(activeFilters.map(f => 
          f.column === column ? { ...f, values } : f
        ));
      } else {
        setActiveFilters([...activeFilters, { column, values }]);
      }
    }
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 font-['Manrope']">Create Hiring Request</h2>
            <p className="text-sm text-slate-600">Fill in the details below to create a new hiring request.</p>
          </div>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hire Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Hire Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={hireSource} onValueChange={handleHireSourceChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="market" id="market" />
                  <Label htmlFor="market">Market (External Hiring)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bench" id="bench" />
                  <Label htmlFor="bench">Bench Resource (Internal Allocation)</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-slate-500 mt-2">
                {hireSource === 'market' 
                  ? 'External hiring from the job market. Job posting and recruitment process required.'
                  : 'Internal allocation from available bench resources. No external recruitment needed.'
                }
              </p>
            </CardContent>
          </Card>

          {/* Common Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Select value={formData.projectName} onValueChange={(value) => setFormData({...formData, projectName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-Commerce Platform</SelectItem>
                      <SelectItem value="banking">Mobile Banking App</SelectItem>
                      <SelectItem value="crm">CRM System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numberOfResources">Number of Resources</Label>
                  <Input
                    id="numberOfResources"
                    type="number"
                    value={formData.numberOfResources}
                    onChange={(e) => setFormData({...formData, numberOfResources: e.target.value})}
                    placeholder="Enter number of resources"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market-Specific Fields */}
          {hireSource === 'market' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                      placeholder="Enter detailed job description"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resourceType">Resource Type</Label>
                      <Select value={formData.resourceType} onValueChange={(value) => setFormData({...formData, resourceType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="contract">Contract Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resourceCost">Resource Cost</Label>
                      <Input
                        id="resourceCost"
                        value={formData.resourceCost}
                        onChange={(e) => setFormData({...formData, resourceCost: e.target.value})}
                        placeholder="$0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Duration & Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="resourceDuration">Resource Duration</Label>
                      <Select value={formData.resourceDuration} onValueChange={(value) => setFormData({...formData, resourceDuration: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="phase">Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Bench-Specific Fields */}
          {hireSource === 'bench' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Resource Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bench Resource Selection</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select available resources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john-dev">John Developer - React</SelectItem>
                        <SelectItem value="sarah-ui">Sarah Designer - UI/UX</SelectItem>
                        <SelectItem value="mike-be">Mike Backend - Node.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="availabilityFromDate">Availability From Date</Label>
                      <Input
                        id="availabilityFromDate"
                        type="date"
                        value={formData.availabilityFromDate}
                        onChange={(e) => setFormData({...formData, availabilityFromDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="allocationDuration">Allocation Duration</Label>
                      <Select value={formData.allocationDuration} onValueChange={(value) => setFormData({...formData, allocationDuration: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="phase">Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Assignment & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Assignment & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr-team">HR Team</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="delivery-manager">Delivery Manager</SelectItem>
                      <SelectItem value="resource-manager">Resource Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offered">Offered</SelectItem>
                      <SelectItem value="Filled">Filled</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Hiring Request
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 font-['Manrope']">Hiring Requests</h2>
          <p className="text-sm text-slate-600">Manage project-based hiring requirements.</p>
        </div>
        <Button className="h-9" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <HiringRequestStatusKPI 
        hiringRequests={hiringRequests}
        activeFilters={activeFilters}
        onStatusFilter={handleStatusFilter}
      />

      <DataTable
        data={hiringRequests}
        columns={columns}
        onEdit={(item) => console.log('Edit hiring request:', item)}
        onDelete={(item) => console.log('Delete hiring request:', item)}
        testId="hiring-requests-table"
        customCellRenderers={{
          status: (value) => getStatusBadge(value),
          priority: (value) => getPriorityBadge(value)
        }}
        activeFilters={activeFilters}
        onFilterChange={handleStatusFilter}
      />
    </div>
  );
};

export default HiringRequests;
