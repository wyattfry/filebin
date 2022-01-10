INTERFACE

Download:
see a text input box, type in n keywords

Upload:
or drag and drop a file
then you see the n keywords for that file



IMPLEMENTATION


## Receive from client:
save file with its given name in a directory

project.zip

Server prepend
            keywords

system.minute.portion.project.zip
interference.sodium.jurisdiction.project.zip

## Send to client:

receive keywords from client
e.g. "system minute portion"
scan files for keywords
send to client


## Clean up:
worker that deletes files older than X every T


Questions:
- how does server track n keyword <--> file associations?
  - 
- how to prevent files w same name to overwrite?
- how does server delete expired files?