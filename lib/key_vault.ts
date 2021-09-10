import {Construct} from "constructs";
import {ResourceGroup,KeyVault,DataAzurermClientConfig} from "@cdktf/provider-azurerm";

interface KeyVaultConstructProps {
    resourceGroup: ResourceGroup;
}

export class KeyVaultConstruct extends Construct {

    public readonly keyVault: KeyVault;

    constructor(scope: Construct, name: string, props: KeyVaultConstructProps) {
        super(scope, name);
        const dataAzureRmClientConfig = new DataAzurermClientConfig(this,"Client Config");
        const {resourceGroup} = props;
        this.keyVault = new KeyVault(this, "iShare Key Vault", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            location: resourceGroup.location,
            resourceGroupName: resourceGroup.name,
            skuName: "standard",
            tenantId: dataAzureRmClientConfig.tenantId,
        });
    }
}
