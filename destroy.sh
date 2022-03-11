STACK_OUTPUT=./stack_output.json && export Appservicename=$(cat $STACK_OUTPUT  | jq -r .AppServicePlanName.value)
export $(grep RESOURCE_GROUP_NAME= dev.env)
echo "Are you confirm to stop and delete $Appservicename on Azure that created by cdktf? Please select with the numbers."
select yn in "Yes" "No"; do
  case $yn in
    Yes ) break;;
    No ) exit;;
  esac
done
echo "Deleting..."
az webapp delete --name $Appservicename --resource-group ${RESOURCE_GROUP_NAME}dev --verbose
cdktf destroy --auto-approve