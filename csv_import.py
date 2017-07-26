"""
This imports a CSV of data retrieved from metal-archives.com band listing AJAX requests
into SQLite, extracting some further details from the HTML in the CSV (including metal-archives'
primary key for each band), and creating a "bands" table with the fields:

 * id
 * link
 * name
 * normalized_name (lowercased version of name with spaces removed, for search)
 * country
 * genre
 * status
"""

import argparse
import csv
import sqlite3
import re
import os

parser = argparse.ArgumentParser(
        description='Import CSV of data scraped from metal-archives.com to SQLite database')
parser.add_argument('input_file', help='Path to the CSV file to import')
args = parser.parse_args()

DATA_PATH = '.data'
DB_FILE = 'bands.db'

csv_filename = args.input_file
DB_FILENAME = os.path.join(DATA_PATH, DB_FILE)

with open(csv_filename, 'r') as csv_in:
    with sqlite3.connect(DB_FILENAME) as conn:
        reader = csv.reader(csv_in)
        cur = conn.cursor()
        cur.execute('DROP TABLE IF EXISTS `bands`')
        cur.execute('''CREATE TABLE `bands` (
                        id INTEGER PRIMARY KEY,
                        link TEXT,
                        name TEXT,
                        normalized_name TEXT,
                        country TEXT,
                        genre TEXT,
                        status CHAR(50)
                    )''')

        for row in reader:
            (i, link, country, genre, status,) = row

            # Clean out HTML tags from status field
            status = re.sub('<.*?>', '', status)

            link_id_name = re.search('<a href=\'(.*\/(\d+))\'>(.*)</a>', link)
            if link_id_name is not None:
                link = link_id_name.group(1)
                id = link_id_name.group(2)
                name = link_id_name.group(3)
                normalized_name = name.replace(' ', '').lower()

                cur.execute('''
                    INSERT INTO
                        `bands`
                        (id, link, name, normalized_name, country, genre, status)
                    VALUES
                        (?, ?, ?, ?, ?, ?, ?)
                    ''', (id, link, name, normalized_name, country, genre, status,))
