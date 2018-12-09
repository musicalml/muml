import bottle

from midi_feature_extraction.migrate import make_migrations, migrate
from cheroot.wsgi import Server as WSGIServer
from dbwrap import connect

conn = None
app = bottle.Bottle()


@app.route("/<midi:re:.+>/rawfeature/<feature:re:[0-9a-zA-Z_-]*>")
def foo(midi, feature):
    print(midi, feature)
    cur = conn.cursor()
    midi = midi.replace("'", "''")
    feature = feature.replace(" ", "_")
    feature = feature.replace("-", "_")
    feature = feature.lower()
    print(midi, feature)
    query = "SELECT {} FROM midifeatures WHERE filename = '{}';".format(feature, midi)
    cur.execute(query)
    value = cur.fetchone()[0]
    cur.close()
    return str(value)


@app.route("/manage/update_midifeatures")
def bar():
    if make_migrations(conn) > 0:
        migrate(conn)


def main():
    global conn
    conn = connect()
    server = WSGIServer(('0.0.0.0', 9000), app, server_name='ml', numthreads=2)
    server.start()
    conn.close()


if __name__ == "__main__":
    main()
