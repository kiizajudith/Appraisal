import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import { decodeEmail, encodeEmail } from "../../utils"; // Import the utility function
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"; // Import from Heroicons v2
import { Button } from '../ui/button'
import { Textarea } from "../ui/textarea";
export default function EmployeeDetail() {
  const { email } = useParams();
  const decodedEmail = decodeEmail(email.split("+")[0]); // Decode the email
  const encodedEmail = encodeEmail(decodedEmail); // Encode the email

  const [personnelData, setPersonnelData] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [salary, setSalary] = useState(email.split("+")[1]);
  const [approve, setApproved] = useState(false);
  const [approveB, setApproveB] = useState(false);
  const [dismissx, setDismissed] = useState(false);
  const [comment, setComment] = useState(email.split("+")[4]);
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

      console.log(
        "Encoded email path for personnel data:",
        `personnelData/${encodedEmail}`
      );
      console.log(
        "Encoded email path for growth data:",
        `Growth-${encodedEmail}`
      );

      const fetchData = async () => {
        try {
          onValue(personnelDataRef, async (snapshot) => {
            const data = snapshot.val();
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
            setEmployeeAppraisals(appraisals);
            setApproveB(false)
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
            setSupervisorAppraisals(appraisals);
            if (email.split("+").length > 3) {
              if (email.split("+")[3] == "bonus") {
                setApproved(true)
              } else if (email.split("+")[3] == "dismiss") {
                setDismissed(true)
              }
            }
            setApproveB(true)
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
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
      <p className="text-gray-500">No Appraisals found.</p>
    );
  };

  const calculateBonus = (totalMark) => {
    console.log(salary)
    if (salary === null) return null;
    const bonusPercentage = totalMark / 100;
    const calculatedValue = salary * bonusPercentage;
    const bonus = salary - calculatedValue;
    return Math.round(bonus);
  };

  const handleComment = (value) => {
    setComment(value);
  }

  const approveBonus = (bonus) => {
    let key = email.split("+")[2];
    console.log(email.split("+")[2])

    const bonusRef = ref(
      database,
      `users/${key}/bonus`
    );

    set(bonusRef, bonus.toString()).then(() => {
      let cmmRef = ref(
        database,
        `users/${key}/comment`
      );

      set(cmmRef, comment).then(setApproved(true)).catch((error) => { console.log(error) })
    }).catch((error) => { console.log(error) })
  }

  const dismiss = () => {
    let key = email.split("+")[2];

    const bonusRef = ref(
      database,
      `users/${key}/dismiss`
    );

    set(bonusRef, "true").then(setDismissed(true)).catch((error) => { console.log(error) })
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="bg-gray-800 p-4 rounded-md shadow-md mb-8">
        <div className="flex justify-between items-center">
          <a style={{color: '#fff', textDecoration: 'underline'}} onClick={()=>{history.back()}}>Back</a>
          <h1 className="text-1xl font-semibold text-white">{decodedEmail}</h1>
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
            className={`flex-col md:flex-row md:flex md:space-x-4 ${isNavOpen ? "flex" : "hidden"
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
        <h2 className="text-xl font-semibold mb-4">Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Employee Self Assessment Report
            </h3>
            {renderAppraisalsTable(employeeAppraisals)}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 mt-4">
              Supervisor Assessment Report
            </h3>
            {renderAppraisalsTable(supervisorAppraisals)}
          </div>
        </div>
      </section>

      <section id="final" className="mb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Scores & Bonuses(Please Approve)</h2>
        {approveB && email.split("+").length > 2 ?
          <div>
            <h5>{"Total Score: " + (parseFloat(employeeAppraisals[0].overallValue) + parseFloat(supervisorAppraisals[0].overallValue))}</h5>
            <h5>{"Calculated Bonus(For this quarter): UGX " + calculateBonus(parseFloat(employeeAppraisals[0].overallValue) + parseFloat(supervisorAppraisals[0].overallValue))}</h5>
            <Textarea style={{ marginTop: "16px" }} value={comment} onChange={(e) => { handleComment(e.target.value) }} disabled={approve | dismissx} placeholder="Enter your performance comment here"></Textarea>
            <div style={{ display: 'flex', marginTop: '16px' }}>
              <Button onClick={() => { approveBonus(calculateBonus(parseFloat(employeeAppraisals[0].overallValue) + parseFloat(supervisorAppraisals[0].overallValue))) }} style={{ background: '#009900' }}
                disabled={approve | dismissx}>
                {approve ? "Approved" : "Approve"}
              </Button>
              <Button onClick={dismiss} style={{ background: '#eb144c', marginLeft: '16px' }} disabled={dismissx | approve}>
                {dismissx ? "Dismissed" : "Dismiss"}
              </Button>
            </div>
          </div> : <h5> Data Not Available</h5>
        }
        <p style={{ marginTop: '8px' }}><b>Note: </b> Dismissed reports will subject employee to training in order to improve competence in the field.</p>
      </section>
    </div>
  );
}
