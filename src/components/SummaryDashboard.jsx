import { useAuth } from '../context/AuthContext';

const SummaryDashboard = ({ jobs = [] }) => {
  const { currentUser } = useAuth();
  
  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  const totalEarned = safeJobs
    .filter(job => job?.status === 'paid')
    .reduce((sum, job) => sum + (job?.amount || 0), 0);
    
  const pendingAmount = safeJobs
    .filter(job => job?.status === 'pending')
    .reduce((sum, job) => sum + (job?.amount || 0), 0);
    
  const totalJobs = safeJobs.length;
  const paidJobs = safeJobs.filter(job => job?.status === 'paid').length;

  return (
    <div className="summary-dashboard">
      <div className="summary-card">
        <h3>Total Earnings</h3>
        <p className="amount">${totalEarned.toFixed(2)}</p>
      </div>
      
      <div className="summary-card">
        <h3>Pending Payments</h3>
        <p className="amount">${pendingAmount.toFixed(2)}</p>
      </div>
      
      <div className="summary-card">
        <h3>Total Jobs</h3>
        <p className="count">{totalJobs}</p>
      </div>
      
      <div className="summary-card">
        <h3>Completed Jobs</h3>
        <p className="count">{paidJobs}</p>
      </div>
    </div>
  );
};

export default SummaryDashboard;