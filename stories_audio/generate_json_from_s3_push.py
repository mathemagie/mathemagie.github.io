import json
import subprocess

# Command line output
# Execute the command and capture the output
output = subprocess.check_output(["aws", "s3", "ls", "audiod"]).decode("utf-8")

# Split the output into lines
lines = output.strip().split('\n')

# Extract the file names from each line and add prefix
tracks = [line.split()[-1] for line in lines]

# Create the JSON structure
data = {"tracks": tracks}

# Convert the JSON structure to a string
json_data = json.dumps(data, indent=4)

# Print the JSON data
print(json_data)

# Write the JSON data to a file
with open("tracks.json", "w") as file:
    file.write(json_data)


