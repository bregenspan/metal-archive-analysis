import csv
import sqlite3
import re

"""
Imports CSV of band data scraped from metal-archives.com
to SQLite database.
"""

CSV_FILENAME = 'MA-band-names_2017-06-09.csv'
DB_FILENAME = 'bands.db'

with open(CSV_FILENAME, 'r') as csv_in:
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

            status =  re.sub('<.*?>', '', status) # clean out HTML tags from Status field

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
                        
