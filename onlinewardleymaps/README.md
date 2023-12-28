# Online Wardley Maps server

Version: 44ce638d9a1bef6e629301a840280a904cbc20e4

## Update

Update the Version strings in the Dockerfile, Doc and Java files. Nothing more needed. You should find all places with find and replace.

## Architecture

The docker container runs 2 separate processes:
- The Kroki companion server, which runs on port 8007 and is exposed
- The Online Wardley Maps server, which runs on port 3000 and is not exposed
