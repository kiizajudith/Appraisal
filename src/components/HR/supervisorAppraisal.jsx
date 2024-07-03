import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
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

export default function AppraisalDisplay() {
  const [appraisal, setAppraisal] = useState(null);
  const targetEmail = "guymandem951@gmail.com";

  useEffect(() => {
    const appraisalsRef = ref(database, "SupervisorAppraisal");

    const fetchData = async () => {
      try {
        onValue(appraisalsRef, (snapshot) => {
          const appraisalsData = snapshot.val();
          if (appraisalsData) {
            const filteredAppraisal = Object.keys(appraisalsData)
              .map((key) => ({
                id: key,
                ...appraisalsData[key],
              }))
              .find((appraisal) => appraisal.email === targetEmail);
            setAppraisal(filteredAppraisal);
          }
        });
      } catch (error) {
        console.error("Error fetching appraisals:", error);
      }
    };

    fetchData();

    return () => {
      off(appraisalsRef);
    };
  }, []);

  if (!appraisal) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border rounded-lg w-full p-10 bg-white">
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
              {appraisal.attributes.map((attribute, index) => (
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
              {appraisal.overallValue || "No overall value provided"}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="comments" className="block mb-2 font-bold">
              Comments and Recommendations
            </Label>
            <div id="comments" className="p-4 bg-gray-100 border rounded-md">
              {appraisal.comments || "No comments provided"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
