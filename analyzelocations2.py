import os
import json
from math import sqrt as sqrt

class Photosphere:
    def __init__(self, data, file):
        self.x = data["X"]
        self.y = data["Y"]
        self.z = data["Z"]
        self.date = data["Date"]
        self.weight = 1
        self.file = file
        
    def getdata(self):
        return {
            "X": self.x,
            "Y": self.y,
            "Z": self.z
        }

path = "panoramas"
photospheres = []

def getdistance(dataold, datanew):
    xd = (datanew["X"] - dataold["X"])**2
    xz = (datanew["Z"] - dataold["Z"])**2
    vmc = 2
    return sqrt((sqrt(xd + xz)**2) + ((vmc * (datanew["Y"] - dataold["Y"]))**2))

# 1. Scan folders and calculate weights
for e in os.scandir(path):
    if not e.is_file():
        for f in os.scandir(e):
            if f.name == "metadata.json":
                with open(f, 'r') as file:
                    data = json.load(file)
                    
                photosphere = Photosphere(data, e.name)
                
                currentday = False
                for i in photospheres:
                    if i.date == photosphere.date:
                        currentday = True
                    dist = getdistance(photosphere.getdata(), i.getdata())
                    
                    mult = 1
                    if dist < 20:
                        mult = max(0, (dist - 5) / 15)
                    
                    if currentday:
                        photosphere.weight *= sqrt(mult)
                        i.weight *= sqrt(mult)
                    else:
                        i.weight *= mult                        
                    
                photospheres.append(photosphere)

# 2. Format results into the requested array structure
output_data = []
for p in photospheres:
    output_data.append({
        "name": "panoramas/"+p.file,  # Name of the folder
        "X": p.x,
        "Y": p.y,
        "Z": p.z,
        "date": p.date,
        "weight": p.weight
    })

# 3. Save the array to a JSON file
output_file_path = "weights.json"
with open(output_file_path, 'w', encoding='utf-8') as json_file:
    json.dump(output_data, json_file, indent=2)

print(f"Successfully processed {len(output_data)} panoramas and saved to {output_file_path}!")