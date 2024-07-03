import { useState, useEffect } from "react";
import { database, auth } from "../../../firebase/firebase"; // Adjust the import path as needed
import { ref, get, set } from "firebase/database";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const encodeEmail = (email) =>
  email.replace(
    /[@.]/g,
    (char) =>
      ({
        "@": "_at_",
        ".": "_dot_",
      }[char])
  );

export default function PersonalDataDisplay() {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [supervisorData, setSupervisorData] = useState(null);

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const email = user.email;
          const encodedEmail = encodeEmail(email);
          const dataRef = ref(database, "personnelData/" + encodedEmail);
          const snapshot = await get(dataRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setFormData(data);
            setOriginalData(data);

            // Fetch supervisor data if supervisor ID is present
            if (data.supervisor) {
              const supervisorRef = ref(database, "users/" + data.supervisor);
              const supervisorSnapshot = await get(supervisorRef);
              if (supervisorSnapshot.exists()) {
                setSupervisorData(supervisorSnapshot.val());
              }
            }
          } else {
            setError("No data found for the current user.");
          }
        } else {
          setError("User not authenticated.");
        }
      } catch (error) {
        setError("Error fetching data. Please try again.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const encodedEmail = formData.email.replace(/[.#$[\]]/g, "_");
      const dataRef = ref(database, "personnelData/" + encodedEmail);
      await set(dataRef, formData);
      setOriginalData(formData);
      setEditing(false);
      setError(null);
    } catch (error) {
      setError("Error saving data. Please try again.");
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <h2 className="text-2xl font-semibold mb-6">Personal Data</h2>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            ) : (
              formData.email
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            ) : (
              formData.dateOfBirth
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            First Appointment
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="firstAppointmentText"
                value={formData.firstAppointmentText}
                onChange={handleChange}
              />
            ) : (
              formData.firstAppointmentText
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            First Appointment Date
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="firstAppointmentDate"
                type="date"
                value={formData.firstAppointmentDate}
                onChange={handleChange}
              />
            ) : (
              formData.firstAppointmentDate
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Present Appointment
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="presentAppointmentText"
                value={formData.presentAppointmentText}
                onChange={handleChange}
              />
            ) : (
              formData.presentAppointmentText
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Present Appointment Date
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="presentAppointmentDate"
                type="date"
                value={formData.presentAppointmentDate}
                onChange={handleChange}
              />
            ) : (
              formData.presentAppointmentDate
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Directorate</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="directorate"
                value={formData.directorate}
                onChange={handleChange}
              />
            ) : (
              formData.directorate
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Department</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="department"
                value={formData.department}
                onChange={handleChange}
              />
            ) : (
              formData.department
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Appraisal Period
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {editing ? (
              <Input
                id="appraisalPeriod"
                value={formData.appraisalPeriod}
                onChange={handleChange}
              />
            ) : (
              formData.appraisalPeriod
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Supervisor</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            {supervisorData ? (
              <>
                <img
                  className="w-8 h-8 rounded-full mr-2"
                  src={supervisorData.imageUrl}
                  alt={`${supervisorData.surname} ${supervisorData.givenName}`}
                />
                <span>
                  {`${supervisorData.surname} ${supervisorData.givenName}`}
                </span>
              </>
            ) : (
              "No supervisor assigned"
            )}
          </dd>
        </div>
      </dl>
      <div className="flex justify-end mt-6">
        {editing ? (
          <Button onClick={handleSaveClick} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        ) : (
          <Button onClick={handleEditClick}>Edit</Button>
        )}
      </div>
    </div>
  );
}
