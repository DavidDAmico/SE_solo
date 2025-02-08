from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import logging
import time


# initialization of the Flask application
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://student:student@flask_db/student'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# class for the database
class Student(db.Model):
    __tablename__ = 'students'
    StudentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FirstName = db.Column(db.String(100), nullable=False)
    Surname = db.Column(db.String(100), nullable=False)

# create tables
def create_tables():
    with app.app_context():
        time.sleep(10)
        db.create_all()

create_tables()


# route to test if it is possible to connect
@app.route('/test', methods=['GET'])
def test():
    try:
        return make_response(jsonify({'message': 'Connected to the database'}), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'Error connecting to the database'}), 500)


# CRUD - operations

# operation to fill the database with context -> for more information: Readme.md
@app.route('/students', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")
        first_name = data.get('first_name')
        surname = data.get('surname')
        new_student = Student(FirstName=first_name, Surname=surname)
        db.session.add(new_student)
        db.session.commit()
        return make_response(jsonify({'message': 'Student created'}), 201)
    except Exception as e:
        logging.error(f"Error creating student: {e}")
        return make_response(jsonify({'message': 'Error creating student'}), 500)

# operation to receive the data which is stored in the database -> for more information: Readme.md 
@app.route('/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        student_list = [{'student_id': student.StudentID, 'first_name': student.FirstName, 'surname': student.Surname} for student in students]
        return make_response(jsonify(student_list), 200)
    except Exception as e:
        logging.error(f"Error getting students: {e}")
        return make_response(jsonify({'message': 'Error getting students'}), 500)

# operation to receive a specific student by id stored in the database -> for more information: Readme.md
@app.route('/students/<student_id>', methods=['GET'])
def get_student_by_id(student_id):
    try:
        student = Student.query.filter_by(StudentID=student_id).first()
        if student:
            student_data = {'student_id': student.StudentID, 'first_name': student.FirstName, 'surname': student.Surname}
            return make_response(jsonify(student_data), 200)
        else:
            return make_response(jsonify({'message': 'Student not found'}), 404)
    except Exception as e:
        logging.error(f"Error getting student: {e}")
        return make_response(jsonify({'message': 'Error getting student'}), 500)

# operation to change specific data stored in the database by id -> for more information: Readme.md
@app.route('/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        new_first_name = data.get('first_name')
        new_surname = data.get('surname')
        student = Student.query.get(int(student_id))
        if not student:
            return make_response(jsonify({'message': 'Student not found'}), 404)
        student.FirstName = new_first_name
        student.Surname = new_surname
        db.session.commit()
        return make_response(jsonify({'message': 'Student updated'}), 200)
    except Exception as e:
        logging.error(f"Error updating student: {e}")
        return make_response(jsonify({'message': 'Error updating student'}), 500)

# operation to delete specific data stored in the database by id -> for more information: Readme.md
@app.route('/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return make_response(jsonify({'message': 'Student not found'}), 404)
        db.session.delete(student)
        db.session.commit()
        return make_response(jsonify({'message': 'Student deleted'}), 200)
    except Exception as e:
        logging.error(f"Error deleting student: {e}")
        return make_response(jsonify({'message': 'Error deleting student'}), 500)

if __name__ == "__main__":
    create_tables()
    app.run(debug=True, host='0.0.0.0')
