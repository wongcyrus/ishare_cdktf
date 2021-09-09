import {Construct} from "constructs";
import {ResourceGroup, StorageAccount, StorageContainer,} from "@cdktf/provider-azurerm";
import "./config";

interface BlobStorageStackProps {
    bs_rg: ResourceGroup;
}

export class BlobStorageConstruct extends Construct {
    public readonly storage_account: StorageAccount;
    public readonly temp_container: StorageContainer;
    public readonly picture_container: StorageContainer;

    constructor(scope: Construct, name: string, props: BlobStorageStackProps) {
        super(scope, name);

        const {bs_rg} = props;

        // create storage account
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_account
        this.storage_account = new StorageAccount(
            this,
            "iShare lib storage account",
            {
                name: process.env.STORAGE_ACCOUNT_NAME! + process.env.SUFFIX,
                resourceGroupName: bs_rg.name,
                location: bs_rg.location,
                accountTier: process.env.STORAGE_ACCOUNT_TIER!,
                accountReplicationType: process.env.STORAGE_ACCOUNT_REPLICATION_TYPE!,
            }
        );

        // create container
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_blob
        this.temp_container = new StorageContainer(
            this,
            "iShare lib temp container",
            {
                name: process.env.STORAGE_CONTAINER_TEMP_NAME!,
                containerAccessType: process.env.STORAGE_CONTAINER_ACCESS_TYPE!,
                storageAccountName: this.storage_account.name,
            }
        );

        this.picture_container = new StorageContainer(
            this,
            "iShare lib picture container",
            {
                name: process.env.STORAGE_CONTAINER_PERMANENT_NAME!,
                containerAccessType: process.env.STORAGE_CONTAINER_ACCESS_TYPE!,
                storageAccountName: this.storage_account.name,
            }
        );

        // create lifecycle policy
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_management_policy
    }
}
