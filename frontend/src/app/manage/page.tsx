"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";

interface Person {
  PersonID: number;
  FirstName: string;
  Surname: string;
  Address: string;
  City: string;
  BirthDate: string;
}

export default function ManagePersons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [newPerson, setNewPerson] = useState({ first_name: "", surname: "", address: "", city: "", birth_date: "" });
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedExistingPerson, setSelectedExistingPerson] = useState<Person | null>(null);

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
    if (!newPerson.first_name || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(newPerson.first_name)) errors.push("first_name");
    if (!newPerson.surname || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(newPerson.surname)) errors.push("surname");
    if (!newPerson.address) errors.push("address");
    if (!newPerson.city || /[^a-zA-ZäöüÄÖÜßÀ-ÿ'\s-]/.test(newPerson.city)) errors.push("city");
    if (!newPerson.birth_date) errors.push("birth_date");

    setErrorFields(errors);
    return errors.length === 0;
  };

  const checkForSimilarPerson = () => {
    const similarPerson = persons.find(
      (p) =>
        p.FirstName === newPerson.first_name &&
        p.BirthDate === newPerson.birth_date &&
        p.PersonID !== selectedExistingPerson?.PersonID // Prüft, dass es sich nicht um dieselbe Person handelt
    );

    if (similarPerson) {
      if (
        similarPerson.Surname !== newPerson.surname ||
        similarPerson.Address !== newPerson.address ||
        similarPerson.City !== newPerson.city
      ) {
        setSelectedExistingPerson(similarPerson);
        setShowConfirmation(true);
        return true;
      }
    }
    return false;
  };

  const handleCreate = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validateInput()) {
      setErrorMessage("Fehlende oder fehlerhafte Eingabe: Vorname, Nachname und Stadt dürfen keine Zahlen oder Sonderzeichen enthalten.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (checkForSimilarPerson()) {
      return;
    }

    addNewPerson();
  };

  const addNewPerson = () => {
    fetch("http://127.0.0.1:4000/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPerson),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.includes("existiert bereits")) {
          setErrorMessage(data.message);
        } else {
          setSuccessMessage("Person erfolgreich hinzugefügt.");
          fetchPersons();
          setNewPerson({ first_name: "", surname: "", address: "", city: "", birth_date: "" });

          setTimeout(() => setSuccessMessage(null), 5000);
        }
      })
      .catch(console.error);
  };

  const handleMergePersons = () => {
    if (!selectedExistingPerson) return;

    fetch(`http://127.0.0.1:4000/persons/${selectedExistingPerson.PersonID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: newPerson.first_name,
        surname: newPerson.surname,
        address: newPerson.address,
        city: newPerson.city,
        birth_date: newPerson.birth_date,
      }),
    })
      .then(() => {
        setSuccessMessage("Eintrag wurde erfolgreich zusammengeführt.");
        fetchPersons();
        setShowConfirmation(false);
        setNewPerson({ first_name: "", surname: "", address: "", city: "", birth_date: "" });

        setTimeout(() => setSuccessMessage(null), 5000);
      })
      .catch(console.error);
  };

  const handleRejectUpdate = () => {
    setShowConfirmation(false);
    addNewPerson();
  };

  const handleDelete = (personID: number) => {
    fetch(`http://127.0.0.1:4000/persons/${personID}`, {
      method: "DELETE",
    })
      .then(() => {
        setSuccessMessage("Person erfolgreich gelöscht.");
        fetchPersons();
        setTimeout(() => setSuccessMessage(null), 5000);
      })
      .catch(console.error);
  };

  return (
    <Layout title="Personen verwalten">
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-center text-green-500">{successMessage}</p>}

        {showConfirmation && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md text-center text-black dark:text-white">
            <p>
              Eine Person mit diesem Namen und Geburtsdatum existiert bereits (ID: {selectedExistingPerson?.PersonID}). 
              Die Angaben unterscheiden sich jedoch in Nachname oder Adresse. Soll der bestehende Eintrag mit den neuen Daten überschrieben werden?
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <button onClick={handleMergePersons} className="btn btn-yellow">Ja, zusammenführen</button>
              <button onClick={handleRejectUpdate} className="btn btn-gray">Nein, neue Person hinzufügen</button>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Vorname"
          value={newPerson.first_name}
          onChange={(e) => setNewPerson({ ...newPerson, first_name: e.target.value })}
          className={`input-field ${errorFields.includes("first_name") ? "error" : ""}`}
        />
        <input
          type="text"
          placeholder="Nachname"
          value={newPerson.surname}
          onChange={(e) => setNewPerson({ ...newPerson, surname: e.target.value })}
          className={`input-field ${errorFields.includes("surname") ? "error" : ""}`}
        />
        <input
          type="text"
          placeholder="Adresse"
          value={newPerson.address}
          onChange={(e) => setNewPerson({ ...newPerson, address: e.target.value })}
          className={`input-field ${errorFields.includes("address") ? "error" : ""}`}
        />
        <input
          type="text"
          placeholder="Stadt"
          value={newPerson.city}
          onChange={(e) => setNewPerson({ ...newPerson, city: e.target.value })}
          className={`input-field ${errorFields.includes("city") ? "error" : ""}`}
        />
        <input
          type="date"
          value={newPerson.birth_date}
          onChange={(e) => setNewPerson({ ...newPerson, birth_date: e.target.value })}
          className={`input-field ${errorFields.includes("birth_date") ? "error" : ""}`}
        />
        <button onClick={handleCreate} className="btn btn-green w-full">Hinzufügen</button>
      </div>

      <ul className="list-container mt-6">
        {persons.map((person) => (
          <li key={person.PersonID} className="list-item">
            <span>
              <strong>ID: {person.PersonID}</strong> - {person.FirstName} {person.Surname}, {person.Address}, {person.City} ({person.BirthDate})
            </span>
            <button className="btn btn-red" onClick={() => handleDelete(person.PersonID)}>Löschen</button>
          </li>
        ))}
      </ul>
      <div className="flex justify-center mt-6">
        <button onClick={() => window.history.back()} className="btn btn-gray w-full max-w-lg text-center">Zurück zum Dashboard</button>
      </div>
    </Layout>
  );
}
