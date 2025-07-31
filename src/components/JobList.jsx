import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/JobList.css';

const JobList = () => {
  const { jobs } = useOutletContext();
  const { currentUser } = useAuth();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    client: '',
    status: ''
  });

  useEffect(() => {
    const filtered = jobs.filter(job => {
      const jobDate = job.date;
      const monthMatch = !filters.month || 
        (jobDate && jobDate.getMonth() === parseInt(filters.month.split('-')[1]) - 1);
      const clientMatch = !filters.client || 
        job.client.toLowerCase().includes(filters.client.toLowerCase());
      const statusMatch = !filters.status || job.status === filters.status;
      return monthMatch && clientMatch && statusMatch;
    });
    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const handleStatusToggle = async (jobId, currentStatus) => {
    try {
      const jobRef = doc(db, 'users', currentUser.uid, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: currentStatus === 'paid' ? 'pending' : 'paid'
      });
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <p>No jobs found. Add your first job!</p>
      </div>
    );
  }

  return (
    <div className="job-list-container" style={{ width: '100%' }}>
      <div className="filters">
        <div className="filter-group">
          <label>Month:</label>
          <input 
            type="month" 
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>Client:</label>
          <input 
            type="text" 
            placeholder="Filter by client"
            value={filters.client}
            onChange={(e) => setFilters({...filters, client: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className={`job-card ${job.status}`}>
            <h3>{job.title || 'Untitled Job'}</h3>
            <p><strong>Client:</strong> {job.client || 'No client specified'}</p>
            <p><strong>Amount:</strong> ${job.amount?.toFixed(2)}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${job.status}`}>
                {job.status}
              </span>
            </p>
            {job.date && <p><strong>Date:</strong> {job.date.toLocaleDateString()}</p>}
            {job.notes && <p><strong>Notes:</strong> {job.notes}</p>}
            
            <button
              onClick={() => handleStatusToggle(job.id, job.status)}
              className={`status-btn ${job.status}`}
            >
              {job.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;