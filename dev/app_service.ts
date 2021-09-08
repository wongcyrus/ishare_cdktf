import {Construct} from "constructs";
import {AppService, AppServicePlan, MysqlServer, ResourceGroup,} from "@cdktf/provider-azurerm";
import "./dev-config";

interface AppServiceStackProps {
    app_rg: ResourceGroup;
    app_service_plan: AppServicePlan;
    mysql_server: MysqlServer;
}

export class AppServiceConstruct extends Construct {
    public readonly app_service: AppService;

    constructor(scope: Construct, name: string, props: AppServiceStackProps) {
        super(scope, name);

        const {app_rg, app_service_plan} = props;

        // TODO: Cannot get principalId using DataAzurermMysqlServer
        /*const test = new DataAzurermMysqlServer(this, "test", {
          name: mysql_server.name,
          resourceGroupName: app_rg.name,
          dependsOn: [mysql_server],
        });

        console.log(test.identity("principalId"));*/

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
        this.app_service = new AppService(this, "iShare App", {
            name: process.env.APP_SERVICE_NAME! + process.env.SUFFIX,
            resourceGroupName: app_rg.name,
            location: app_rg.location,
            appServicePlanId: app_service_plan.id,
            // identity: [
            //   {
            //     type: process.env.APP_SERVICE_IDENTITY_TYPE!,
            //   },
            // ],
            dependsOn: [app_service_plan],
        });
    }
}
