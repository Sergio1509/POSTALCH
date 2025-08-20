# database.py
import oracledb

# Función para abrir conexión a Oracle
def get_connection():
    conn = oracledb.connect(
        user="SRODRIGUEZF",
        password="SRODRIGUEZF",
        dsn="190.60.231.121:8080/isispdb.utadeo.edu.co"  
    )
    return conn
