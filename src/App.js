import React, { Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { routes } from './routes'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'
import { AuthProvider } from './redux/hooks/AuthContext'
import { useAuth } from './redux/hooks/AuthContext'
import { Spin } from 'antd'

// Component để bảo vệ các route cần authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component để chuyển hướng đã đăng nhập rồi
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <div>
      <AuthProvider>
        <Router>
          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const Layout = route.isShowHeader ? DefaultComponent : Fragment;

              // Các route đăng nhập/đăng ký (không yêu cầu đăng nhập)
              if (route.path === '/login') {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <PublicRoute>
                        <Layout>
                          <Page />
                        </Layout>
                      </PublicRoute>
                    }
                  />
                );
              }

              // Tất cả các route khác yêu cầu đăng nhập
              if (route.children) {
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={
                      <ProtectedRoute>
                        <Layout><Page /></Layout>
                      </ProtectedRoute>
                    }
                  >
                    {route.children.map((child) => {
                      const ChildPage = child.page;
                      return (
                        <Route key={child.path} path={child.path} element={<ChildPage />} />
                      );
                    })}
                  </Route>
                );
              }

              return (
                <Route 
                  key={route.path} 
                  path={route.path} 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Page />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
              );
            })}
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  )
}

export default App