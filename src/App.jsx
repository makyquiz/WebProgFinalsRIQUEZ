import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </main>
          {/* Add footer here if needed */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;