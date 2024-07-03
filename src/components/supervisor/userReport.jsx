import {
    TableHead,
    TableRow,
    TableHeader,
    TableCell,
    TableBody,
    Table,
} from "@/components/ui/table";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/firebase"; // Adjust the import path as needed
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";

export default function UserReport(email, name) {

    const [attributes, setAttrs] = useState(null)
    const [overallValue, setOv] = useState(0)
    const [comments, setCmm] = useState("")
    const [currentQuarter, setCurrentQuarter] = useState(
        calculateCurrentQuarter()
    );

    const sanitizeEmail = (emailx) => {
        return emailx.replace(/[.#$[\]]/g, "_");
    };

    useEffect(() => {
        const fetchData = async () => {
            if (attributes == null) {
                try {
                    console.log(email)
                    const sanitizedEmail = sanitizeEmail(email.email);
                    const quarterString = `${currentQuarter} quarter`;
                    const encodedQuarterString = encodeURIComponent(quarterString);
                    //get employee self/appraisal summary
                    const appraisalRef = ref(
                        database,
                        `EmployeeAppraisal/${encodedQuarterString}-${sanitizedEmail}`
                    );

                    let snapshot = await get(appraisalRef)
                    if (snapshot.exists()) {
                        let smm = snapshot.val()[Object.keys(snapshot.val())[0]];
                        setAttrs(smm.attributes)
                        setOv(smm.overallValue)
                        setCmm(smm.comments)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        fetchData();
    }, [attributes])

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
        <div className="border rounded-lg w-full max-w-5xl mx-auto p-10 bg-white">
            <div className="mb-4">
                <h3 style={{ fontSize: '32pt', fontWeight: '600' }}>Employee(Self) Assessment Report</h3>
                <h5>{"For: " + email.name}</h5>
            </div>
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Attributes</TableHead>
                            <TableHead className="w-[40%]">Performance level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attributes != null && (attributes.map((attribute, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <b>{attribute.title}</b>
                                    <br />
                                    {attribute.description}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <div
                                                key={`${index}-${value}`}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    id={`durability-${index}-${value}`}
                                                    name={`durability-${index}`}
                                                    value={value.toString()}
                                                    className="text-green-500"
                                                    checked={attribute.performanceLevel === value}
                                                />
                                                <Label htmlFor={`durability-${index}-${value}`}>
                                                    {value}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
                <br/>
                <h6 style={{ fontWeight: '600' }}>{"Overall Value: " + overallValue}</h6>
                <h6 style={{ fontWeight: '600' }}>Comments: <span style={{ fontWeight: '500'}}>{comments}</span></h6>
                <Button style={{ marginTop: '16px'}} onClick={email.goBack}>Back</Button>
            </div>
        </div>
    )
}