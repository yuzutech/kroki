# Online Wardley Maps server

Version: 44ce638d9a1bef6e629301a840280a904cbc20e4

## Update

Update the Version strings in the Dockerfile, Doc and Java files. Nothing more needed. You should find all places with find and replace.

## Architecture

The docker container runs 3 separate processes:
- The Kroki companion server, which runs on port 8007 and is exposed
- The Online Wardley Maps server, which runs on port 3000 and is not exposed
- The supervisord is the entrypoint and starts the other two processes

## Testing

Use the following command to test the server, after starting the docker containers:
http://localhost:8000/onlinewardleymaps/png/eNplUrFugzAQ3f0VtxciMIHAkqFdKnWJlEodIgYnuSSoro2wCcrf92wIkGQB-97z83t3tpWVCN8oYHvRNRPqcNENvLemUmgM7KJFkQYQLbKkvIObdi-rwwSt8pId9F-tFSoLH20N-uQVibEq_OG4BCn2KGEXUyFcPh9wzORVaxDJPJTHc-hTW_gRFhtHSLknRHPCCCa5B_kc_ELrYhO69NpJOhoM01UAZBCvWl7xziQTfIyQBbCaq210118V-wiTFCcpHo1aPY-8FCMjJuecgt0bHq6n_rG-0Q-laenLD_tnfGwRG1fh-qUwBGT9P1x7k4xmrbQVttIKYtj1jaJPUQa0jvLAjbYsYWuFOormWJH9M9Q-oJBSd2bonAGrYch_EsZdPpPmfgT9gGgEzlbn51YZ0PtrpVsDdAF0KCX8Kt2p2Wn_OrPIHY5ouozqCG8CzqiwoQfq96KuUTR4dFzez5peMjP2RqE7ci7xxv4BoXbvkw==
