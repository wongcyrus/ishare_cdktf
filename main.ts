import {Construct} from "constructs";
import {App, TerraformOutput, TerraformStack} from "cdktf";
import {AzurermProvider, ResourceGroup} from "@cdktf/provider-azurerm";
import {BlobStorageConstruct} from "./lib/blob";
import {MySQLServerStack} from "./lib/mysql_server";
import {MySQLDatabaseConstruct} from "./lib/mysql_db";
import {MySQLFirewallConstruct} from "./lib/mysql_db_firewall";
import {ApplicationInsightsConstruct} from "./lib/application_insight";
import {ContainerRegistrySConstruct} from "./lib/container_registry";
import {AppServicePlanConstruct} from "./lib/app_service_plan";
import {AppServiceConstruct} from "./lib/app_service";
import {resolve} from "path";
import {config} from "dotenv";

interface MainStackProps {
    env: string;
}

export class MainStack extends TerraformStack {
    constructor(scope: Construct, name: string, props: MainStackProps) {
        super(scope, name);

        config({path: resolve(__dirname, `./${props.env}.env`)});

        console.log(process.env.RESOURCE_GROUP_NAME);

        new AzurermProvider(this, "azure_feature", {
            features: [{}],
            skipProviderRegistration: true,
        });

        const resourceGroup = new ResourceGroup(this, "rg", {
            name: process.env.RESOURCE_GROUP_NAME!,
            location: process.env.LOCATION!,
        });

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

        const containerRegistry = new ContainerRegistrySConstruct(
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

        new TerraformOutput(
            this,
            "MySQL server hostname",
            {value: mysqlServer.server.fqdn}
        );
        new TerraformOutput(
            this,
            "MySQL server identity",
            {value: mysqlServer.server.identity}
        );

        new TerraformOutput(
            this,
            "application insights key",
            {value: log.application_insights.instrumentationKey, sensitive: true}
        );

        new TerraformOutput(
            this,
            "application insights connection string",
            {value: log.application_insights.connectionString, sensitive: true}
        );

        new TerraformOutput(
            this,
            "container registry adminUsername",
            {value: containerRegistry.container_registry.adminUsername}
        );

        new TerraformOutput(
            this,
            "container registry adminPassword",
            {value: containerRegistry.container_registry.adminPassword, sensitive: true}
        );

        new TerraformOutput(
            this,
            "container registry identity",
            {value: containerRegistry.container_registry.identity}
        );

        new TerraformOutput(
            this,
            "app service plan name",
            {
                value: appPlan.app_service_plan.name,
            }
        );

        // TODO: find a way for other stack read the principal_id it
        console.log(mysqlServer.server.identity);
    }
}

const app = new App();
new MainStack(app, "iShare_stack", {env: "dev"});
app.synth();
