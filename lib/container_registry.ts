import {Construct} from "constructs";
import {ContainerRegistry, ResourceGroup} from "@cdktf/provider-azurerm";
import {Resource} from "@cdktf/provider-null";
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
                tags: JSON.parse(process.env.TAG!),
            }
        );
        const dockerloginNullResource = new Resource(this, "login to azurecr",{
            triggers: {
                dummy: new Date().getMilliseconds().toString()
            }
        });
        const dockerbuilddockerNullResource = new Resource(this, "build docker image", {
            triggers: {
                dummy: new Date().getMilliseconds().toString()
            },
            dependsOn: [dockerloginNullResource],
        });
        const serverentry = this.containerRegistry.loginServer;
        const username = this.containerRegistry.adminUsername;
        const password = this.containerRegistry.adminPassword;
        const dockerlocation = process.env.DOCKERFILESLOCATION!;
        const imgname = process.env.PROJECT_NAME
        dockerloginNullResource.addOverride(
            "provisioner.local-exec.command",`sleep 30 && docker login ${serverentry} -u ${username} -p ${password}`
        );
        dockerbuilddockerNullResource.addOverride(
            "provisioner.local-exec.command", `branch=$(git symbolic-ref --short HEAD) && hash=$(git rev-parse --short HEAD) && docker build -t ${serverentry}/${imgname}-$branch:$hash ${dockerlocation} && docker push ${serverentry}/${imgname}-$branch:$hash`
        );
    }
}
