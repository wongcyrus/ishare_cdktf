import {Construct} from "constructs";
import {
    //AppService,
    AppServicePlan,
    //AppServiceSiteCredential,
    MysqlServer,
    ResourceGroup,
} from "@cdktf/provider-azurerm";
import {ContainerRegistrySConstruct} from "./container_registry";
import {Resource} from "@cdktf/provider-null";
interface AppServiceConstructProps {
    resourceGroup: ResourceGroup;
    appServicePlan: AppServicePlan;
    mysqlServer: MysqlServer;
    containerregistry: ContainerRegistrySConstruct;
}

export class AppServiceConstruct extends Construct {
    //public readonly appService: AppService;

    constructor(scope: Construct, name: string, props: AppServiceConstructProps) {
        super(scope, name);

        const {resourceGroup, appServicePlan, containerregistry} = props;
        const App_Service_Creation = new Resource(this, "create app service",{
            triggers: {
                dummy: new Date().getMilliseconds().toString()
            },
            dependsOn: [appServicePlan, containerregistry.dockerbuild]
        });
        const appname = process.env.PROJECT_NAME! + process.env.ENV;
        const resourcegroup = resourceGroup.name;
        const appServicePlanId = appServicePlan.id;
        const imagename = props.containerregistry.containerRegistry.loginServer + "/" + process.env.PROJECT_NAME
        const acr_user = props.containerregistry.containerRegistry.adminUsername;
        const acr_pass = props.containerregistry.containerRegistry.adminPassword;

        App_Service_Creation.addOverride(
            "provisioner.local-exec.command",` sleep 30 && branch=$(git symbolic-ref --short HEAD) && hash=$(git rev-parse --short HEAD) &&  \ 
            az webapp create --resource-group ${resourcegroup} --plan ${appServicePlanId} --name ${appname} --deployment-container-image-name ${imagename}-$branch:$hash --docker-registry-server-user ${acr_user} && \ 
            az webapp config appsettings set --resource-group ${resourcegroup} --name ${appname} --settings WEBSITES_PORT=5000 DOCKER_REGISTRY_SERVER_PASSWORD="${acr_pass}"`
        );

        // TODO: Cannot get principalId using DataAzurermMysqlServer
        /*const test = new DataAzurermMysqlServer(this, "test", {
        /*const test = new DataAzurermMysqlServer(this, "test", {
              name: mysql_server.name,
              resourceGroupName: app_rg.name,
              dependsOn: [mysql_server],
            });

            console.log(test.identity("principalId"));*/

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
        /*this.appService = new AppService(this, "iShare App", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            appServicePlanId: appServicePlan.id,
            /*identity: [
                {
                    type: process.env.APP_SERVICE_IDENTITY_TYPE!,
                },
            ],
            dependsOn: [appServicePlan, containerregistry.containerRegistry],
            /*appSettings: {
                "WEBSITES_PORT" : "5000",
                "DOCKER_REGISTRY_SERVER_URL" : props.containerregistry.containerRegistry.loginServer,
                "DOCKER_REGISTRY_SERVER_USERNAME" : props.containerregistry.containerRegistry.adminUsername,
                "DOCKER_REGISTRY_SERVER_PASSWORD" : props.containerregistry.containerRegistry.adminPassword,
            },
            tags: JSON.parse(process.env.TAG!),
            kind: "linux",
            siteConfig: {
                linuxFxVersion: "DOCKER|isharedemotest3dev.azurecr.io/isharedemotest3-hades:2fb17de",
                always_on: true,
                health_check_path: "/health",
            }

        });*/
    }
}
