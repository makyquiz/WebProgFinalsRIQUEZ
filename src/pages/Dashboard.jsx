// Dashboard.jsx
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const jobsRef = collection(db, 'users', currentUser.uid, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc')); // Add sorting

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || null,
          createdAt: data.createdAt?.toDate?.() || null
        };
      });
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="dashboard">
      <Outlet context={{ jobs }} />
    </div>
  );
};

export default Dashboard;