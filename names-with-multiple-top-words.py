"""
Returns list of band names that include multiple of the top 40 words found in metal band names.
"""

import json
import os
import sqlite3

DATA_FOLDER = ".data"
DB_FILE = "bands.db"
db_path = os.path.join(DATA_FOLDER, DB_FILE)

# process: take list of top 50 words found in band names. manually filter out "words" that actually only make sense
# as fragments of other words in this context (e.g. "infer" clearly is intended only for use in context of "infernal")

# 50 top "words"...
#words = ["death", "dark", "blood", "dead", "hell", "mort", "soul", "fall", "night", "hate", "kill", "fire", "evil", "storm", "lord", "infer", "king", "nigh", "angel", "light", "inter", "mind", "human", "moon", "head", "grave", "metal", "shadow", "winter", "dawn", "witch", "lent", "eternal", "demon", "fore", "satan", "chaos", "mass", "dream", "flesh", "ring", "burn", "corp", "rain", "goat", "land", "ther", "last", "black", "with"]

# 40 words left...
#words = ["death", "dark", "blood", "dead", "hell", "mort", "soul", "fall", "night", "hate", "kill", "fire", "evil", "storm", "lord", "king", "angel", "light", "mind", "human", "moon", "head", "grave", "metal", "shadow", "winter", "dawn", "witch", "eternal", "demon", "satan", "chaos", "mass", "dream", "flesh", "ring", "burn", "goat", "land", "black"]

# 20
words = ["death", "dark", "blood", "dead", "hell", "mort", "soul", "fall", "night", "hate", "kill", "fire", "evil", "storm", "lord", "king", "angel", "light", "mind", "human"]

def get_bands(substring):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute("""
          SELECT
              *
          FROM
              bands
          WHERE
              normalized_name LIKE ?
          ORDER BY
              `name` ASC
      """, ("%{}%".format(substring),)):
            yield row


all_overloaded_names = set()

for word in words:
    for word2 in words:
        if word == word2:
            continue

        for band in get_bands("{}%{}".format(word, word2)):
            all_overloaded_names.add(band["name"])
        for band in get_bands("{}%{}".format(word2, word)):
            all_overloaded_names.add(band["name"])

print(json.dumps([name for name in all_overloaded_names], indent=2))
