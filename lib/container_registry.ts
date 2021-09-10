import {Construct} from "constructs";
import {ContainerRegistry, ResourceGroup} from "@cdktf/provider-azurerm";

interface ContainerRegistryConstructProps {
    cr_rg: ResourceGroup;
}

export class ContainerRegistrySConstruct extends Construct {
    public readonly container_registry: ContainerRegistry;

    constructor(
        scope: Construct,
        name: string,
        props: ContainerRegistryConstructProps
    ) {
        super(scope, name);

        const {cr_rg} = props;

        // create container registry
        this.container_registry = new ContainerRegistry(
            this,
            "iShare lib container registry",
            {
                name: process.env.CONTAINER_REGISTRY! + process.env.SUFFIX,
                sku: process.env.CONTAINER_REGISTRY_SKU!,
                resourceGroupName: cr_rg.name,
                location: cr_rg.location,
                adminEnabled: true,
                dependsOn: [cr_rg],
                tags: JSON.parse(process.env.TAG!),
            }
        );
    }
}
