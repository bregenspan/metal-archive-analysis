import csv
import re

with open('MA-band-names_2017-06-09.csv', 'r') as csv_in:
    with open('bands-2017-06-09.csv', 'w+') as csv_out:
        reader = csv.reader(csv_in)
        writer = csv.writer(csv_out)

        for row in reader:
            link = row[1]
            match_name_in_link = re.search('\'>(.*)</a>', link)
            if match_name_in_link is None:
                row[0] = ''
            else:
                row[0] = match_name_in_link.group(1)
                        
            writer.writerow(row)
