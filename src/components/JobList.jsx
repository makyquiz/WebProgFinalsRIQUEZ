import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/JobList.css';

function formatFirestoreDate(timestamp) {
  try {
    let date;
    
    if (typeof timestamp?.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date:', timestamp);
      return 'Date unavailable';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Raw timestamp:', timestamp);
    return 'Date unavailable';
  }
}

const JobList = () => {
  const { jobs } = useOutletContext();
  const { currentUser } = useAuth();

  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobData, setEditingJobData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [confirmStatusChangeId, setConfirmStatusChangeId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const filterJobs = () => {
    return safeJobs.filter((job) => {
      const jobClient = job.client?.toLowerCase() || '';
      const matchesClient =
        clientFilter.trim() === '' || jobClient.includes(clientFilter.toLowerCase());

      let matchesMonth = true;
      if (selectedMonth) {
        const jobDate = job.startDate?.seconds
          ? new Date(job.startDate.seconds * 1000)
          : job.startDate instanceof Date 
            ? job.startDate
            : null;
        if (!jobDate) return false;

        const jobYearMonth = `${jobDate.getFullYear()}-${String(jobDate.getMonth() + 1).padStart(2, '0')}`;
        matchesMonth = jobYearMonth === selectedMonth;
      }

      return matchesClient && matchesMonth;
    });
  };

  const filteredJobs = filterJobs();

  const totalEarnings = filteredJobs
    .filter(job => job.status === 'paid' && !isNaN(job.amount))
    .reduce((acc, job) => acc + Number(job.amount), 0);

  const handleDelete = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'jobs', jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
    setShowDeleteConfirm(null);
  };

  const handleStatusToggle = async (jobId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'jobs', jobId), {
        status: currentStatus === 'paid' ? 'pending' : 'paid',
      });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
    setConfirmStatusChangeId(null);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const combineDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    return new Date(`${dateString}T${timeString}`);
  };

  if (!currentUser) return <div>Please log in to view jobs.</div>;

  return (
    <div className="job-list-container">
      <div className="filters">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-filter"
        />
        <input
          type="text"
          placeholder="Filter by client..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="client-filter"
        />
        <button
          className="clear-filters-btn"
          onClick={() => {
            setSelectedMonth('');
            setClientFilter('');
          }}
        >
          Clear Filters
        </button>
      </div>
      
      <div className="summary">
        <p><strong>Jobs found:</strong> {filteredJobs.length}</p>
        <p><strong>Total earnings (paid):</strong> ₱{totalEarnings.toFixed(2)}</p>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs match the filter. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <div key={job.id} className={`job-card ${job.status}`}>
              {editingJobId === job.id ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={editingJobData?.title || ''}
                      onChange={(e) =>
                        setEditingJobData({ ...editingJobData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Client:</label>
                    <input
                      type="text"
                      value={editingJobData?.client || ''}
                      onChange={(e) =>
                        setEditingJobData({ ...editingJobData, client: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount:</label>
                    <input
                      type="number"
                      value={editingJobData?.amount || ''}
                      onChange={(e) =>
                        setEditingJobData({ ...editingJobData, amount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date:</label>
                      <input
                        type="date"
                        value={
                          editingJobData?.startDate
                            ? new Date(
                                editingJobData.startDate.seconds
                                  ? editingJobData.startDate.seconds * 1000
                                  : editingJobData.startDate
                              )
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setEditingJobData({
                            ...editingJobData,
                            startDate: e.target.value ? combineDateTime(e.target.value, editingJobData.startTime) : null,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Time:</label>
                      <input
                        type="time"
                        value={editingJobData?.startTime || ''}
                        onChange={(e) =>
                          setEditingJobData({
                            ...editingJobData,
                            startTime: e.target.value,
                            startDate: editingJobData.startDate 
                              ? combineDateTime(
                                  new Date(
                                    editingJobData.startDate.seconds
                                      ? editingJobData.startDate.seconds * 1000
                                      : editingJobData.startDate
                                  ).toISOString().split('T')[0],
                                  e.target.value
                                )
                              : null
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Deadline Date:</label>
                      <input
                        type="date"
                        value={
                          editingJobData?.deadlineDate
                            ? new Date(
                                editingJobData.deadlineDate.seconds
                                  ? editingJobData.deadlineDate.seconds * 1000
                                  : editingJobData.deadlineDate
                              )
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setEditingJobData({
                            ...editingJobData,
                            deadlineDate: e.target.value ? combineDateTime(e.target.value, editingJobData.deadlineTime) : null,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Deadline Time:</label>
                      <input
                        type="time"
                        value={editingJobData?.deadlineTime || ''}
                        onChange={(e) =>
                          setEditingJobData({
                            ...editingJobData,
                            deadlineTime: e.target.value,
                            deadlineDate: editingJobData.deadlineDate
                              ? combineDateTime(
                                  new Date(
                                    editingJobData.deadlineDate.seconds
                                      ? editingJobData.deadlineDate.seconds * 1000
                                      : editingJobData.deadlineDate
                                  ).toISOString().split('T')[0],
                                  e.target.value
                                )
                              : null
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="edit-buttons">
                    <button
                      onClick={async () => {
                        try {
                          const startDateTime = editingJobData.startDate && editingJobData.startTime
                            ? combineDateTime(
                                new Date(
                                  editingJobData.startDate.seconds
                                    ? editingJobData.startDate.seconds * 1000
                                    : editingJobData.startDate
                                ).toISOString().split('T')[0],
                                editingJobData.startTime
                              )
                            : null;

                          const deadlineDateTime = editingJobData.deadlineDate && editingJobData.deadlineTime
                            ? combineDateTime(
                                new Date(
                                  editingJobData.deadlineDate.seconds
                                    ? editingJobData.deadlineDate.seconds * 1000
                                    : editingJobData.deadlineDate
                                ).toISOString().split('T')[0],
                                editingJobData.deadlineTime
                              )
                            : null;

                          await updateDoc(
                            doc(db, 'users', currentUser.uid, 'jobs', job.id),
                            {
                              title: editingJobData.title,
                              client: editingJobData.client,
                              amount: editingJobData.amount,
                              startDate: startDateTime,
                              deadlineDate: deadlineDateTime,
                            }
                          );
                          setEditingJobId(null);
                          setEditingJobData(null);
                        } catch (error) {
                          console.error('Error saving edit:', error);
                        }
                      }}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setEditingJobId(null);
                        setEditingJobData(null);
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="job-header">
                    <div>
                      <h3>{job.title || 'Untitled Job'}</h3>
                      {job.createdAt && (
                        <p className="creation-date">
                          <strong>Created:</strong> {formatFirestoreDate(job.createdAt)}
                        </p>
                      )}
                    </div>
                    <div className="job-actions">
                      <button 
                        onClick={() => {
                          const jobToEdit = {
                            ...job,
                            startTime: formatTime(job.startDate),
                            deadlineTime: formatTime(job.deadlineDate)
                          };
                          setEditingJobId(job.id);
                          setEditingJobData(jobToEdit);
                        }} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(job.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="job-details">
                    <p><strong>Client:</strong> {job.client || 'N/A'}</p>
                    <p><strong>Amount:</strong> ₱{job.amount?.toFixed(2) || '0.00'}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </p>
                    {job.startDate && (
                      <p>
                        <strong>Start:</strong> {formatFirestoreDate(job.startDate)}
                      </p>
                    )}
                    {job.deadlineDate && (
                      <p>
                        <strong>Deadline:</strong> {formatFirestoreDate(job.deadlineDate)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setConfirmStatusChangeId(job.id)}
                    className={`status-btn ${job.status}`}
                  >
                    {job.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                  </button>

                  {confirmStatusChangeId === job.id && (
                    <div className="confirmation-dialog">
                      <p>
                        Are you sure you want to mark this job as{' '}
                        <strong>{job.status === 'paid' ? 'pending' : 'paid'}</strong>?
                      </p>
                      <div className="confirmation-buttons">
                        <button
                          onClick={() => {
                            handleStatusToggle(job.id, job.status);
                          }}
                          className="confirm-btn"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmStatusChangeId(null)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {showDeleteConfirm === job.id && (
                    <div className="confirmation-dialog">
                      <p>Are you sure you want to delete this job?</p>
                      <div className="confirmation-buttons">
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="confirm-btn"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;