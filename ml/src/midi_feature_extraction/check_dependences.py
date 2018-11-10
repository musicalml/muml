import os
import psycopg2

#------------------------------------------------------------------------------
#                                jSymbolic
#------------------------------------------------------------------------------

def check_jsymbolic():
    print("Looking for jSymbolic installation...", end=" ")
    if not os.path.exists("thirdparty/jSymbolic_2_2_user"):
        print("not found. Fetching...", end=" ")
        fetch_jsymbolic()
        print("Installation...", end=" ")
        install_jsymbolic()
        print("Done.")
    else:
        print("found.")


def fetch_jsymbolic():
    url = "https://sourceforge.net/projects/jmir/files/jSymbolic/jSymbolic%202.2/jSymbolic_2_2_user.zip"
    os.system("wget {} -P thirdparty".format(url))


def install_jsymbolic():
    os.system("unzip thirdparty/jSymbolic_2_2_user.zip -d thirdparty/")
    os.system("rm thirdparty/jSymbolic_2_2_user.zip")


#------------------------------------------------------------------------------
#                         midifeatures table in database
#------------------------------------------------------------------------------


def check_feature_table():
    conn = psycopg2.connect(host="database", user="postgres",
                            password="postgres", dbname="mldata")

    create_table_if_needed(conn)

    conn.close()


def create_table_if_needed(conn):
    cur = conn.cursor()
    print("Looking for table 'midifeatures'...", end=" ")
    cur.execute("SELECT EXISTS(SELECT * FROM information_schema.tables WHERE table_name='midifeatures');")
    if cur.fetchone()[0]:
        print("found.")
    else:
        print("not found. Creating...")

        query = create_query()
        cur.execute(query)
        conn.commit()
    cur.close()


def create_query():
    feature_names = get_feature_names()
    query = "CREATE TABLE IF NOT EXISTS midifeatures (\n"
    query += "\tfilename varchar PRIMARY KEY,\n"
    for feature_name in feature_names:
        column_name = convert_feature_to_column_name(feature_name)
        query += "\t{} real,\n".format(column_name)
    query = query[:-2] + "\n);"
    return query


def get_feature_names():
    with open("config/feature_names.txt", "r") as f:
        feature_names = f.read().split(",")
    return feature_names


def convert_feature_to_column_name(name):
    newname = name.replace(" ", "_")
    newname = newname.replace("-", "_")
    return newname.lower()

#------------------------------------------------------------------------------
#                                   main
#------------------------------------------------------------------------------


def check_dependences():
    check_jsymbolic()
    check_feature_table()


if __name__ == "__main__":
    check_dependences()
