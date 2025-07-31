// components/Notification.jsx
import { useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      {message}
      <button onClick={onClose} className="close-btn">&times;</button>
    </div>
  );
};

export default Notification;