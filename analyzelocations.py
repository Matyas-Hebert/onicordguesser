import os
import json
import matplotlib.pyplot as plt
from math import sqrt as sqrt

class Photosphere:
    def __init__(self, data, file):
        self.x = data["X"]
        self.y = data["Y"]
        self.z = data["Z"]
        self.country = getcountry(self.x, self.z)
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
names = ["Admantie a okolí", "Solanis", "Pensaiza a spawn", "Manito", "Dinnerbone jungle a matoušův kraj", "Nebeské impérium"]
colors = {
    "2026-06-03": "red",
    "2026-06-02": "orange",
    "2026-05-31": "yellow",
    "2026-05-30": "green",
    "2026-05-29": "blue",
    "2026-05-28": "purple",
    "2026-06-07": "black",
    "2026-06-09": "white",
    "2026-06-12": "gray"
    }
photospheres = []

def getcountry(x, z):
    if x >= 8000:
        return 3 # manito
    if z <= 2000:
        return 2 # pensaiza, kilae, spawn
    if x <= 600:
        return 1 # solanis
    if x >= 5500:
        return 4 # dinnerbone jungle
    if x >= 3000:
        return 5 # Nebeské impérium
    else:
        return 0 # Admantie, The Null, Sudurvik, Copertura, Poosterni, Aj..
    
def getdistance(dataold, datanew):
    xd = (datanew["X"]-dataold["X"])**2
    xz = (datanew["Z"]-dataold["Z"])**2
    vmc = 2
    return sqrt((sqrt(xd+xz)**2)+((vmc*(datanew["Y"]-dataold["Y"]))**2))

n = 60

datalist = []

for e in os.scandir(path):
    if not e.is_file():
        #print(e.name)
        for f in os.scandir(e):
            if (f.name == "metadata.json"):
                with open(f, 'r') as file:
                    data = json.load(file)
                    
                #if (data["Date"] == "2026-06-03"):
                 #  break
                    
                photosphere = Photosphere(data, e.name)
                
                currentday = False
                for i in photospheres:
                    if (i.date == photosphere.date):
                        currentday = True
                    dist = getdistance(photosphere.getdata(), i.getdata())
                    
                    mult = 1
                    if (dist < 20):
                        mult = max(0, (dist-5)/15)
                    
                    if currentday:
                        photosphere.weight *= sqrt(mult)
                        i.weight *= sqrt(mult)
                    else:
                        i.weight *= mult                        
                    
                photospheres += [photosphere]
                
totalweight = 0
totalphotos = 0
minweight = 1
zerocount = 0
for i in photospheres:
    col = "blue"
    #""i.x >= 200 and i.x <= 600 and i.z <= 4600 and i.z >= 4000""
    if(True):
        col = colors[i.date]
        #print(i.weight)
        if (i.weight < minweight and i.weight > 0):
            minweight = i.weight
        if (i.weight == 0):
            zerocount += 1
            print(i.x, i.z, "NOT IMPORTANT", i.file)
        totalweight += i.weight
        totalphotos+=1
        plt.plot(i.x, i.z, 'o', ms=5, alpha=i.weight*0.5, color=col)
    # col = i%cols
    # row = i//cols
    # axes[row, col].plot(xpoints[i][0:-n], zpoints[i][0:-n], 'o', ms=5, alpha=0.3, color="blue")
    # axes[row, col].plot(xpoints[i][-n:], zpoints[i][-n:], 'o', ms=5, alpha=0.3, color="red")
    # axes[row, col].invert_yaxis()
    # axes[row, col].set_title(names[i]+" ("+str(len(xpoints[i]))+")")
    # axes[row, col].axis('equal')
    # #plt.plot([0]*235, ypoints, 'o', ms=5, alpha=0.3)

print("TOTAL WEIGHT: ", totalweight)
print("PHOTOSPHERES: ", totalphotos)
print("RAREST PHOTOSPHERE: ", minweight)
print("IMPOSSIBLE PHOTOSPHERES: ", zerocount)
plt.gca().invert_yaxis()
plt.show()