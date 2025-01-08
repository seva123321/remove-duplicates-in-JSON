# remove-duplicates-in-JSON
This code allows you to load json files and remove duplicate lines in them and then save "unique" file.json.

Multi-file upload is possible. Files can be uploaded by dragging and dropping, as well as by selecting a file from a folder. Only json files can be uploaded.

Removal of duplicates of uploaded files occurs in the background using Web Workers API. This allows you not to load the main thread.

After all operations you can download the file without duplicates.