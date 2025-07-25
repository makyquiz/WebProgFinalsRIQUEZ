import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const JobForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    client: '',
    title: '',
    amount: '',
    status: 'pending',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'jobs'), {
        ...formData,
        amount: parseFloat(formData.amount),
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        client: '',
        title: '',
        amount: '',
        status: 'pending',
        notes: ''
      });
      alert('Job added successfully!');
    } catch (error) {
      console.error('Error adding job: ', error);
    }
  };

  return (
    <div className="job-form-container">
      <h2>Add New Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Client Name</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>
        
        <button type="submit" className="submit-btn">Add Job</button>
      </form>
    </div>
  );
};

export default JobForm;