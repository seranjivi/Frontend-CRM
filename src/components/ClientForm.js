import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';
import RegionDropdown from './RegionDropdown';
import CountryDropdown from './CountryDropdown';
import { Plus, Trash2, Building2, X, ChevronDown } from 'lucide-react';
import { getUsers } from '../services/userService';
import clientService from '../services/clientService';
import masterDataService from '../services/masterDataService';

// Common country codes with their respective dial codes
const countryCodes = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'GB', name: 'UK', dialCode: '+44' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'AE', name: 'UAE', dialCode: '+971' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
];

const ClientForm = ({ client, onClose, onSuccess, viewMode = false }) => {
  const [formData, setFormData] = useState(viewMode ? client : {
    client_name: '',
    contact_email: '',
    website: '',
    industry: '',
    customer_type: 'Partner',
    gst_tax_id: '',
    addresses: [{ address_line1: '', country: '', region: '', is_primary: true }],
    account_owner: '',
    client_status: 'Active',
    notes: '',
    contact_persons: [{
      name: '',
      email: '',
      phone: '',
      countryCode: '+1', 
      designation: '',
      is_primary: false
    }]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCountryIds, setSelectedCountryIds] = useState({});
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [countries, setCountries] = useState([]);

  // Helper function to parse phone number into country code and number
  const parsePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return { countryCode: '+1', number: '' };
    
    // Handle cases where the number might be in format "+971-678899" or "+971678899"
    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    
    // Find the country code that matches the start of the phone number
    const countryCodeMatch = countryCodes.find(({ dialCode }) => 
      cleanNumber.startsWith(dialCode)
    );

    if (countryCodeMatch) {
      return {
        countryCode: countryCodeMatch.dialCode,
        number: cleanNumber.substring(countryCodeMatch.dialCode.length)
      };
    }
    
    // If no matching country code found, default to +1
    return { 
      countryCode: '+1', 
      number: cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber 
    };
  };

  // Fetch users and regions on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch users
        const usersResponse = await getUsers();
        const usersData = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
        setUsers(usersData);

        // Fetch regions with countries
        const response = await masterDataService.getRegionsWithCountries();
        console.log('Regions data response:', response);
        const regionsData = response?.data || [];
        setRegions(regionsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load required data');
        setUsers([]);
        setRegions([]);
      }
    };

    fetchInitialData();
  }, [viewMode]);

  // Debug effect to log formData.industry and client prop
  useEffect(() => {
    console.log('formData.industry:', formData.industry);
    console.log('client prop:', client);
  }, [formData.industry, client]);

  useEffect(() => {
    if (client && users.length > 0) {
      console.log('Client data in form:', client);
      
      // Find the user ID that matches the account_owner name if account_owner is a string
      const getAccountOwnerId = () => {
        // If we already have a numeric ID, return it
        if (typeof client.account_owner === 'number') {
          return client.account_owner;
        }
        
        // If it's a string and we have users loaded, find the matching user
        if (typeof client.account_owner === 'string') {
          const ownerUser = users.find(u => 
            u.name === client.account_owner || 
            u.username === client.account_owner ||
            u.email === client.account_owner ||
            u.full_name === client.account_owner
          );
          return ownerUser?.id || client.account_owner;
        }
        
        return client.account_owner || '';
      };

      // Process contacts from either client.contacts or client.contact_persons
      const processContacts = () => {
        const contacts = client.contacts || client.contact_persons || [];
        console.log('Processing contacts:', contacts);
        
        if (contacts.length > 0) {
          return contacts.map(contact => {
            const { countryCode, number } = parsePhoneNumber(contact.phone || '');
            return {
              ...contact,
              name: contact.name || '',
              email: contact.email || '',
              phone: number || '',
              countryCode: countryCode || '+1',
              designation: contact.designation || contact.position || '',
              is_primary: contact.is_primary || false
            };
          });
        }
        
        return [{
          name: '',
          email: '',
          phone: '',
          countryCode: '+1',
          designation: '',
          is_primary: false
        }];
      };

      const initialData = {
        client_name: client.client_name || '',
        contact_email: client.email || client.contact_email || '',
        website: client.website || '',
        industry: client.industry || '',
        customer_type: client.customer_type || 'Partner',
        gst_tax_id: client.tax_id || client.gst_tax_id || '',
        addresses: client.addresses && client.addresses.length > 0
          ? client.addresses.map(addr => ({
              ...addr,
              region: addr.region_state || addr.region || ''
            }))
          : [{ address_line1: '', country: '', region: '', is_primary: true }],
        account_owner: getAccountOwnerId(),
        client_status: client.status === 'active' ? 'Active' : (client.client_status || 'Active'),
        notes: client.notes || '',
        contact_persons: processContacts()
      };
      console.log('Initial data:', initialData);

      // Set the selected country IDs from the addresses
      const countryIds = {};
      if (client.addresses) {
        client.addresses.forEach((addr, idx) => {
          if (addr.country_id) {
            countryIds[idx] = addr.country_id;
          } else if (addr.country) {
            countryIds[idx] = null;
          }
        });
      }

      setSelectedCountryIds(countryIds);
      setFormData(initialData);
    } else if (!client) {
      // For new client, initialize with one empty address and contact
      setFormData(prev => ({
        ...prev,
        addresses: [{ address_line1: '', country: '', region: '', is_primary: true }],
        contact_persons: [{
          name: '',
          email: '',
          phone: '',
          countryCode: '+1',
          designation: '',
          is_primary: false
        }]
      }));
      setSelectedCountryIds({ 0: '' });
    }
  }, [client, users]); // Add users to dependencies

  const handleChange = (e) => {
    if (viewMode) return;

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContactChange = (index, field, value) => {
    if (viewMode) return;

    const updatedContacts = [...formData.contact_persons];

    if (field === 'is_primary') {
      // If setting as primary, uncheck all others
      if (value) {
        updatedContacts.forEach((contact, i) => {
          contact.is_primary = i === index;
        });
      } else {
        updatedContacts[index].is_primary = false;
      }
    } else if (field === 'phone') {
      // Only allow digits, max 15 digits
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 15) {
        updatedContacts[index][field] = cleaned;
      }
    } else if (field === 'countryCode') {
      // Update the country code
      updatedContacts[index].countryCode = value;
      // If there's a phone number, ensure it's formatted with the new country code
      if (updatedContacts[index].phone) {
        // Remove any existing country code from the phone number
        const phoneWithoutCode = updatedContacts[index].phone.replace(/^\+?\d+/, '');
        updatedContacts[index].phone = phoneWithoutCode;
      }
    } else {
      updatedContacts[index][field] = value;
    }

    setFormData(prev => ({ ...prev, contact_persons: updatedContacts }));
    
    // Clear any phone-related errors when the field changes
    if (field === 'phone' || field === 'countryCode') {
      setErrors(prev => ({
        ...prev,
        [`contact_persons[${index}].phone`]: undefined
      }));
    }
  };

  const handleRegionChange = async (index, regionId) => {
    console.log('handleRegionChange called with regionId:', regionId);
    const region = regions.find(r => r.id === Number(regionId) || r.name === regionId);

    if (region) {
      console.log('Selected region found:', region);
      const updatedAddresses = [...formData.addresses];
      updatedAddresses[index].region = region.name;
      setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
      setSelectedRegionId(region.id);

      // Clear country when region changes
      handleAddressChange(index, 'country', '');

      try {
        console.log('Fetching countries for region ID:', region.id);
        const countriesData = await masterDataService.getCountriesByRegionId(region.id);
        console.log('Countries data received:', countriesData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error in handleRegionChange:', error);
        toast.error('Failed to load countries');
        setCountries([]);
      }
    } else {
      console.warn('No region found for ID:', regionId);
    }
  };

  const handleCountryChange = (index, countryName, countryId) => {
    console.log('Country selected:', countryName);
    const selectedCountry = countries.find(c => c.name === countryName);
    if (selectedCountry) {
      console.log('Selected country:', selectedCountry);
      // Update the selected country ID
      setSelectedCountryIds(prev => ({
        ...prev,
        [index]: countryId
      }));

      // Update the form data with the country name
      handleAddressChange(index, 'country', countryName);
    }
  };

  const handleAddressChange = (index, field, value) => {
    if (viewMode) return;

    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index][field] = value;
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
  };

  const setPrimaryAddress = (index) => {
    if (!formData.addresses[index].is_primary) {
      const updatedAddresses = formData.addresses.map((addr, i) => ({
        ...addr,
        is_primary: i === index
      }));
      setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    }
  };

  const addAddress = () => {
    if (viewMode) return;

    const newIndex = formData.addresses.length;
    setFormData(prev => {
      const newAddress = {
        address_line1: '',
        country: '',
        region: '',
        is_primary: prev.addresses.length === 0 // First address is primary by default
      };
      return {
        ...prev,
        addresses: [...prev.addresses, newAddress]
      };
    });

    // Initialize the selected country ID for the new address
    setSelectedCountryIds(prev => ({
      ...prev,
      [newIndex]: ''
    }));
  };

  const removeAddress = (index) => {
    if (viewMode || formData.addresses.length <= 1) return;

    const updatedAddresses = [...formData.addresses];
    const wasPrimary = updatedAddresses[index].is_primary;
    updatedAddresses.splice(index, 1);

    // If we removed the primary address, make the first address primary
    if (wasPrimary && updatedAddresses.length > 0) {
      updatedAddresses[0].is_primary = true;
    }

    setFormData(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));

    // Remove the selected country ID for this index
    const newSelectedCountryIds = { ...selectedCountryIds };
    delete newSelectedCountryIds[index];
    setSelectedCountryIds(newSelectedCountryIds);
  };

  const addContactPerson = () => {
    if (viewMode) return;

    setFormData(prev => ({
      ...prev,
      contact_persons: [
        ...prev.contact_persons,
        { name: '', email: '', phone: '', countryCode: '+1', designation: '', is_primary: false }
      ]
    }));
  };
  
  // Alias for addContactPerson to handle any existing references
  const addContact = addContactPerson;

  const removeContact = (index) => {
    if (viewMode || !formData.contact_persons || formData.contact_persons.length <= 1) return;

    const updatedContacts = formData.contact_persons.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, contact_persons: updatedContacts }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email';
    }

    if (!formData.customer_type) {
      newErrors.customer_type = 'Customer type is required';
    }

    // Validate addresses - at least one address is required
    if (formData.addresses.length === 0) {
      newErrors.addresses = 'At least one address is required';
    }

    if (!formData.account_owner) {
      newErrors.account_owner = 'Account owner is required';
    }

    if (!formData.client_status) {
      newErrors.client_status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (viewMode) {
      onClose();
      return;
    }

    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Transform form data to match the required payload structure
      const payload = {
        client_name: formData.client_name,
        email: formData.contact_email, // Map contact_email to email
        website: formData.website,
        industry: formData.industry,
        customer_type: formData.customer_type,
        tax_id: formData.gst_tax_id, // Map gst_tax_id to tax_id
        status: formData.client_status?.toLowerCase() === 'active' ? 'active' : 'inactive',
        notes: formData.notes,
        user_id: formData.account_owner,
        // Process contacts - filter out empty ones and map to required structure
        contacts: formData.contact_persons
          .filter(contact => contact.name || contact.email || contact.phone)
          .map(contact => ({
            name: contact.name,
            email: contact.email,
            phone: contact.countryCode + contact.phone,
            designation: contact.designation,
            is_primary: contact.is_primary || false
          })),
        // Process addresses - filter out empty ones and map to required structure
        addresses: formData.addresses
          .filter(addr => addr.address_line1 || addr.country || addr.region)
          .map(addr => ({
            address_line1: addr.address_line1,
            address_line2: addr.address_line2 || '',
            city: addr.city || '',
            region_state: addr.region || '', // Map region to region_state
            country: addr.country,
            postal_code: addr.postal_code || '',
            is_primary: addr.is_primary || false
          }))
      };

      if (client) {
        await clientService.updateClient(client.id, payload);
        toast.success('Client updated successfully');
      } else {
        await clientService.createClient(payload);
        toast.success('Client created successfully');
      }

      // Call onSuccess if provided, otherwise just close the form
      if (onSuccess) {
        onSuccess();
      } else {
        onClose(true);
      }
    } catch (error) {
      console.error('Client form error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#0A2A43]" />
            <h2 className="text-2xl font-semibold text-[#0A2A43]">
              {viewMode ? 'VIEW CLIENT DETAILS' : client ? 'EDIT CLIENT' : 'NEW CLIENT'}
            </h2>
          </div>
        </div>
        {/* Section 1 - Basic Client Details */}
        <div>
          <h3 className="text-lg font-medium text-[#0A2A43] mb-4">Basic Client Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name <span className="text-red-500">*</span></Label>
              <Input
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Enter the client name"
                className={`${errors.client_name ? 'border-red-500' : ''} ${viewMode ? 'bg-gray-100' : ''}`}
                data-testid="client-name-input"
                disabled={viewMode}
              />
              {errors.client_name && (
                <p className="text-red-500 text-sm mt-1">{errors.client_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="client@example.com"
                className={`${errors.contact_email ? 'border-red-500' : ''} ${viewMode ? 'bg-gray-100' : ''}`}
                data-testid="client-email-input"
                disabled={viewMode}
              />
              {errors.contact_email && (
                <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={viewMode ? 'bg-gray-100' : ''}
                data-testid="client-website-input"
                disabled={viewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                key={`industry-${formData.industry || 'empty'}`}
                defaultValue={formData.industry || ''}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, industry: value }));
                }}
                data-testid="client-industry-select"
                disabled={viewMode}
              >
                <SelectTrigger className={!formData.industry ? 'text-muted-foreground' : ''}>
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Hospitality">Hospitality</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_type">Customer Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, customer_type: value }));
                  if (errors.customer_type) {
                    setErrors(prev => ({ ...prev, customer_type: '' }));
                  }
                }}
                data-testid="client-customer-type-select"
                disabled={viewMode}
              >
                <SelectTrigger className={errors.customer_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select customer type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Customer">Direct Customer</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Reseller">Reseller</SelectItem>
                </SelectContent>
              </Select>

              {errors.customer_type && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_tax_id">GST / Tax ID</Label>
              <Input
                id="gst_tax_id"
                name="gst_tax_id"
                value={formData.gst_tax_id}
                onChange={handleChange}
                placeholder="e.g. 27AAAPL1234C1ZV"
                className={viewMode ? 'bg-gray-100' : ''}
                data-testid="client-gst-input"
                disabled={viewMode}
              />
            </div>
          </div>
        </div>

        {/* Section 2 - Contact Persons */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-[#0A2A43]">Contact Persons</h3>
            {!viewMode && (
              <Button
                type="button"
                onClick={addContact}
                className="flex items-center gap-2 h-10 bg-[#0A2A43] hover:bg-[#0A2A43]/90 text-white"
                data-testid="add-contact-button"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {formData.contact_persons.map((contact, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`contact_name_${index}`}>Name</Label>
                  <Input
                    id={`contact_name_${index}`}
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    placeholder="Contact name"
                    data-testid={`contact-name-${index}`}
                    className={`w-full h-10 ${viewMode ? 'bg-gray-100' : ''}`}
                    disabled={viewMode}
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`contact_email_${index}`}>Email</Label>
                  <Input
                    id={`contact_email_${index}`}
                    type="email"
                    value={contact.email}
                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                    placeholder="contact@example.com"
                    data-testid={`contact-email-${index}`}
                    className={`w-full h-10 ${viewMode ? 'bg-gray-100' : ''}`}
                    disabled={viewMode}
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`contact_phone_${index}`}>Phone</Label>
                  <div className="flex gap-1">
                    <div className="relative">
                      <Select
                        value={contact.countryCode || '+1'}
                        onValueChange={(value) => handleContactChange(index, 'countryCode', value)}
                        disabled={viewMode}
                      >
                        <SelectTrigger className={`h-10 w-[60px] ${viewMode ? 'bg-gray-100' : ''} px-1`}>
                          <SelectValue placeholder="+1" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.dialCode}>
                              {country.dialCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        id={`contact_phone_${index}`}
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="123 456 7890"
                        data-testid={`contact-phone-${index}`}
                        className={`h-10 w-full ${viewMode ? 'bg-gray-100' : ''} -ml-px`}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`contact_designation_${index}`}>Designation</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id={`contact_designation_${index}`}
                        value={contact.designation}
                        onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                        placeholder="e.g. Manager, Director"
                        data-testid={`contact-designation-${index}`}
                        className={`w-full h-10 ${viewMode ? 'bg-gray-100' : ''}`}
                        disabled={viewMode}
                      />
                    </div>
                    {formData.contact_persons.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeContact(index)}
                        className="text-red-500 hover:text-red-700 h-10 w-10 flex-shrink-0"
                        data-testid={`remove-contact-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Removed the standalone Add Contact button as it's now inline */}
          </div>
        </div>

        {/* Section 3 - Address Details */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-[#0A2A43]">Address Details</h3>
            {!viewMode && (
              <Button
                type="button"
                onClick={addAddress}
                className="flex items-center gap-2 bg-[#0A2A43] hover:bg-[#0A2A43]/90 text-white"
                data-testid="add-address-button"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {formData.addresses.map((address, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-4 py-4"
              >
                <div className="md:col-span-2">
                  <Label htmlFor={`address_line1_${index}`}>
                    Address Line 1 {address.is_primary && <span className="text-blue-600 ml-2">(Primary)</span>}
                  </Label>
                  <Textarea
                    id={`address_line1_${index}`}
                    value={address.address_line1}
                    onChange={(e) => handleAddressChange(index, 'address_line1', e.target.value)}
                    rows={3}
                    placeholder="123 Main St, Suite 100, City, State 12345"
                    data-testid={`address-${index}`}
                    className={`${errors[`address_${index}`] ? 'border-red-500' : ''} ${viewMode ? 'bg-gray-100' : ''}`}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`region_${index}`}>Region</Label>
                  <Select
                    value={address.region || ''}
                    onValueChange={async (value) => {
                      if (viewMode) return;
                      console.log('handleRegionChange called with regionId:', value);
                      const region = regions.find(r => r.id === Number(value) || r.name === value);

                      if (region) {
                        console.log('Selected region found:', region);
                        const updatedAddresses = [...formData.addresses];
                        updatedAddresses[index].region = region.name;
                        setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
                        setSelectedRegionId(region.id);

                        // Clear country when region changes
                        handleAddressChange(index, 'country', '');

                        try {
                          console.log('Fetching countries for region ID:', region.id);
                          const response = await masterDataService.getCountriesByRegionId(region.id);
                          console.log('API response:', response);

                          // Extract countries from response.data
                          const countriesData = response?.data || [];
                          console.log('Countries data:', countriesData);

                          // Map the data to the expected format
                          const formattedCountries = countriesData.map(country => ({
                            id: country.id,
                            name: country.name,
                            code: country.code,
                            phone_code: country.phone_code
                          }));

                          console.log('Formatted countries:', formattedCountries);
                          setCountries(formattedCountries);
                        } catch (error) {
                          console.error('Error in handleRegionChange:', error);
                          toast.error('Failed to load countries');
                          setCountries([]);
                        }
                      } else {
                        console.warn('No region found for ID:', value);
                      }
                    }}
                    disabled={viewMode}
                  >
                    <SelectTrigger className={`${errors[`region_${index}`] ? 'border-red-500' : ''} ${!address.region ? 'text-muted-foreground' : ''}`}>
                      <SelectValue placeholder="Select a region...">
                        {address.region || 'Select a region...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem
                          key={region.id}
                          value={region.id.toString()}
                        >
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`region_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`region_${index}`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`country_${index}`}>Country</Label>
                  <Select
                    value={address.country || ''}
                    onValueChange={(value) => {
                      if (viewMode) return;
                      console.log('Country selected:', value);
                      const selectedCountry = countries.find(c => c.name === value);
                      if (selectedCountry) {
                        console.log('Selected country:', selectedCountry);
                        handleAddressChange(index, 'country', selectedCountry.name);
                      }
                    }}
                    disabled={!selectedRegionId || viewMode}
                  >
                    <SelectTrigger className={`${errors[`country_${index}`] ? 'border-red-500' : ''} ${!address.country ? 'text-muted-foreground' : ''}`}>
                      <SelectValue placeholder={countries.length ? 'Select a country...' : 'Select a region first'}>
                        {address.country || (countries.length ? 'Select a country...' : 'Select a region first')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem
                            key={country.id}
                            value={country.name}
                          >
                            {country.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {selectedRegionId ? 'No countries found. Please try another region.' : 'Please select a region first'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors[`country_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`country_${index}`]}</p>
                  )}
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrimaryAddress(index)}
                    disabled={address.is_primary || viewMode}
                    className={`${address.is_primary ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50'} ${viewMode ? 'opacity-50' : ''}`}
                    data-testid={`set-primary-${index}`}
                  >
                    {address.is_primary ? 'Primary' : 'Set as Primary'}
                  </Button>
                  {formData.addresses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAddress(index)}
                      className={`text-red-500 hover:text-red-700 ${viewMode ? 'opacity-50' : ''}`}
                      data-testid={`remove-address-${index}`}
                      disabled={address.is_primary || viewMode}
                      title={viewMode ? '' : (address.is_primary ? 'Cannot remove primary address' : 'Remove address')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 - Account & Status */}
        <div>
          <h3 className="text-lg font-medium text-[#0A2A43] mb-4">Account & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_owner">Account Owner <span className="text-red-500">*</span></Label>
              <div className="relative">
                {viewMode ? (
                  <div className="relative">
                    <Input
                      type="text"
                      value={
                        // Find the user name by matching the account_owner ID with users list
                        users.find(u => String(u.id) === String(formData.account_owner))?.full_name || 
                        users.find(u => String(u.id) === String(formData.account_owner))?.name ||
                        users.find(u => String(u.id) === String(formData.account_owner))?.username ||
                        users.find(u => String(u.id) === String(formData.account_owner))?.email ||
                        formData.account_owner || ''
                      }
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                ) : (
                  <Select
                    value={formData.account_owner ? String(formData.account_owner) : ''}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        account_owner: value === 'custom' ? '' : value,
                        account_owner_name: value === 'custom' ? '' : users.find(u => String(u.id) === value)?.full_name || ''
                      }));
                      if (errors.account_owner) {
                        setErrors(prev => ({ ...prev, account_owner: '' }));
                      }
                    }}
                  >
                    <SelectTrigger className={errors.account_owner ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select account owner...">
                        {users.find(u => String(u.id) === String(formData.account_owner))?.full_name || formData.account_owner || ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                      {formData.account_owner && !users.some(u => String(u.id) === String(formData.account_owner)) && (
                        <SelectItem value={formData.account_owner}>
                          {formData.account_owner}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {errors.account_owner && (
                <p className="text-red-500 text-sm mt-1">{errors.account_owner}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_status">Status <span className="text-red-500">*</span></Label>
              <Select
                value={formData.client_status}
                onValueChange={(value) => {
                  if (viewMode) return;
                  setFormData(prev => ({ ...prev, client_status: value }));
                }}
                data-testid="client-status-select"
                disabled={viewMode}
              >
                <SelectTrigger className={errors.client_status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.client_status && (
                <p className="text-red-500 text-sm mt-1">{errors.client_status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5 - Notes / Description */}
        <div>
          <h3 className="text-lg font-medium text-[#0A2A43] mb-4">Notes / Description</h3>
          <div>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes about this client..."
              data-testid="client-notes-input"
              className={viewMode ? 'bg-gray-100' : ''}
              disabled={viewMode}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            {viewMode ? 'Close' : 'Cancel'}
          </Button>
          {!viewMode && (
            <Button
              type="submit"
              disabled={loading}
              data-testid="client-form-submit"
              className="px-6 bg-[#0A2A43] hover:bg-[#0A2A43]/90 text-white"
            >
              {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClientForm;