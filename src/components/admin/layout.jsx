import React from "react";
import { Outlet } from "react-router-dom";
import ANavbar from "./adminNavbar";

const Layout = () => {
  return (
    <div className="bg-white">
      <ANavbar />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
