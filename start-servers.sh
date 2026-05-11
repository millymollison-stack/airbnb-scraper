#!/bin/bash
# Start all servers for Vacation Rental SaaS

cd "/Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy" && npx serve -l 9000 . &
cd "/Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy/sites/avidmollison1newsiteadmin2gmailcom" && npx serve -l 9100 . &
cd "/Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy/sites/davidmollison1newsiteadmingmailcom/template/Airbnb Import Template" && python3 api_server.py &
cd "/Users/davidsassistant/.openclaw/workspace/projects/Surf House Baja (Original)" && npx serve -l 9103 . &

echo "Servers starting..."
