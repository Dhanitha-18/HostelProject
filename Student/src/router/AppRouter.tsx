import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/Login/Login';
import { Overview } from '../pages/Overview/Overview';
import { ApplicationForm } from '../pages/ApplicationForm/ApplicationForm';
import { Facilities } from '../pages/Facilities/Facilities';
import { Payment } from '../pages/Payment/Payment';
import { Circulars } from '../pages/Circulars/Circulars';
import { Mess } from '../pages/Mess/Mess';
import { Complaints } from '../pages/Complaints/Complaints';
import { SocialConnect } from '../pages/SocialConnect/SocialConnect';
import { Attendance } from '../pages/Attendance/Attendance';
import { LeaveApplication } from '../pages/LeaveApplication/LeaveApplication';
import { PortalGateKeeper } from '../components/layout/PortalGateKeeper';
import { Profile } from '../pages/Profile/Profile';
import { Notifications } from '../pages/Notifications/Notifications';
import { Feedback } from '../pages/Feedback/Feedback';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Main Website Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Overview />} />
        <Route path="apply" element={<ApplicationForm />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="payment" element={<Payment />} />
        <Route path="circulars" element={<Circulars />} />
        <Route path="mess" element={<Mess />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="social-connect" element={<SocialConnect />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave-application" element={<LeaveApplication />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="feedback" element={<Feedback />} />
        {/* Redirect unknown routes to Overview */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
