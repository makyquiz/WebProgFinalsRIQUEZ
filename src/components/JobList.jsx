import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const JobList = () => {
  const { jobs } = useOutletContext();
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

  if (jobs.length === 0) return <div>No jobs found. Add your first job!</div>;

  return (
    <div className="job-list-container">
      {/* Your existing filter UI */}
      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p><strong>Client:</strong> {job.client}</p>
            <p><strong>Amount:</strong> ${job.amount?.toFixed(2)}</p>
            <p><strong>Status:</strong> {job.status}</p>
            {job.date && <p><strong>Date:</strong> {job.date.toLocaleDateString()}</p>}
            {job.notes && <p><strong>Notes:</strong> {job.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;