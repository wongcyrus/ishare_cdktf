STACK_OUTPUT=stack_output.json
export VAULT_URL=$(cat $STACK_OUTPUT | jq -r .KeyVaultUri.value)
export AZURE_CLIENT_ID=$(cat $STACK_OUTPUT  | jq -r .ServicePrincipalAppId.value)
export AZURE_TENANT_ID=$(cat $STACK_OUTPUT  | jq -r .ServicePrincipalTenantId.value)
export AZURE_CLIENT_SECRET=$(cat $STACK_OUTPUT  | jq -r .ServicePrincipalPassword.value)
export $(grep PROJECT_NAME= dev.env) && export DB_HOST=${PROJECT_NAME}dev.mysql.database.azure.com
export $(grep MYSQL_SERVER_ADMIN_USERNAME= dev.env) && export export DB_USER=${MYSQL_SERVER_ADMIN_USERNAME}@${PROJECT_NAME}dev
export $(grep MYSQL_SERVER_ADMIN_PASSWORD= dev.env) && export DB_PASS=${MYSQL_SERVER_ADMIN_PASSWORD}
export $(grep MYSQL_SCHEMA_NAME= dev.env) && export DB_NAME=${MYSQL_SCHEMA_NAME}
export $(grep MAIL_SERVER= dev.env) && export export MAIL_SERVER=${MAIL_SERVER}@${PROJECT_NAME}dev
export $(grep MAIL_USERNAME= dev.env) && export MAIL_USERNAME=${MAIL_USERNAME}
export $(grep MAIL_PASSWORD= dev.env) && export MAIL_PASSWORD=${MAIL_PASSWORD}
export $(grep MAIL_USE_TLS= dev.env) && export MAIL_USE_TLS=${MAIL_USE_TLS}
export $(grep MAIL_PORT= dev.env) && export MAIL_PORT=${MAIL_PORT}
cd pc_donation
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
python3 ./insert_init_data.py