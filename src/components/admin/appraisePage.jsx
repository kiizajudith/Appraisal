import { useParams } from "react-router-dom";
import AppraisalList from "./appraisalList";
import { useState, useEffect } from "react";
import { ref, get, onValue, off } from "firebase/database";
import { app, database } from "../../firebase/firebase";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

const attributes = [
  {
    title: "Honesty and Integrity",
  },
  {
    title: "Professionalism",
  },
  {
    title: "Objectivity",
  },
  {
    title: "Customer Service",
  },
  {
    title: "Interpersonal / Social Skills",
  },
  {
    title: "Communication",
  },
  {
    title: "Creativity and Innovation",
  },
  {
    title: "Time Management",
  },
  {
    title: "People Management and Empathy",
  },
  {
    title: "Leadership",
  },
  {
    title: "Teamwork",
  },
];

function AppraisalPage(email) {
  const [appraisal, setAppraisal] = useState({ attributes: attributes });

  let kd = 0;
  useEffect(() => {
    const appraisalsRef = ref(database, "AdminAppraisal");

    const fetchData = async () => {
      try {
        console.log(email);
        let appraisalsData = await get(appraisalsRef)
        if (appraisalsData) {
          const filteredAppraisal = Object.keys(appraisalsData.val())
            .map((key) => ({
              id: key,
              ...appraisalsData.val()[key],
            }))
            .find((appraisal) => appraisal[Object.keys(appraisal)[1]].email === email.email);
          console.log(filteredAppraisal[Object.keys(filteredAppraisal)[1]].attributes);
          setAppraisal(filteredAppraisal);
        } else {
          let appraisal = new Object();
          attributes.forEach(el => {
            el.performanceLevel = 0;
            el.improvementPlan = "";
          })
          appraisal.attributes = attributes;
          setAppraisal(appraisal)
        }

      } catch (error) {
        console.error("Error fetching appraisals:", error);
      }
    };
    fetchData();
  }, [email]);


  return (
    <div className="container mx-auto px-4">
      <h3 style={{ fontSize: '32pt', fontWeight: 600 }}>Employee Self Assessment Report</h3>
      <h6>{"For: " + email.name}</h6>
      <div className="border rounded-lg w-full p-10 bg-white mt-8">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attributes</TableHead>
                <TableHead>Performance Level</TableHead>
                <TableHead>Improvement Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                appraisal[Object.keys(appraisal)[1]].attributes.map((attribute, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <b>{attribute.title}</b>
                    </TableCell>
                    <TableCell>{attribute.performanceLevel || "N/A"}</TableCell>
                    <TableCell>{attribute.improvementPlan || "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Label htmlFor="overallValue" className="block mb-2 font-bold">
              Overall Value
            </Label>
            <div
              id="overallValue"
              className="p-4 bg-gray-100 border rounded-md"
            >
              {/*appraisal[Object.keys(appraisal)[1]].*/overallValue || "No overall value provided"}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="comments" className="block mb-2 font-bold">
              Comments and Recommendations
            </Label>
            <div id="comments" className="p-4 bg-gray-100 border rounded-md">
              {/*appraisal[Object.keys(appraisal)[1]].*/comments || "No comments provided"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppraisalPage;
