import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-['Manrope']">My Profile</h1>
        <p className="text-slate-600 mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-600">Full Name</p>
            <p className="text-lg font-medium text-slate-900">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Email</p>
            <p className="text-lg font-medium text-slate-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Role</p>
            <p className="text-lg font-medium text-slate-900">{user?.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;