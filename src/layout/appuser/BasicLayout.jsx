import React from 'react';
import { Outlet } from 'react-router-dom';
import './BasicLayout.css';
import Header from "../../components/appuser/Header"
import Footer from '../../components/appuser/Footer';

const AppUserBasicLayout = () => {
  return (
    <div className="layout-container">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppUserBasicLayout;