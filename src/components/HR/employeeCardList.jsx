import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import EmployeeCard from "./employeeCard";
import AppraisalPage from "./appraisePage";
import Appraisal from "./appraisal";
import GoalsView from "./goalv";
import TestTable from "./testTable";

export default function EmployeeCardList() {
  const [users, setUsers] = useState([]);
  const [supervisor, selectSupervisor] = useState(null)
  const [supe_name, selectSName] = useState(null)
  const [app, selApp] = useState(0)


  useEffect(() => {
    const usersRef = ref(database, "users");
    const directorAppraisalsRef = ref(database, "AdminAppraisal2");
    const employeeAppraisalsRef = ref(database, "EmployeeAppraisal");
    const supervisorAppraisalsRef = ref(database, "SupervisorAppraisal");

    const fetchData = async () => {
      try {
        onValue(usersRef, (snapshot) => {
          const usersData = snapshot.val();
          if (usersData) {
            const usersArray = Object.keys(usersData).map((key) => ({
              id: key,
              ...usersData[key],
            }));

            //Filter users whose personnelType is 'employee'
            /*const filteredUsers = usersArray.filter(
              (user) => user.personnelType === "employee"
            );*/

            const filteredUsers = usersArray;

            onValue(employeeAppraisalsRef, (employeeSnapshot) => {
              const employeeAppraisalsData = employeeSnapshot.val();

              onValue(supervisorAppraisalsRef, (supervisorSnapshot) => {
                const supervisorAppraisalsData = supervisorSnapshot.val();

                let appraised = false;

                const combinedData = filteredUsers.map((user) => {
                  let employeeOverallValue = 0;
                  let supervisorOverallValue = 0;

                  // Iterate over each quarter in EmployeeAppraisal
                  if (employeeAppraisalsData) {
                    for (const quarterKey in employeeAppraisalsData) {
                      const quarterData = employeeAppraisalsData[quarterKey];
                      const employeeAppraisal = Object.values(quarterData).find(
                        (appraisal) => appraisal.email === user.email
                      );
                      if (employeeAppraisal) {
                        employeeOverallValue +=
                          parseFloat(employeeAppraisal.overallValue) || 0;
                      }
                    }
                  }

                  // Iterate over each quarter in SupervisorAppraisal
                  if (supervisorAppraisalsData) {
                    for (const quarterKey in supervisorAppraisalsData) {
                      const quarterData = supervisorAppraisalsData[quarterKey];
                      const supervisorAppraisal = Object.values(
                        quarterData
                      ).find((appraisal) => appraisal.email === user.email);
                      if (supervisorAppraisal) {
                        user.appraised = true
                        supervisorOverallValue +=
                          parseFloat(supervisorAppraisal.overallValue) || 0;
                      }
                    }
                  }

                  const totalAppraisalScore = (
                    employeeOverallValue + supervisorOverallValue
                  ).toFixed(1);

                  const report = supervisorOverallValue == 0 ? 1 : 2

                  return {
                    ...user,
                    appraisalScore: totalAppraisalScore,
                    report: report
                  };
                });

                setUsers(combinedData);
              });
            });
          } else {
            setUsers([]);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      off(usersRef);
      off(employeeAppraisalsRef);
      off(supervisorAppraisalsRef);
    };
  }, []);

  function handleAppraisal(email, name) {
    selApp(1)
    selectSupervisor({ email: email, name: name });
  }

  function handleTargets(email, name) {
    console.log("here2")
    selApp(2)
    selectSupervisor({ email: email, name: name });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {
        supervisor ?
          (<div className="container mx-auto px-4 py-8">
            {app == 1 ?
              <TestTable email={supervisor.email} name={supervisor.name} onSubmit={() =>{
                selApp(0)
                selectSupervisor(null)
              }} goBack={() =>{
                selApp(0)
                selectSupervisor(null)
              }}/> :
              <GoalsView email={supervisor.email} name={supervisor.name} goBack={() =>{
                selApp(0)
                selectSupervisor(null)}}></GoalsView>
            }
          </div>) :
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {users.map((user) => (
                <EmployeeCard key={user.id} user={user} click1={handleAppraisal} click2={handleTargets}/>
              ))}
            </div>
          </div>
      }
    </div>


  );
}
