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
  const [similarPerson, setSimilarPerson] = useState<Person | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = () => {
    fetch("http://127.0.0.1:4000/persons")
      .then((res) => res.json())
      .then((data) => setPersons(data.sort((a: Person, b: Person) => a.PersonID - b.PersonID)))
      .catch(console.error);
  };

  const validateInput = () => {
    const errors: string[] = [];

    if (!selectedPerson?.FirstName || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(selectedPerson.FirstName)) errors.push("FirstName");
    if (!selectedPerson?.Surname || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(selectedPerson.Surname)) errors.push("Surname");
    if (!selectedPerson?.Address) errors.push("Address");
    if (!selectedPerson?.City || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(selectedPerson.City)) errors.push("City");
    if (!selectedPerson?.BirthDate) errors.push("BirthDate");

    setErrorFields(errors);
    return errors.length === 0;
  };

  const checkForSimilarPerson = () => {
    if (!selectedPerson) return false;

    const foundPerson = persons.find(
      (p) =>
        p.FirstName === selectedPerson.FirstName &&
        p.BirthDate === selectedPerson.BirthDate &&
        p.PersonID !== selectedPerson.PersonID // Prüft, dass es sich nicht um dieselbe Person handelt
    );

    if (foundPerson) {
      if (
        foundPerson.Surname !== selectedPerson.Surname ||
        foundPerson.Address !== selectedPerson.Address ||
        foundPerson.City !== selectedPerson.City
      ) {
        setSimilarPerson(foundPerson);
        setShowConfirmation(true);
        return true;
      }
    }

    return false;
  };

  const handleMergeAndDelete = async () => {
    if (!selectedPerson || !similarPerson) return;

    try {
      await fetch(`http://127.0.0.1:4000/persons/${similarPerson.PersonID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: selectedPerson.FirstName,
          surname: selectedPerson.Surname,
          address: selectedPerson.Address,
          city: selectedPerson.City,
          birth_date: selectedPerson.BirthDate,
        }),
      });

      await fetch(`http://127.0.0.1:4000/persons/${selectedPerson.PersonID}`, {
        method: "DELETE",
      });

      setSuccessMessage(`Person ID ${selectedPerson.PersonID} wurde mit ID ${similarPerson.PersonID} zusammengeführt.`);
      setShowConfirmation(false);
      fetchPersons();
      setSelectedPerson(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setErrorMessage("Fehler beim Zusammenführen der Personen.");
    }
  };

  const handleUpdateWithCheck = () => {
    if (!selectedPerson) {
      setErrorMessage("Keine Person ausgewählt.");
      return;
    }

    if (!validateInput()) {
      setErrorMessage("Fehlende oder fehlerhafte Eingabe: Vorname, Nachname und Stadt dürfen keine Zahlen oder unerlaubten Zeichen enthalten.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (checkForSimilarPerson()) {
      return;
    }

    handleUpdateWithoutCheck();
  };

  const handleUpdateWithoutCheck = () => {
    if (!selectedPerson) return;

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
          setSuccessMessage(`Person ID ${selectedPerson.PersonID} erfolgreich aktualisiert.`);
          setErrorFields([]);
          fetchPersons();
          setShowConfirmation(false);
          setTimeout(() => {
            setSuccessMessage("");
          }, 5000);
        } else {
          setErrorMessage("Fehler beim Aktualisieren der Person.");
        }
      })
      .catch(() => setErrorMessage("Fehler beim Aktualisieren der Person."));
  };

  const handleRejectUpdate = () => {
    setShowConfirmation(false);
    handleUpdateWithoutCheck();
  };

  return (
    <Layout title="Personen bearbeiten">
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-center text-green-500">{successMessage}</p>}

        {showConfirmation && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md text-center text-black dark:text-white">
            <p>
              Eine Person mit diesem Namen und Geburtsdatum existiert bereits (ID: {similarPerson?.PersonID}). 
              Die Angaben unterscheiden sich jedoch in Nachname oder Adresse. Soll der bestehende Eintrag mit den neuen Daten überschrieben werden?
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <button onClick={handleMergeAndDelete} className="btn btn-yellow">Ja, zusammenführen</button>
              <button onClick={handleRejectUpdate} className="btn btn-gray">Nein, Änderungen speichern</button>
            </div>
          </div>
        )}

        <select
          onChange={(e) => {
            const foundPerson = persons.find((p) => p.PersonID === Number(e.target.value));
            setSelectedPerson(foundPerson ?? null);
            setOriginalPerson(foundPerson ? { ...foundPerson } : null);
            setErrorMessage("");
            setSuccessMessage("");
            setErrorFields([]);
          }}
          className="input-field"
        >
          <option value="">Person auswählen</option>
          {persons.map((person) => (
            <option key={person.PersonID} value={person.PersonID}>
              {person.PersonID} - {person.FirstName} {person.Surname}
            </option>
          ))}
        </select>

        {selectedPerson && (
          <>
            <input type="text" placeholder="Vorname" value={selectedPerson.FirstName}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, FirstName: e.target.value })}
              className={`input-field ${errorFields.includes("FirstName") ? "error" : ""}`} />
            <input type="text" placeholder="Nachname" value={selectedPerson.Surname}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, Surname: e.target.value })}
              className={`input-field ${errorFields.includes("Surname") ? "error" : ""}`} />
            <input type="text" placeholder="Adresse" value={selectedPerson.Address}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, Address: e.target.value })}
              className={`input-field ${errorFields.includes("Address") ? "error" : ""}`} />
            <input type="text" placeholder="Stadt" value={selectedPerson.City}
              onChange={(e) => setSelectedPerson({ ...selectedPerson, City: e.target.value })}
              className={`input-field ${errorFields.includes("City") ? "error" : ""}`} />

            <button onClick={handleUpdateWithCheck} className="btn btn-yellow w-full">Person aktualisieren</button>
          </>
        )}
      <ul className="list-container mt-6">
          {persons.map((person) => (
            <li key={person.PersonID} className="list-item">
              <span><strong>ID: {person.PersonID}</strong> - {person.FirstName} {person.Surname}, {person.Address}, {person.City} ({person.BirthDate})</span>
            </li>
          ))}
        </ul>

        <button onClick={() => router.push("/")} className="btn btn-gray w-full max-w-lg">Zurück zum Dashboard</button>
      </div>

    </Layout>
  );
}
