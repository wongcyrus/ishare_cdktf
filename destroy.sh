#!/usr/bin/env bash

PROJECT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $PROJECT_DIR
export $(grep PROJECT_NAME= dev.env)
export $(grep RESOURCE_GROUP_NAME= dev.env)
echo "Are you confirm to stop and delete ${PROJECT_NAME}dev on Azure that created by cdktf? Please select with the numbers."
select yn in "Yes" "No"; do
  case $yn in
    Yes ) break;;
    No ) exit;;
  esac
done
echo "Deleting..."
az webapp delete --name ${PROJECT_NAME}dev --resource-group ${RESOURCE_GROUP_NAME}dev --verbose
cdktf destroy --auto-approve
