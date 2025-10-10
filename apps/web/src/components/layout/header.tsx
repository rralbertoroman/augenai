import React from "react";
import { Button } from "../ui/button";

const Header:React.FC = () => {
    return (
        <div className="flex flex-row items-center justify-between w-full px-5 py-4 bg-gradient-to-b from-gray-50 to-gray-200">
            <Button variant={"link"}>AugenAI</Button>
            <div className="flex flex-row w-fit space-x-3">
                <Button variant={"link"}>Patients</Button>
                <Button variant={"link"}>Appointments</Button>
                <Button variant={"link"}>User</Button>
            </div>
        </div>
    )
}

export default Header;