import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import { ref, push, set, get } from "firebase/database";

export default function GoalsView({ email, name, goBack }) {

  const [goals, setGoals] = useState([])
  const [key, setKey] = useState("");
  const [comments, setComments] = useState(""); // State for comments
  const [currentQuarter, setCurrentQuarter] = useState(
    calculateCurrentQuarter()
  );
  const [isSubmitted, setIsSubmitted] = useState(false); // State to check if the form is already submitted
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  useEffect(() => {
    const checkExistingGoals = async () => {
      const sanitizedEmail = sanitizeEmail(email);
      const quarterString = `${currentQuarter} quarter`;
      const encodedQuarterString = encodeURIComponent(quarterString);
      const appraisalRef = ref(
        database,
        `EmployeeGoals/${encodedQuarterString}-${sanitizedEmail}`
      );

      try {
        const snapshot = await get(appraisalRef);
        if (snapshot.exists()) {
          console.log(snapshot)
          let data = snapshot.val()[Object.keys(snapshot.val())[0]];
          setComments(data.comments)
          let im_arr = new Array()
          let ct = 0;
          data.goals.forEach(att => {
            att.index = ct;
            ct++;
          })
          setGoals(data.goals)
          setKey(Object.keys(snapshot.val())[0])
          setIsSubmitted(true); // If data exists, set the form as submitted
        }
      } catch (error) {
        console.error("Error checking existing appraisal:", error);
      }
    };

    checkExistingGoals();
  }, [email, currentQuarter]);

  const sanitizeEmail = (email) => {
    return email.replace(/[.#$[\]]/g, "_");
  };

  const handleApprove = async (index) => {
    console.log(index)
    const sanitizedEmail = sanitizeEmail(email);
    const quarterString = `${currentQuarter} quarter`; // Construct quarter string
    const encodedQuarterString = encodeURIComponent(quarterString);
    const goalsRef = ref(
      database,
      `EmployeeGoals/${encodedQuarterString}-${sanitizedEmail}/${key}/goals/${index}/approved`
    );

    await set(goalsRef, true).then(() => {
      setGoals((prevValues) => {
        const newValues = [...prevValues];
        newValues[index].approved = true;
        return newValues;
      })
      console.log("Goal Approval Complete")
    }).catch((error) => {
      console.error("Error saving data:", error);
    })
  };

  // Function to determine the current quarter (implementation depends on your needs)
  function calculateCurrentQuarter() {
    const today = new Date();
    const month = today.getMonth(); // 0-indexed

    switch (true) {
      case month < 3:
        return 1; // Q1 (January - March)
      case month < 6:
        return 2; // Q2 (April - June)
      case month < 9:
        return 3; // Q3 (July - September)
      default:
        return 4; // Q4 (October - December)
    }
  }

  return (
    <div className="border rounded-lg w-full max-w-4xl mx-auto p-10 p-10 bg-white">
      <h3 style={{ fontSize: '24pt', fontWeight: '600' }}>Quarterly Targets</h3>
      <h5>{"For: Quater " + calculateCurrentQuarter()}</h5>
      <h6>{"Employee: " + name}</h6>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Targets</TableHead>
              <TableHead className="w-[30%]">Progress</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.index}>
                <TableCell>
                  <p>
                    <span style={{ marginRight: '32px', background: '#1e90ff', fontSize: '14pt', fontWeight: '600', color: '#fff', padding: '8px' }}>{goal.index + 1}</span>
                    {goal.goal}
                  </p>
                  <hr></hr>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'grid', gridTemplateColumns: '70% 30%'}}>
                    <progress style={{ marginLeft: '24px', padding: 0, marginTop: '24px' }} max={100} value={goal.progress} disabled={!goal.approved}></progress>
                    <span style={{ marginLeft: '16px', background: '#1e90ff', fontSize: '11pt', fontWeight: '500', color: '#fff', padding: '8px' }}>{goal.progress + "%"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button style={{ background: goal.approved ? '#00cc00' : '#eb144c', color: '#fff' }} onClick={() => { handleApprove(goal.index) }}>{goal.approved ? 'Approved' : 'Approve'} </Button> :
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button style={{marginTop: '16px'}} onClick={goBack}>Back</Button>
        {successMessage && (
          <div className="mt-4 text-green-500 font-bold">{successMessage}</div>
        )}
      </div>
    </div>
  );
}