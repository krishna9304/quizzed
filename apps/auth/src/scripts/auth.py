from iterapi import Student
import sys
import json
import os


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps(
            {'message': 'Usage: python auth.py <username> <password>'}))
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]

    try:
        st = None
        with HiddenPrints():
            student = Student(username, password)
            st = json.dumps(student.getInfo())
        print(st)
    except Exception as e:
        print(json.dumps({'message': str(e)}))
