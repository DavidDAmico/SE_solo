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
    if (!newPerson.first_name || /\d/.test(newPerson.first_name)) errors.push("first_name");
    if (!newPerson.surname || /\d/.test(newPerson.surname)) errors.push("surname");
    if (!newPerson.address) errors.push("address");
    if (!newPerson.city || /\d/.test(newPerson.city)) errors.push("city");
    if (!newPerson.birth_date) errors.push("birth_date");

    setErrorFields(errors);
    return errors.length === 0;
  };

  const handleCreate = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validateInput()) {
      setErrorMessage("Alle Felder müssen korrekt ausgefüllt sein.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

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
          type="text"
          placeholder="Geburtsdatum"
          value={newPerson.birth_date}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => (e.target.type = "text")}
          onChange={(e) => setNewPerson({ ...newPerson, birth_date: e.target.value })}
          className={`input-field ${errorFields.includes("birth_date") ? "error" : ""}`}
        />
        <button onClick={handleCreate} className="btn btn-green w-full">Hinzufügen</button>
      </div>

      {successMessage && <p className="text-center text-green-600 mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-center text-red-600 mt-4">{errorMessage}</p>}

      <ul className="list-container mt-6">
        {persons.length === 0 ? (
          <p className="text-gray-600 text-center">Keine Personen vorhanden.</p>
        ) : (
          persons.map((person) => (
            <li key={person.PersonID} className="list-item">
              <span>
                <strong>ID: {person.PersonID}</strong> - {person.FirstName} {person.Surname}, {person.Address}, {person.City} ({person.BirthDate})
              </span>
              <button className="btn btn-red" onClick={() => handleDelete(person.PersonID)}>Löschen</button>
            </li>
          ))
        )}
      </ul>

      <div className="flex justify-center mt-6">
        <button onClick={() => window.history.back()} className="btn btn-gray w-full max-w-lg">Zurück zum Dashboard</button>
      </div>
    </Layout>
  );
}
