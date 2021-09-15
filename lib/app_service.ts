import {Construct} from "constructs";
import {AppService, AppServicePlan, MysqlServer, ResourceGroup,} from "@cdktf/provider-azurerm";

interface AppServiceConstructProps {
    resourceGroup: ResourceGroup;
    appServicePlan: AppServicePlan;
    mysqlServer: MysqlServer;
}

export class AppServiceConstruct extends Construct {
    public readonly appService: AppService;

    constructor(scope: Construct, name: string, props: AppServiceConstructProps) {
        super(scope, name);

        const {resourceGroup, appServicePlan} = props;

        // TODO: Cannot get principalId using DataAzurermMysqlServer
        /*const test = new DataAzurermMysqlServer(this, "test", {
              name: mysql_server.name,
              resourceGroupName: app_rg.name,
              dependsOn: [mysql_server],
            });

            console.log(test.identity("principalId"));*/

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
        this.appService = new AppService(this, "iShare App", {
            name: process.env.PROJECT_NAME! + process.env.ENV,
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            appServicePlanId: appServicePlan.id,
            // identity: [
            //   {
            //     type: process.env.APP_SERVICE_IDENTITY_TYPE!,
            //   },
            // ],
            dependsOn: [appServicePlan],
        });
    }
}
