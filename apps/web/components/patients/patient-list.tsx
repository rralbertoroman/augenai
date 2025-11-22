import { Patient } from "@/hooks/use-patients";

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientList({
  patients,
  selectedPatient,
  onSelectPatient,
}: PatientListProps) {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th className="px-6 py-3" scope="col">
            Nombre
          </th>
          <th className="px-6 py-3" scope="col">
            Edad
          </th>
          <th className="px-6 py-3" scope="col">
            Género
          </th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient, idx) => (
          <tr
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className={`cursor-pointer ${
              idx === patients.length - 1 ? "" : "border-b"
            } ${
              selectedPatient?.id === patient.id
                ? "bg-primary/20 hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/40"
                : "bg-card hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            }`}
          >
            <th
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
              scope="row"
            >
              {patient.name}
            </th>
            <td
              className={`px-6 py-4 ${
                selectedPatient?.id === patient.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {calculateAge(patient.dateOfBirth)}
            </td>
            <td
              className={`px-6 py-4 ${
                selectedPatient?.id === patient.id
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : ""
              }`}
            >
              {patient.gender === "male" ? "Masculino" : "Femenino"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
