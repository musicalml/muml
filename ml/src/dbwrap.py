import psycopg2

from time import sleep


def connect():
    connected = False
    while not connected:
        print("Connecting to database...", end=" ")
        try:
            conn = psycopg2.connect(host="database", user="postgres",
                                    password="postgres", dbname="mldata")
            connected = True
            print("done.")
        except psycopg2.OperationalError:
            print("wait 10 sec.")
            sleep(10)
    return conn
