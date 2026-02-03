import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/DashboardNew';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Opportunities from './pages/Opportunities';
import SOWs from './pages/SOWs';
import Activities from './pages/Activities';
import EmployeesPerformance from './pages/EmployeesPerformance';
import Partners from './pages/Partners';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ClientOverview from './pages/ClientOverview';
import Projects from './pages/Projects';
import HiringRequests from './pages/HiringRequestsNew';
import ActionItems from './pages/ActionItems';
import SalesActivity from './pages/SalesActivity';
import Forecast from './pages/Forecast';
import UserManagement from './pages/UserManagement';
import RFPDetails from './pages/RFPDetails';
import SOWForm from './components/SOWForm';
import OpportunityManagement from './pages/opportunity-management';
import AIChatInterface from './components/ai-chat/AIChatInterface';
import ChatToggleButton from './components/ai-chat/ChatToggleButton';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Clients />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/client-overview"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClientOverview />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/partners"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Partners />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmployeesPerformance />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagement />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfp-details"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RFPDetails />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunity-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OpportunityManagement />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Leads />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Opportunities />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/action-items"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ActionItems />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-activity"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesActivity />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Forecast />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sows"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SOWs />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sow/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SOWForm readOnly />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Activities />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Projects />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/hiring-requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HiringRequests />
                    <AIChatInterface />
                    <ChatToggleButton />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;