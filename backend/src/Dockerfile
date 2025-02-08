# base image
FROM python:3.7-slim-buster

# set the working directory
WORKDIR /app

# copy directory into container /app
COPY requirements.txt ./

# installing and updating pip
RUN pip install --upgrade pip

# install all needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# copy current directory into container /app
COPY . .

# exposes the port 4000
EXPOSE 4000

# when the container launches it runs the app.py
CMD [ "flask", "run", "--host=0.0.0.0", "--port=4000" ]