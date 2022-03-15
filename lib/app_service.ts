import {Construct} from "constructs";
import {
    AppService,
    AppServicePlan,
    //AppServiceSiteCredential,
    ResourceGroup,
} from "@cdktf/provider-azurerm";
import {ContainerRegistrySConstruct} from "./container_registry";
import {Resource} from "@cdktf/provider-null";
import {DataLocalFile} from "../.gen/providers/local/data-local-file";
interface AppServiceConstructProps {
    resourceGroup: ResourceGroup;
    appServicePlan: AppServicePlan;
    containerregistry: ContainerRegistrySConstruct;
}

export class AppServiceConstruct extends Construct {
    public readonly appService: AppService;
    constructor(scope: Construct, name: string, props: AppServiceConstructProps) {
        super(scope, name);
        const {resourceGroup, appServicePlan, containerregistry} = props;
        const imagename = props.containerregistry.containerRegistry.loginServer + "/" + process.env.PROJECT_NAME

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
        const get_var = new Resource(this, "get git branch and hash",{
            triggers: {
            },
            dependsOn: [appServicePlan, containerregistry.dockerbuild]
        });
        get_var.addOverride(
            "provisioner.local-exec.command", `branch=$(git symbolic-ref --short HEAD) && echo -n $branch > ../../../git_branch && hash=$(git rev-parse --short HEAD) && echo -n $hash > ../../../git_hash `
        );
        const branch = new DataLocalFile(this, "branch of this Project in Github", {
            filename: "../../../git_branch",
            dependsOn: [get_var]
        });
        const hash = new DataLocalFile(this, "hash of this Project in Github", {
            filename: "../../../git_hash",
            dependsOn: [get_var]
        });


        this.appService = new AppService(this, "iShare App", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            appServicePlanId: appServicePlan.id,
            /*identity: [
                {
                    type: process.env.APP_SERVICE_IDENTITY_TYPE!,
                },
            ]*/
            dependsOn: [appServicePlan, containerregistry.containerRegistry],
            appSettings: {
                "WEBSITES_PORT" : "5000",
                "DOCKER_REGISTRY_SERVER_URL" : props.containerregistry.containerRegistry.loginServer,
                "DOCKER_REGISTRY_SERVER_USERNAME" : props.containerregistry.containerRegistry.adminUsername,
                "DOCKER_REGISTRY_SERVER_PASSWORD" : props.containerregistry.containerRegistry.adminPassword,
            },
            tags: JSON.parse(process.env.TAG!),
            siteConfig: [{
                linuxFxVersion: "DOCKER|"+ imagename + "-" + branch.content + ":" + hash.content,
                alwaysOn: true,
                healthCheckPath: "/health",

            }]

        });
    }
}
