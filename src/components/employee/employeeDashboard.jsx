import React from "react";
import { Outlet } from "react-router-dom";
import ENavbar from "./employeeNavbar";

export default function Edashboard() {
  return (
    <div className="bg-white">
      <ENavbar />
      <div className="p-4 mt-8">
        <Outlet />
      </div>
    </div>
  );
}
