import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { database, auth } from "../../../firebase/firebase"; // Adjust the import path as needed
import { ref, set, onValue, off } from "firebase/database";
import { encodeEmail } from "../../../utils"; // Adjust the import path as needed

export default function PersonalData() {
  const [formData, setFormData] = useState({
    email: "",
    dateOfBirth: "",
    firstAppointmentText: "",
    firstAppointmentDate: "",
    presentAppointmentText: "",
    presentAppointmentDate: "",
    directorate: "",
    department: "",
    appraisalPeriod: "Quarterly",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const decodedEmail = user.email;
          setFormData((prevData) => ({
            ...prevData,
            email: decodedEmail,
          }));
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    fetchEmail();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const encodedEmail = encodeEmail(formData.email);
      const newEmployeeRef = ref(database, "personnelData/" + encodedEmail);
      await set(newEmployeeRef, formData);
      setLoading(false);
      setAlert({ type: "success", message: "Data saved successfully!" });
    } catch (error) {
      setLoading(false);
      setAlert({ type: "error", message: "Failed to save data." });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Personnel Information
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Fill out the form to update your personnel details.
        </p>
      </div>
      {alert.message && (
        <div
          className={`p-4 mb-4 text-sm ${
            alert.type === "success"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
          } rounded-lg`}
        >
          {alert.message}
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstAppointmentText">First Appointment</Label>
            <Input
              id="firstAppointmentText"
              placeholder="Enter first appointment"
              value={formData.firstAppointmentText}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstAppointmentDate">Date</Label>
            <Input
              id="firstAppointmentDate"
              type="date"
              value={formData.firstAppointmentDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="presentAppointmentText">Present Appointment</Label>
            <Input
              id="presentAppointmentText"
              placeholder="Enter present appointment"
              value={formData.presentAppointmentText}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="presentAppointmentDate">Date</Label>
            <Input
              id="presentAppointmentDate"
              type="date"
              value={formData.presentAppointmentDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="directorate">Directorate</Label>
            <Input
              id="directorate"
              placeholder="Enter your directorate"
              value={formData.directorate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="appraisalPeriod">Appraisal Period</Label>
          <Input
            id="appraisalPeriod"
            value={formData.appraisalPeriod}
            disabled
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
