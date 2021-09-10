import {Construct} from "constructs";
import {
    DataAzurermClientConfig,
    KeyVault,
    KeyVaultSecret,
    ResourceGroup,
    StorageAccount
} from "@cdktf/provider-azurerm";

interface KeyVaultConstructProps {
    resourceGroup: ResourceGroup;
    storageAccount: StorageAccount;
    servicePrincipalObjectId: string;
}

export class KeyVaultConstruct extends Construct {

    public readonly keyVault: KeyVault;

    constructor(scope: Construct, name: string, props: KeyVaultConstructProps) {
        super(scope, name);
        const dataAzureRmClientConfig = new DataAzurermClientConfig(this, "Client Config");
        const {resourceGroup, storageAccount, servicePrincipalObjectId} = props;

        //TODO: objectId should be from service principal for accessPolicy,
        this.keyVault = new KeyVault(this, "iShare Key Vault", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            location: resourceGroup.location,
            resourceGroupName: resourceGroup.name,
            skuName: "standard",
            tenantId: dataAzureRmClientConfig.tenantId,
            accessPolicy: [{
                tenantId: dataAzureRmClientConfig.tenantId,
                objectId: dataAzureRmClientConfig.objectId, //the current user running deployment.
                secretPermissions: ["set", "get", "delete", "purge", "recover", "list"]
            }, {
                tenantId: dataAzureRmClientConfig.tenantId,
                objectId: servicePrincipalObjectId, //the current user running deployment.
                secretPermissions: ["set", "get", "delete", "purge", "recover", "list"]
            }
            ],
        });
        new KeyVaultSecret(this, "Storage Account Name", {
            keyVaultId: this.keyVault.id, name: "StorageAccountName", value: storageAccount.name
        })
        new KeyVaultSecret(this, "Storage Connection String", {
            keyVaultId: this.keyVault.id,
            name: "StorageConnectionString",
            value: storageAccount.primaryConnectionString
        })
        new KeyVaultSecret(this, "Storage Account Key", {
            keyVaultId: this.keyVault.id, name: "StorageAccountKey", value: storageAccount.primaryAccessKey
        })

    }
}
