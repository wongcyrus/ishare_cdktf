import {Construct} from "constructs";
import {Application} from "../.gen/providers/azuread/application";
import {ServicePrincipal} from "../.gen/providers/azuread/service-principal";
import {ServicePrincipalPassword} from "../.gen/providers/azuread/service-principal-password";


import {DataAzurermClientConfig, ResourceGroup,} from "@cdktf/provider-azurerm";

interface AzureAdConstructProps {
    resourceGroup: ResourceGroup;
}

export class AzureAdConstruct extends Construct {
    public readonly servicePrincipalObjectId: string;
    public readonly servicePrincipalPassword: string;

    constructor(scope: Construct, name: string, props: AzureAdConstructProps) {
        super(scope, name);
        console.log(props.resourceGroup.name);
        const dataAzureRmClientConfig = new DataAzurermClientConfig(this, "Client Config");
        const application = new Application(this, "iShare Application", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            owners: [dataAzureRmClientConfig.objectId],
        });
        const servicePrincipal = new ServicePrincipal(this, "iShare Service Principal", {
            applicationId: application.applicationId,
        });
        const principalPassword = new ServicePrincipalPassword(this, "Service Principal Password", {
            servicePrincipalId: servicePrincipal.objectId,
            value: process.env.SERVICE_PRINCIPAL_PASSWORD!,
            endDate: "2030-01-01T01:02:03Z"
        });

        this.servicePrincipalPassword = principalPassword.value;
        this.servicePrincipalObjectId = servicePrincipal.objectId;
    }
}