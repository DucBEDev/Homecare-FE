import React, { Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {routes} from './routes'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'

export function App() {
 
  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page;
            const Layout = route.isShowHeader ? DefaultComponent : Fragment

            if (route.children) {
              return (
                <Route key={route.path} path={route.path} element={<Layout><Page /></Layout>}>
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
              <Route key={route.path} path={route.path} element={
                <Layout>
                  <Page />
                </Layout>
              } />
            )
          })}
        </Routes>
      </Router>
    </div>
  )
}

export default App