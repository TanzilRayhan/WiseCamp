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
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Main Routes - No Authentication Required (Temporary) */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
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
