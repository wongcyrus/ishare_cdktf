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
        const dockerpushNullResource = new Resource(this, "push to azurecr", {
            triggers: {
                dummy: new Date().getMilliseconds().toString()
            },
            dependsOn: [dockerbuilddockerNullResource, dockerloginNullResource],
        });
        const serverentry = this.containerRegistry.loginServer;
        const username = this.containerRegistry.adminUsername;
        const password = this.containerRegistry.adminPassword;
        const dockerlocation = process.env.DOCKERFILESLOCATION!;
        dockerloginNullResource.addOverride(
            "provisioner.local-exec.command",`docker login ${serverentry} -u ${username} -p ${password}`
        );
        dockerbuilddockerNullResource.addOverride(
            "provisioner.local-exec.command", `docker build -t ${serverentry}/pc_donation:v0.0.0 ${dockerlocation}`
        );
        dockerpushNullResource.addOverride(
            "provisioner.local-exec.command", `docker push ${serverentry}/pc_donation:v0.0.0`
        );
    }
}
