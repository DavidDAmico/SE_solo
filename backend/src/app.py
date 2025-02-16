from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import logging
import time
import sqlalchemy.exc

# initialize the flask api
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mariadb+pymysql://student:student@flask_db/student'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# class to define a person
class Person(db.Model):
    __tablename__ = 'persons'
    PersonID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FirstName = db.Column(db.String(100), nullable=False)
    Surname = db.Column(db.String(100), nullable=False)
    Address = db.Column(db.String(255), nullable=False)
    City = db.Column(db.String(100), nullable=False)
    BirthDate = db.Column(db.Date, nullable=False)

# create tables
def create_tables():
    with app.app_context():
        for _ in range(10):
            try:
                db.create_all()
                break
            except sqlalchemy.exc.OperationalError:
                time.sleep(2)

# insert a default person to the database
def insert_default_person():
    with app.app_context():
        if not Person.query.filter_by(FirstName="Max", Surname="Müller", Address="Musterstraße 1", City="Berlin", BirthDate="1992-07-10").first():
            default_person = Person(
                FirstName="Eugenie",
                Surname="Giesbrecht",
                Address="Paulinenstr. 50",
                City="Stuttgart",
                BirthDate="2025-02-16"
            )
            db.session.add(default_person)
            db.session.commit()

create_tables()
insert_default_person()

# test route
@app.route('/test', methods=['GET'])
def test():
    return make_response(jsonify({'message': 'Flask API is running.'}), 200)

# post route
@app.route('/persons', methods=['POST'])
def create_person():
    try:
        data = request.get_json()
        first_name = data.get('first_name')
        surname = data.get('surname')
        address = data.get('address')
        city = data.get('city')
        birth_date = data.get('birth_date')

        existing_person = Person.query.filter_by(FirstName=first_name, Address=address, City=city, BirthDate=birth_date).first()
        
        if existing_person:
            if existing_person.Surname != surname:
                existing_person.Surname = surname
                db.session.commit()
                return make_response(jsonify({'message': 'Surname updated successfully'}), 200)
            return make_response(jsonify({'message': 'Person already exists'}), 400)
        
        new_person = Person(FirstName=first_name, Surname=surname, Address=address, City=city, BirthDate=birth_date)
        db.session.add(new_person)
        db.session.commit()
        return make_response(jsonify({'message': 'Person successfully added'}), 201)
    except Exception as e:
        db.session.rollback()
        logging.error(f'An error occurred while creating a person: {str(e)}')
        return make_response(jsonify({'message': 'An error occurred while creating a person', 'error': str(e)}), 500)

# get route for all persons
@app.route('/persons', methods=['GET'])
def get_persons():
    persons = Person.query.order_by(Person.PersonID).all()
    result = [{
        'PersonID': p.PersonID,
        'FirstName': p.FirstName,
        'Surname': p.Surname,
        'Address': p.Address,
        'City': p.City,
        'BirthDate': str(p.BirthDate)
    } for p in persons]
    return jsonify(result)

# get route for a person by id
@app.route('/persons/<int:person_id>', methods=['GET'])
def get_person_by_id(person_id):
    person = Person.query.get(person_id)
    if person:
        return jsonify({
            'PersonID': person.PersonID,
            'FirstName': person.FirstName,
            'Surname': person.Surname,
            'Address': person.Address,
            'City': person.City,
            'BirthDate': str(person.BirthDate)
        })
    return make_response(jsonify({'message': 'Person not found'}), 404)

# put route to update a person
@app.route('/persons/<int:person_id>', methods=['PUT'])
def update_person(person_id):
    try:
        person = Person.query.get(person_id)
        if not person:
            return make_response(jsonify({'message': 'Person not found'}), 404)
        
        data = request.get_json()
        person.FirstName = data.get('first_name', person.FirstName)
        person.Surname = data.get('surname', person.Surname)
        person.Address = data.get('address', person.Address)
        person.City = data.get('city', person.City)
        person.BirthDate = data.get('birth_date', person.BirthDate)
        
        db.session.commit()
        return make_response(jsonify({'message': 'Person updated successfully'}), 200)
    except Exception as e:
        db.session.rollback()
        logging.error(f'An error occurred while updating a person: {str(e)}')
        return make_response(jsonify({'message': 'An error occurred while updating a person', 'error': str(e)}), 500)

# route to delete a person by id
@app.route('/persons/<int:person_id>', methods=['DELETE'])
def delete_person(person_id):
    person = Person.query.get(person_id)
    if not person:
        return make_response(jsonify({'message': 'Person not found'}), 404)
    db.session.delete(person)
    db.session.commit()
    return make_response(jsonify({'message': 'Person deleted'}), 200)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
