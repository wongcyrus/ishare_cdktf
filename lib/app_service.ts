import {Construct} from "constructs";
import {
    //AppService,
    AppServicePlan,
    //AppServiceSiteCredential,
    ResourceGroup,
} from "@cdktf/provider-azurerm";
import {ContainerRegistrySConstruct} from "./container_registry";
import {Resource} from "@cdktf/provider-null";
//import {DataLocalFile} from "../.gen/providers/local/data-local-file";
interface AppServiceConstructProps {
    resourceGroup: ResourceGroup;
    appServicePlan: AppServicePlan;
    containerregistry: ContainerRegistrySConstruct;
}

export class AppServiceConstruct extends Construct {
    //public readonly appService: AppService;
    constructor(scope: Construct, name: string, props: AppServiceConstructProps) {
        super(scope, name);
        const {resourceGroup, appServicePlan, containerregistry} = props;
        const App_Service_Creation = new Resource(this, "get git branch and hash",{
            triggers: {
            },
            dependsOn: [appServicePlan, containerregistry.dockerbuild]
        });
        const imagename = props.containerregistry.containerRegistry.loginServer + "/" + process.env.PROJECT_NAME
        const appname = process.env.PROJECT_NAME! + process.env.ENV;
        const resourcegroup = resourceGroup.name;
        const appServicePlanId = appServicePlan.id;
        const acr_user = props.containerregistry.containerRegistry.adminUsername;
        const acr_pass = props.containerregistry.containerRegistry.adminPassword;

        App_Service_Creation.addOverride(
            "provisioner.local-exec.command",` sleep 30 && branch=$(git symbolic-ref --short HEAD) && hash=$(git rev-parse --short HEAD) &&  \ 
            az webapp create --resource-group ${resourcegroup} --plan ${appServicePlanId} --name ${appname} --deployment-container-image-name ${imagename}-$branch:$hash --docker-registry-server-user ${acr_user} && \ 
            az webapp config appsettings set --resource-group ${resourcegroup} --name ${appname} --settings WEBSITES_PORT=5000 DOCKER_REGISTRY_SERVER_PASSWORD="${acr_pass}"`)
        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
        /*const get_var = new Resource(this, "get git branch and hash",{
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
            ]
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

            }]

        });*/
    }
}
