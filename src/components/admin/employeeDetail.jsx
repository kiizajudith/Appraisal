import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref, onValue, off, get } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import { decodeEmail, encodeEmail } from "../../utils"; // Import the utility function
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"; // Import from Heroicons v2

export default function EmployeeDetail() {
  const { email } = useParams();
  const decodedEmail = decodeEmail(email); // Decode the email
  const encodedEmail = encodeEmail(decodedEmail); // Encode the email

  const [personnelData, setPersonnelData] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [employeeAppraisals, setEmployeeAppraisals] = useState([]);
  const [supervisorAppraisals, setSupervisorAppraisals] = useState([]);
  const [supervisorName, setSupervisorName] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (decodedEmail) {
      const personnelDataRef = ref(database, `personnelData/${encodedEmail}`);
      const growthDataRef = ref(database, `Growth-${encodedEmail}`);
      const employeeAppraisalsRef = ref(database, "EmployeeAppraisal");
      const supervisorAppraisalsRef = ref(database, "SupervisorAppraisal");

      const fetchData = async () => {
        try {
          onValue(personnelDataRef, async (snapshot) => {
            const data = snapshot.val();
            console.log("Fetched personnel data:", data);
            setPersonnelData(data);

            // Fetch supervisor's name
            if (data && data.supervisor) {
              const supervisorRef = ref(database, `users/${data.supervisor}`);
              const supervisorSnapshot = await get(supervisorRef);
              const supervisorData = supervisorSnapshot.val();
              if (supervisorData) {
                setSupervisorName(
                  `${supervisorData.givenName} ${supervisorData.surname}`
                );
              }
            }
          });

          onValue(growthDataRef, (snapshot) => {
            const data = snapshot.val();
            const growthList = [];
            for (const id in data) {
              growthList.push(data[id]);
            }
            console.log("Fetched growth data:", growthList);
            setGrowthData(growthList);
          });

          onValue(employeeAppraisalsRef, (snapshot) => {
            const data = snapshot.val();
            const appraisals = [];
            for (const quarter in data) {
              for (const id in data[quarter]) {
                if (data[quarter][id].email === decodedEmail) {
                  appraisals.push({ ...data[quarter][id], quarter });
                }
              }
            }
            console.log("Fetched employee appraisals:", appraisals);
            setEmployeeAppraisals(appraisals);
          });

          onValue(supervisorAppraisalsRef, (snapshot) => {
            const data = snapshot.val();
            const appraisals = [];
            for (const quarter in data) {
              for (const id in data[quarter]) {
                if (data[quarter][id].email === decodedEmail) {
                  appraisals.push({ ...data[quarter][id], quarter });
                }
              }
            }
            console.log("Fetched supervisor appraisals:", appraisals);
            setSupervisorAppraisals(appraisals);
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();

      return () => {
        off(personnelDataRef);
        off(growthDataRef);
        off(employeeAppraisalsRef);
        off(supervisorAppraisalsRef);
      };
    }
  }, [decodedEmail, encodedEmail]);

  const formatQuarter = (quarter) => {
    const quarters = {
      "1st Quarter": "1st Quarter",
      "2nd Quarter": "2nd Quarter",
      "3rd Quarter": "3rd Quarter",
      "4th Quarter": "4th Quarter",
    };
    return quarters[quarter] || quarter.replace("%20", " ");
  };

  const renderAppraisalsTable = (appraisals) => {
    return appraisals.length > 0 ? (
      appraisals.map((appraisal, index) => (
        <div key={index} className="mb-4">
          <p className=" mb-2">{formatQuarter(appraisal.quarter)}</p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Performance Level</th>
                </tr>
              </thead>
              <tbody>
                {appraisal.attributes.map((attribute, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{attribute.title}</td>
                    <td className="px-4 py-2">{attribute.performanceLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2">
              <strong>Overall Value:</strong> {appraisal.overallValue}
            </p>
            <p className="px-4 py-2">
              <strong>Comments:</strong> {appraisal.comments}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No Appraisals found</p>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="bg-gray-800 p-4 rounded-md shadow-md mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-1xl font-semibold text-white">{"Employee Email: " + decodedEmail}</h1>
          <button
            className="text-white md:hidden"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <ul
            className={`flex-col md:flex-row md:flex md:space-x-4 ${
              isNavOpen ? "flex" : "hidden"
            } mt-4 md:mt-0`}
          >
            <li className="nav-item">
              <a
                className="nav-link text-white hover:underline"
                href="#personnelData"
              >
                Personnel Data
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-white hover:underline"
                href="#growthData"
              >
                Growth
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-white hover:underline"
                href="#performance"
              >
                Performance
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <section id="personnelData" className="mb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Personnel Data
        </h2>
        {personnelData ? (
          <dl className="bg-gray-100 p-4 rounded-md shadow-md grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="font-semibold">Email:</dt>
              <dd>{personnelData.email}</dd>
            </div>
            <div>
              <dt className="font-semibold">Date of Birth:</dt>
              <dd>{personnelData.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="font-semibold">Department:</dt>
              <dd>{personnelData.department}</dd>
            </div>
            <div>
              <dt className="font-semibold">Directorate:</dt>
              <dd>{personnelData.directorate}</dd>
            </div>
            <div>
              <dt className="font-semibold">First Appointment Date:</dt>
              <dd>{personnelData.firstAppointmentDate}</dd>
            </div>
            <div>
              <dt className="font-semibold">First Appointment Text:</dt>
              <dd>{personnelData.firstAppointmentText}</dd>
            </div>
            <div>
              <dt className="font-semibold">Present Appointment Date:</dt>
              <dd>{personnelData.presentAppointmentDate}</dd>
            </div>
            <div>
              <dt className="font-semibold">Present Appointment Text:</dt>
              <dd>{personnelData.presentAppointmentText}</dd>
            </div>
            <div>
              <dt className="font-semibold">Supervisor:</dt>
              <dd>{supervisorName}</dd>
            </div>
            <div>
              <dt className="font-semibold">Appraisal Period:</dt>
              <dd>{personnelData.appraisalPeriod}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-gray-500 text-center">No Personnel Data found.</p>
        )}
      </section>

      <section id="growthData" className="mb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Growth</h2>
        {growthData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Institution</th>
                  <th className="px-4 py-2 text-left">File</th>
                </tr>
              </thead>
              <tbody>
                {growthData.map((growth, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2">{growth.name}</td>
                    <td className="px-4 py-2">{growth.duration}</td>
                    <td className="px-4 py-2">{growth.institution}</td>
                    <td className="px-4 py-2">
                      <a
                        href={growth.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No Growth Data found.</p>
        )}
      </section>

      <section id="performance" className="mb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Performance</h2>
        <h3 className="text-lg font-semibold mb-2 text-center">
          Employee Appraisals
        </h3>
        {renderAppraisalsTable(employeeAppraisals)}
        <h3 className="text-lg font-semibold mb-2 mt-4 text-center">
          Supervisor Appraisals
        </h3>
        {renderAppraisalsTable(supervisorAppraisals)}
      </section>
    </div>
  );
}
