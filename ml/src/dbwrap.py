import psycopg2

from time import sleep

# features table name
midifeatures = "api_midifilter"


def connect():
    connected = False
    while not connected:
        print("Connecting to database...", end=" ")
        try:
            conn = psycopg2.connect(host="database", user="postgres",
                                    password="postgres", dbname="muml")

            connected = True
            print("done.")
        except psycopg2.OperationalError:
            print("wait 10 sec.")
            sleep(10)
    return conn
