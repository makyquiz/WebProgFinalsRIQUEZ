import { useState } from 'react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';
import '../styles/JobForm.css';

// Format date to "yyyy-MM-ddTHH:mm" for datetime-local input
const formatDateTime = (date) => {
  return new Date(date).toISOString().slice(0, 16);
};

const JobForm = () => {
  const { currentUser } = useAuth();
  const now = formatDateTime(new Date());

  const [formData, setFormData] = useState({
    date: now.split('T')[0],
    client: '',
    title: '',
    amount: '',
    status: 'pending',
    notes: '',
    startDate: now,
    deadlineDate: now,
  });

  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.client || !formData.title || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      await addDoc(collection(db, 'users', currentUser.uid, 'jobs'), {
        ...formData,
        amount: parseFloat(formData.amount),
        date: Timestamp.fromDate(new Date(formData.date)),
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        deadlineDate: Timestamp.fromDate(new Date(formData.deadlineDate)),
        createdAt: serverTimestamp()
      });

      setNotification({
        message: 'Job added successfully!',
        type: 'success'
      });

      setFormData({
        date: now.split('T')[0],
        client: '',
        title: '',
        amount: '',
        status: 'pending',
        notes: '',
        startDate: now,
        deadlineDate: now,
      });

    } catch (error) {
      console.error('Error adding job:', error);
      setNotification({
        message: error.message || 'Failed to add job',
        type: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="job-form-container" style={{ width: '100%', maxWidth: '600px' }}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <h2>Add New Job</h2>
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="date">Job Creation Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date & Time</label>
          <input
            id="startDate"
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadlineDate">Deadline Date & Time</label>
          <input
            id="deadlineDate"
            type="datetime-local"
            name="deadlineDate"
            value={formData.deadlineDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="client">Client Name</label>
          <input
            id="client"
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
            placeholder="Enter client name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter job title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₱)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes..."
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!formData.client || !formData.title || !formData.amount}
        >
          Add Job
        </button>
      </form>
    </div>
  );
};

export default JobForm;
