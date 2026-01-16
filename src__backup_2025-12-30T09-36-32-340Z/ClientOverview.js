import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Briefcase, Users, GraduationCap, MessageSquare, Handshake, User } from 'lucide-react';

const ClientOverview = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedClients, setGroupedClients] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // Fetch all clients (not leads)
      const response = await api.get('/clients');
      const allClients = response.data || [];
      
      // Filter for Key Clients only
      const keyClients = allClients.filter(client => 
        client.client_tier === 'Key Client' || client.client_tier === 'Key'
      );
      
      setClients(keyClients);
      
      // Group by country
      const grouped = keyClients.reduce((acc, client) => {
        const country = client.country || 'Unknown';
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(client);
        return acc;
      }, {});
      
      setGroupedClients(grouped);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'Projects': <Briefcase className="h-4 w-4" />,
      'Product Professional Services': <Users className="h-4 w-4" />,
      'Staffing': <Users className="h-4 w-4" />,
      'Training': <GraduationCap className="h-4 w-4" />,
      'Consulting': <MessageSquare className="h-4 w-4" />,
      'Partners': <Handshake className="h-4 w-4" />
    };
    return icons[serviceType] || <Briefcase className="h-4 w-4" />;
  };

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'Mexico': '🇲🇽',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'United Kingdom': '🇬🇧',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Poland': '🇵🇱',
      'Singapore': '🇸🇬',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Australia': '🇦🇺',
      'South Korea': '🇰🇷',
      'Malaysia': '🇲🇾',
      'Thailand': '🇹🇭',
      'Indonesia': '🇮🇩',
      'Philippines': '🇵🇭',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Colombia': '🇨🇴',
      'Peru': '🇵🇪',
      'Venezuela': '🇻🇪',
      'United Arab Emirates': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'Israel': '🇮🇱',
      'Qatar': '🇶🇦',
      'Kuwait': '🇰🇼',
      'Oman': '🇴🇲',
      'South Africa': '🇿🇦',
      'Egypt': '🇪🇬',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'Morocco': '🇲🇦',
      'Ghana': '🇬🇭'
    };
    return flags[country] || '🌍';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 font-['Manrope']">Client Overview</h1>
        <p className="text-slate-600 mt-2">Key Clients distribution by country and service type</p>
      </div>

      {/* Service Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Service Types Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-700">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-slate-700">Product Professional Services</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-slate-700">Staffing</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-slate-700">Training</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-600" />
              <span className="text-sm text-slate-700">Consulting</span>
            </div>
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-teal-600" />
              <span className="text-sm text-slate-700">Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-slate-700">Direct Customer Count</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country-wise Client Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(groupedClients).map(([country, countryClients]) => (
          <Card key={country} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCountryFlag(country)}</span>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">{country}</CardTitle>
                    <p className="text-sm text-slate-600">{countryClients.length} clients</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {countryClients.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">Customer Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">Services</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryClients.map((client, index) => (
                      <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{client.client_name}</div>
                          {client.contact_email && (
                            <div className="text-xs text-slate-600 mt-1">{client.contact_email}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-2">
                            {client.service_type && (
                              <div className="flex items-center gap-1 text-blue-600">
                                {getServiceIcon(client.service_type)}
                                <span className="text-xs">{client.service_type}</span>
                              </div>
                            )}
                            {client.services && Array.isArray(client.services) && 
                              client.services.map((service, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-green-600">
                                  {getServiceIcon(service)}
                                  <span className="text-xs">{service}</span>
                                </div>
                              ))
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedClients).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Key Clients Found</h3>
            <p className="text-slate-600">No clients with "Key Client" tier found. Please mark clients as "Key Client" to see them here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientOverview;
