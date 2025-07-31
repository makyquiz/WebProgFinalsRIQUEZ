import { useAuth } from '../context/AuthContext';
import '../styles/SummaryDashboard.css';

const SummaryDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="welcome-container">
      <h1 className="welcome-heading">Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!</h1>
      <p className="welcome-text">
        This is your personal freelancer income tracker. 
        You can start by adding new jobs, tracking your earnings, and updating the status of each job.
      </p>
      <p className="welcome-hint">
        Use the dashboard to manage everything in one place. Happy tracking!
      </p>
    </div>
  );
};

export default SummaryDashboard;