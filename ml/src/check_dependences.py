import os

from midi_feature_extraction.check_dependences import check_dependences as cd_midi_features_extraction


def check_directory_existance(dirname):
    print("Looking for '{}' directory...".format(dirname), end=" ")
    if not os.path.exists(dirname):
        print("not found. Created.")
        os.mkdir(dirname)
    else:
        print("found.")


def main():
    check_directory_existance("thirdparty")
    check_directory_existance("logs")

    cd_midi_features_extraction()


if __name__ == "__main__":
    main()
