import {Construct} from "constructs";
import {App, TerraformStack} from "cdktf";
import {AzurermProvider, ResourceGroup,} from "@cdktf/provider-azurerm";
import {BlobStorageConstruct} from "./lib/blob";
import {MySQLServerStack} from "./lib/mysql_server";
import {MySQLDatabaseConstruct} from "./lib/mysql_db";
import {MySQLFirewallConstruct} from "./lib/mysql_db_firewall";
import {ApplicationInsightsConstruct} from "./lib/application_insight";
import {ContainerRegistrySConstruct} from "./lib/container_registry";
import {AppServicePlanConstruct} from "./lib/app_service_plan";
import {AppServiceConstruct} from "./lib/app_service";
import {OutputConstruct} from "./lib/output";
import "./lib/config";

export class MainStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        console.log(process.env.RESOURCE_GROUP_NAME);

        new AzurermProvider(this, "azure_feature", {
            features: [{}],
            skipProviderRegistration: true,
        });

        const resourceGroup = new ResourceGroup(this, "rg", {
            name: process.env.RESOURCE_GROUP_NAME!,
            location: process.env.LOCATION!,
        })

        new BlobStorageConstruct(this, "Blob", {bs_rg: resourceGroup});

        const mysqlServer = new MySQLServerStack(this, "MySQL server", {
            sql_rg: resourceGroup,
        });

        new MySQLDatabaseConstruct(this, "MySQL Database", {
            sql_rg: resourceGroup,
            mysql_server: mysqlServer.server,
        });

        new MySQLFirewallConstruct(this, "MySQL firewall", {
            sql_rg: resourceGroup,
            mysql_server: mysqlServer.server,
        });

        const log = new ApplicationInsightsConstruct(this, "application insights", {
            ai_rg: resourceGroup,
        });

        const containerRegistry= new ContainerRegistrySConstruct(
            this,
            "container registry",
            {cr_rg: resourceGroup}
        );

        const appPlan = new AppServicePlanConstruct(this, "app service plan", {
            app_plan_rg: resourceGroup,
        });

        new AppServiceConstruct(this, "app service", {
            app_rg: resourceGroup,
            app_service_plan: appPlan.app_service_plan,
            mysql_server: mysqlServer.server,
        });

        new OutputConstruct(this, "output value", {
            mysql_server: mysqlServer.server,
            application_insights: log.application_insights,
            docker_registry: containerRegistry.container_registry,
            app_plan: appPlan.app_service_plan,
        });

        // TODO: find a way for other stack read the principal_id it
        console.log(mysqlServer.server.identity);
    }
}

const app = new App();
new MainStack(app, "iShare_stack");
app.synth();

