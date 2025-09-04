import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return state.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return state.isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route
                          path="/projects"
                          element={
                            <div className="text-center py-12">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Projects
                              </h2>
                              <p className="text-gray-600 mt-2">
                                Projects page coming soon...
                              </p>
                            </div>
                          }
                        />
                        <Route
                          path="/boards"
                          element={
                            <div className="text-center py-12">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Boards
                              </h2>
                              <p className="text-gray-600 mt-2">
                                Boards page coming soon...
                              </p>
                            </div>
                          }
                        />
                        <Route
                          path="/team"
                          element={
                            <div className="text-center py-12">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Team
                              </h2>
                              <p className="text-gray-600 mt-2">
                                Team page coming soon...
                              </p>
                            </div>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <div className="text-center py-12">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Settings
                              </h2>
                              <p className="text-gray-600 mt-2">
                                Settings page coming soon...
                              </p>
                            </div>
                          }
                        />
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </DndProvider>
  );
}

export default App;
