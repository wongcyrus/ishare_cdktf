import {Construct} from "constructs";
import {AzureAdConstruct} from "./azure_ad";
import {ContainerRegistry, ResourceGroup} from "@cdktf/provider-azurerm";
import {Resource} from "@cdktf/provider-null";
interface ContainerRegistryConstructProps {
    resourceGroup: ResourceGroup;
    azureadConstruct: AzureAdConstruct;
}

export class ContainerRegistrySConstruct extends Construct {
    public readonly containerRegistry: ContainerRegistry;
    public readonly dockerbuild: Resource;
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
        this.dockerbuild = new Resource(this, "build docker image", {
            triggers: {
                dummy: new Date().getMilliseconds().toString()
            },
            dependsOn: [this.containerRegistry]
        });
        const serverentry = this.containerRegistry.loginServer;
        const username = this.containerRegistry.adminUsername;
        const password = this.containerRegistry.adminPassword;
        const dockerlocation = process.env.DOCKERFILESLOCATION!;
        const imgname = process.env.PROJECT_NAME;
        const VAULT_URL = "https://" + process.env.PROJECT_NAME! + process.env.ENV + ".vault.azure.net/"
        const AZURE_CLIENT_ID = props.azureadConstruct.servicePrincipalAppId;
        const AZURE_TENANT_ID = props.azureadConstruct.servicePrincipalTenantId;
        const AZURE_CLIENT_SECRET = props.azureadConstruct.servicePrincipalPassword;

        this.dockerbuild.addOverride(
            "provisioner.local-exec.command", `sleep 30 && docker login ${serverentry} -u ${username} -p ${password} && \ 
            branch=$(git symbolic-ref --short HEAD) && hash=$(git rev-parse --short HEAD) && chmod -R +rxw ${dockerlocation}/dev && \
            docker build -t ${serverentry}/${imgname}-$branch:$hash --build-arg VAULT_URL=${VAULT_URL} --build-arg AZURE_CLIENT_ID=${AZURE_CLIENT_ID} --build-arg AZURE_TENANT_ID=${AZURE_TENANT_ID} --build-arg AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} ${dockerlocation} && \
            docker push ${serverentry}/${imgname}-$branch:$hash`
        );
    }
}
