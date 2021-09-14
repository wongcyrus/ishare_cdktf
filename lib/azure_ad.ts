import {Construct} from "constructs";
import {Application} from "../.gen/providers/azuread/application";
import {AzureadProvider} from "../.gen/providers/azuread/azuread-provider";
import {ServicePrincipal} from "../.gen/providers/azuread/service-principal";
import {ServicePrincipalPassword} from "../.gen/providers/azuread/service-principal-password";


import {DataAzurermClientConfig,} from "@cdktf/provider-azurerm";


export class AzureAdConstruct extends Construct {
    public readonly servicePrincipalObjectId: string;
    public readonly servicePrincipalAppId: string;
    public readonly servicePrincipalTenantId: string;
    public readonly servicePrincipalPassword: string;

    constructor(scope: Construct, name: string,) {
        super(scope, name);
        const dataAzureRmClientConfig = new DataAzurermClientConfig(this, "Client Config");
        new AzureadProvider(this, "Azure AD Provider");

        const application = new Application(this, "iShare Application", {
            displayName: process.env.PROJECT_NAME! + process.env.ENV,
            owners: [dataAzureRmClientConfig.objectId],
        });

        const servicePrincipal = new ServicePrincipal(this, "iShare Service Principal", {
            applicationId: application.applicationId,
        });
        const principalPassword = new ServicePrincipalPassword(this, "Service Principal Password", {
            servicePrincipalId: servicePrincipal.objectId
        });

        this.servicePrincipalAppId = application.applicationId;
        this.servicePrincipalPassword = principalPassword.value;
        this.servicePrincipalTenantId = dataAzureRmClientConfig.tenantId;
        this.servicePrincipalObjectId = servicePrincipal.objectId;
    }
}