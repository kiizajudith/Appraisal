import React from "react";
import { Outlet } from "react-router-dom";
import HNavbar from "./HrNavbar";
import image2 from "../images/image2.jpg";

const Dashboard2 = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image2})` }}
    >
      <HNavbar />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard2;
