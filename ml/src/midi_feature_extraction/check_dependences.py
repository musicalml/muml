import os
import psycopg2

from dbwrap import connect

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
    conn = connect()

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
    histogram_nbins = {
        "Basic_Pitch_Histogram": 128,
        "Pitch_Class_Histogram": 12,
        "Folded_Fifths_Pitch_Class_Histogram": 12,
        "Melodic_Interval_Histogram": 128,
        "Vertical_Interval_Histogram": 128,
        "Wrapped_Vertical_Interval_Histogram": 12,
        "Chord_Type_Histogram": 11,
        "Rhythmic_Value_Histogram": 12,
        "Rhythmic_Value_Median_Run_Lengths_Histogram": 12,
        "Rhythmic_Value_Variability_in_Run_Lengths_Histogram": 12,
        "Beat_Histogram_Tempo_Standardized": 161,
        "Beat_Histogram": 161,
        "Time_Prevalence_of_Pitched_Instruments": 128,
        "Note_Prevalence_of_Unpitched_Instruments": 47,
        "Note_Prevalence_of_Pitched_Instruments": 128,
        "Unpitched_Instruments_Present": 47,
        "Pitched_Instruments_Present": 128,
        "Initial_Time_Signature": 2,
    }
    with open("config/jsymbolic_config.txt") as f:
        line = f.readline()
        while not line.startswith("<features_to_extract>"):
            line = f.readline()
        names = [name.strip().replace(" ", "_") for name in f.readlines()]
    feature_names = []
    for name in names:
        if name in histogram_nbins:
            for i in range(histogram_nbins[name]):
                feature_names.append(name + "_{}".format(i))
        else:
            feature_names.append(name)
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
