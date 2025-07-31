import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/JobList.css';

const JobList = () => {
  const { jobs } = useOutletContext();
  const { currentUser } = useAuth();
  const [editingJob, setEditingJob] = useState(null);
  const [sortOrder, setSortOrder] = useState('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [confirmStatusChangeId, setConfirmStatusChangeId] = useState(null);

  const safeJobs = jobs || [];

  const sortedJobs = [...safeJobs].sort((a, b) => {
    const dateA = a.createdAt?.seconds || 0;
    const dateB = b.createdAt?.seconds || 0;
    return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
  });

  const handleDelete = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'jobs', jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
    setShowDeleteConfirm(null);
  };

  const handleStatusToggle = async (jobId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'jobs', jobId), {
        status: currentStatus === 'paid' ? 'pending' : 'paid'
      });
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  if (!currentUser) return <div>Please log in to view jobs</div>;

  return (
    <div className="job-list-container">
      <div className="list-controls">
        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="recent">Recently Added</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {sortedJobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found. Add your first job!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {sortedJobs.map(job => {
            const createdAt = job.createdAt ? new Date(job.createdAt.seconds * 1000) : null;
            const startDate = job.startDate
              ? new Date(job.startDate.seconds ? job.startDate.seconds * 1000 : job.startDate)
              : null;
            const deadline = job.deadlineDate
              ? new Date(job.deadlineDate.seconds ? job.deadlineDate.seconds * 1000 : job.deadlineDate)
              : null;
            return (
              <div key={job.id} className={`job-card ${job.status}`}>
                {editingJob?.id === job.id ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={editingJob.title}
                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Client:</label>
                      <input
                        type="text"
                        value={editingJob.client}
                        onChange={(e) => setEditingJob({ ...editingJob, client: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount:</label>
                      <input
                        type="number"
                        value={editingJob.amount}
                        onChange={(e) =>
                          setEditingJob({ ...editingJob, amount: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Date:</label>
                      <input
                        type="date"
                        value={
                          editingJob.startDate
                            ? new Date(
                                editingJob.startDate.seconds
                                  ? editingJob.startDate.seconds * 1000
                                  : editingJob.startDate
                              ).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            startDate: new Date(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Deadline:</label>
                      <input
                        type="date"
                        value={
                          editingJob.deadlineDate
                            ? new Date(
                                editingJob.deadlineDate.seconds
                                  ? editingJob.deadlineDate.seconds * 1000
                                  : editingJob.deadlineDate
                              ).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            deadlineDate: new Date(e.target.value)
                          })
                        }
                      />
                    </div>

                    <div className="edit-buttons">
                      <button
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'users', currentUser.uid, 'jobs', job.id), {
                              title: editingJob.title,
                              client: editingJob.client,
                              amount: editingJob.amount,
                              startDate: editingJob.startDate,
                              deadlineDate: editingJob.deadlineDate,
                            });
                            setEditingJob(null);
                          } catch (error) {
                            console.error("Error updating job:", error);
                          }
                        }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingJob(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="job-header">
                      <h3>{job.title || 'Untitled Job'}</h3>
                      <div className="job-actions">
                        <button onClick={() => setEditingJob(job)} className="edit-btn">Edit</button>
                        <button onClick={() => setShowDeleteConfirm(job.id)} className="delete-btn">Delete</button>
                      </div>
                    </div>

                    <p><strong>Client:</strong> {job.client || 'No client specified'}</p>
                    <p><strong>Amount:</strong> ₱{job.amount?.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${job.status}`}>{job.status}</span></p>
                    {createdAt && <p><strong>Created At:</strong> {createdAt.toLocaleDateString()}</p>}
                    {startDate && <p><strong>Start Date:</strong> {startDate.toLocaleDateString()}</p>}
                    {deadline && <p><strong>Deadline:</strong> {deadline.toLocaleDateString()}</p>}

                    <button
                      onClick={() => setConfirmStatusChangeId(job.id)}
                      className={`status-btn ${job.status}`}
                    >
                      {job.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                    </button>

                    {confirmStatusChangeId === job.id && (
                      <div className="confirmation-dialog">
                        <p>Are you sure you want to mark this job as <strong>{job.status === 'paid' ? 'pending' : 'paid'}</strong>?</p>
                        <div className="confirmation-buttons">
                          <button
                            onClick={() => {
                              handleStatusToggle(job.id, job.status);
                              setConfirmStatusChangeId(null);
                            }}
                            className="confirm-delete"
                          >
                            Confirm
                          </button>
                          <button onClick={() => setConfirmStatusChangeId(null)} className="cancel-delete">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {showDeleteConfirm === job.id && (
                      <div className="confirmation-dialog">
                        <p>Delete this job permanently?</p>
                        <div className="confirmation-buttons">
                          <button onClick={() => handleDelete(job.id)} className="confirm-delete">
                            Confirm
                          </button>
                          <button onClick={() => setShowDeleteConfirm(null)} className="cancel-delete">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobList;