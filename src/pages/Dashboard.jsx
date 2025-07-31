import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Outlet, useOutlet } from 'react-router-dom';
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const outlet = useOutlet();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const jobsRef = collection(db, 'users', currentUser.uid, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const jobsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate?.() || null,
            createdAt: data.createdAt?.toDate?.() || null,
          };
        });
        setJobs(jobsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  if (loading) return <div className="loading-spinner">Loading...</div>;

  const totalJobs = jobs.length;
  const paidJobs = jobs.filter(job => job.status === 'paid');
  const pendingJobs = jobs.filter(job => job.status !== 'paid');
  const totalEarnings = paidJobs.reduce((acc, job) => acc + (job.amount || 0), 0);

  return (
    <div className="dashboard">
      {outlet ? (
        <Outlet context={{ jobs }} />
      ) : (
        <div className="dashboard-summary">
          <div className="dashboard-header">
            <h1 className="welcome-text">Welcome back!</h1>
            <p className="user-email">{currentUser?.email}</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card card-blue">
              <h2>Total Jobs</h2>
              <p>{totalJobs}</p>
            </div>
            <div className="metric-card card-green">
              <h2>Paid Jobs</h2>
              <p>{paidJobs.length}</p>
            </div>
            <div className="metric-card card-yellow">
              <h2>Pending Jobs</h2>
              <p>{pendingJobs.length}</p>
            </div>
            <div className="metric-card card-purple">
              <h2>Total Earnings</h2>
              <p>₱{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
