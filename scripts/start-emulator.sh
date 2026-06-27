#!/bin/bash

# Firebase Emulator Suite startup script
# Starts Firestore, Auth, and Emulator UI for local development

echo "Starting Firebase Emulator Suite..."
echo "Firestore will be available at http://localhost:4000"
echo "Auth emulator will be available at http://localhost:9099"
echo "Emulator UI will be available at http://localhost:4001"
echo ""

firebase emulators:start --only firestore,auth,ui
