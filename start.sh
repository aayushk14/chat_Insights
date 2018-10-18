#!/bin/bash
cd <src-folder>
export MONGO_URL=mongo-ip-with-db
meteor --settings ../settings.json --port 4020
