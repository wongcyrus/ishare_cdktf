import {Construct} from "constructs";
import {ContainerRegistry, ResourceGroup} from "@cdktf/provider-azurerm";

interface ContainerRegistryConstructProps {
    resourceGroup: ResourceGroup;
}

export class ContainerRegistrySConstruct extends Construct {
    public readonly containerRegistry: ContainerRegistry;

    constructor(
        scope: Construct,
        name: string,
        props: ContainerRegistryConstructProps
    ) {
        super(scope, name);

        const {resourceGroup} = props;

        // create container registry
        this.containerRegistry = new ContainerRegistry(
            this,
            "iShare lib container registry",
            {
                name: process.env.PROJECT_NAME! + process.env.ENV,
                sku: process.env.CONTAINER_REGISTRY_SKU!,
                resourceGroupName: resourceGroup.name,
                location: resourceGroup.location,
                adminEnabled: true,
                dependsOn: [resourceGroup],
                tags: {"environment": process.env.ENV!, "created_by": process.env.CREATED_BY!},
            }
        );
    }
}
