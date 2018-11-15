import os
import psycopg2

JSYMB = "java -Xmx6g -jar thirdparty/jSymbolic_2_2_user/jSymbolic2.jar -configrun config/jsymbolic_config.txt "


def jsymb(midi_dir):
    os.system(JSYMB + midi_dir + " /tmp/fv.xml /tmp/fd.xml")
    os.system("rm /tmp/fv.xml /tmp/fd.xml")


def make_migrations(conn):
    print("Creating migrations...", end=" ")

    midi_intable = extract_exised_filenames(conn)
    midi_all = set(os.listdir("../midi_import"))
    midi_toinsert = midi_all.difference(midi_intable)

    L = len(midi_toinsert)
    if L > 0:
        print("{} new midi files found. Creating migrations for them...".format(len(midi_toinsert)), end=" ")
        if not os.path.exists("../migrations"):
            os.mkdir("../migrations")
        for midi in midi_toinsert:
            src = os.path.join("../midi_import", midi)
            dst = os.path.join("../migrations", midi)
            os.system("cp \"{}\" \"{}\"".format(src, dst))
        print("done.")
    else:
        print("nothing to insert.")

    return L


def extract_exised_filenames(conn):
    cur = conn.cursor()
    cur.execute("SELECT filename FROM midifeatures;")
    filenames = set([r[0] for r in cur.fetchall()])
    cur.close()
    return filenames


def migrate(conn):
    extract_features()
    insert_into_table(conn)
    clear_migrations()
    delete_corrupted_midi(conn)


def delete_corrupted_midi(conn):
    print("Deleting corrupted midi files...", end=" ")
    midi_intable = extract_exised_filenames(conn)
    midi_all = set(os.listdir("../midi_import"))
    midi_corrupted = midi_all.difference(midi_intable)
    print("{} corrupted files".format(len(midi_corrupted)))
    for midi in midi_corrupted:
        os.system("rm ../midi_import/\"{}\"".format(midi))


def clear_migrations():
    if os.path.exists("../migrations"):
        os.system("rm -rf ../migrations")
    if os.path.exists("/tmp/feature_values.csv"):
        os.system("rm /tmp/feature_values.csv")


def extract_features():
    print("Extracting features...", end=" ")
    os.system(JSYMB + "../migrations /tmp/feature_values.xml /tmp/feature_descriptions.xml")
    os.system("rm /tmp/feature_values.xml /tmp/feature_descriptions.xml")
    print("done.")


def insert_into_table(conn):
    if os.path.exists("/tmp/feature_values.csv"):
        print("Inserting into table 'midifeatures'...", end=" ")
        cur = conn.cursor()

        query, N = create_insert_query()
        if N > 0:
            cur.execute(query)
            conn.commit()

        cur.close()
        print("done.")


def create_insert_query():
    query = "INSERT INTO midifeatures VALUES "
    N = 0
    with open("/tmp/feature_values.csv", "r") as f:
        f.readline()
        for line in f:
            line = line.strip()
            line = line.split(",")
            line[0] = "'" + line[0].split("/")[-1][:-1] + "'"
            line = ",".join(line)
            query += "({}),".format(line)
            N += 1
    query = query[:-1] + ";"
    return query, N


if __name__ == "__main__":
    conn = psycopg2.connect(host="database", user="postgres",
                            password="postgres", dbname="mldata")
    if make_migrations(conn) > 0:
        migrate(conn)
    conn.close()
