import csv
import re

with open('MA-band-names_2017-06-09.csv', 'r') as csv_in:
    with open('bands-2017-06-09.csv', 'w+') as csv_out:
        reader = csv.reader(csv_in)
        writer = csv.writer(csv_out)

        writer.writerow(['id', 'link', 'name', 'country', 'genre', 'status'])

        for row in reader:
            (i, link, country, genre, status,) = row

            status =  re.sub('<.*?>', '', status) # clean out HTML tags from Status field

            link_id_name = re.search('<a href=\'(.*\/(\d+))\'>(.*)</a>', link)
            if link_id_name is not None:
                link = link_id_name.group(1)
                id = link_id_name.group(2)
                name = link_id_name.group(3)
                writer.writerow([id, link, name, country, genre, status])
                        
