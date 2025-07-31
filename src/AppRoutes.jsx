import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import SummaryDashboard from './components/SummaryDashboard'; // Add this import

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }>
        <Route index element={<SummaryDashboard />} />
        <Route path="add-job" element={<JobForm />} />
        <Route path="jobs" element={<JobList />} />
      </Route>
      
      <Route path="*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;