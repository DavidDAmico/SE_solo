# Verwende das offizielle MariaDB-Image
FROM mariadb:10.6

# Installiere notwendige Pakete für MariaDB
RUN apt-get update && \
    apt-get install -y python3-pip && \
    pip3 install requests && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Setze die Standardumgebung für MariaDB
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=student
ENV MYSQL_USER=student
ENV MYSQL_PASSWORD=student

# Kopiere SQL-Dateien für die Initialisierung
COPY db_tables/*.sql /docker-entrypoint-initdb.d/
