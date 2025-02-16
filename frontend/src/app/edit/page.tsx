"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

interface Person {
  PersonID: number;
  FirstName: string;
  Surname: string;
  Address: string;
  City: string;
  BirthDate: string;
}

export default function EditPersons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [originalPerson, setOriginalPerson] = useState<Person | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = () => {
    fetch("http://127.0.0.1:4000/persons")
      .then((res) => res.json())
      .then((data) => setPersons(data))
      .catch(console.error);
  };

  const handleUpdate = () => {
    if (!selectedPerson) {
      setErrorMessage("Keine Person ausgewählt.");
      return;
    }

    // Sicherstellen, dass alle Felder ausgefüllt sind
    const updatedPerson = {
      FirstName: selectedPerson.FirstName.trim(),
      Surname: selectedPerson.Surname.trim(),
      Address: selectedPerson.Address.trim(),
      City: selectedPerson.City.trim(),
      BirthDate: selectedPerson.BirthDate.trim(),
    };

    const emptyFields = Object.entries(updatedPerson)
      .filter(([_, value]) => value === "")
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setErrorMessage("Alle Felder müssen ausgefüllt sein.");
      setInvalidFields(emptyFields);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    if (
      originalPerson &&
      JSON.stringify(originalPerson) === JSON.stringify(selectedPerson)
    ) {
      setInfoMessage("Es wurde kein Eintrag verändert.");
      setTimeout(() => setInfoMessage(""), 5000);
      return;
    }

    // **Hier ist die Korrektur:**
    fetch(`http://127.0.0.1:4000/persons/${selectedPerson.PersonID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: selectedPerson.FirstName,
        surname: selectedPerson.Surname,
        address: selectedPerson.Address,
        city: selectedPerson.City,
        birth_date: selectedPerson.BirthDate,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setSuccessMessage("Person erfolgreich aktualisiert.");
          setInvalidFields([]); // Zurücksetzen der roten Felder
          setTimeout(() => {
            setSuccessMessage("");
            fetchPersons(); // **Neu laden der Daten nach Update**
          }, 1000);

          setCountdown(5);
          let secondsLeft = 5;
          const interval = setInterval(() => {
            if (secondsLeft > 1) {
              setCountdown(--secondsLeft);
            } else {
              clearInterval(interval);
              router.push("/");
            }
          }, 1000);
        } else {
          setErrorMessage("Fehler beim Aktualisieren der Person.");
        }
      })
      .catch(() => setErrorMessage("Fehler beim Aktualisieren der Person."));
  };

  return (
    <Layout title="Personen bearbeiten">
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        {infoMessage && <p className="text-orange-500">{infoMessage}</p>}

        <select
          onChange={(e) => {
            const foundPerson = persons.find((p) => p.PersonID === Number(e.target.value));
            setSelectedPerson(foundPerson ?? null);
            setOriginalPerson(foundPerson ? { ...foundPerson } : null);
            setErrorMessage("");
            setSuccessMessage("");
            setInfoMessage("");
            setInvalidFields([]);
          }}
          className="input-field"
        >
          <option value="">Person auswählen</option>
          {persons.map((person) => (
            <option key={person.PersonID} value={person.PersonID}>
              {person.FirstName} {person.Surname}
            </option>
          ))}
        </select>

        {selectedPerson && (
          <>
            <input
              type="text"
              placeholder="Vorname"
              value={selectedPerson.FirstName}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, FirstName: e.target.value })}
              className={`input-field ${invalidFields.includes("FirstName") ? "border-red-500" : ""}`}
            />
            <input
              type="text"
              placeholder="Nachname"
              value={selectedPerson.Surname}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, Surname: e.target.value })}
              className={`input-field ${invalidFields.includes("Surname") ? "border-red-500" : ""}`}
            />
            <input
              type="text"
              placeholder="Adresse"
              value={selectedPerson.Address}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, Address: e.target.value })}
              className={`input-field ${invalidFields.includes("Address") ? "border-red-500" : ""}`}
            />
            <input
              type="text"
              placeholder="Stadt"
              value={selectedPerson.City}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, City: e.target.value })}
              className={`input-field ${invalidFields.includes("City") ? "border-red-500" : ""}`}
            />
            <input
              type="date"
              value={selectedPerson.BirthDate}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, BirthDate: e.target.value })}
              className={`input-field ${invalidFields.includes("BirthDate") ? "border-red-500" : ""}`}
            />

            <button onClick={handleUpdate} className="btn btn-yellow w-full">Speichern</button>
          </>
        )}

        {countdown !== null && (
          <p className="text-center text-gray-600 mt-4">
            Weiterleitung zum Dashboard in {countdown} Sekunden...
          </p>
        )}

        <button onClick={() => router.push("/")} className="btn btn-gray w-full">Zurück zum Dashboard</button>
      </div>
    </Layout>
  );
}
