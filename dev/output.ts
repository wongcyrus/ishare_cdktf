import {Construct} from "constructs";
import {TerraformOutput} from "cdktf";
import {ApplicationInsights, AppServicePlan, ContainerRegistry, MysqlServer,} from "@cdktf/provider-azurerm";
import "./dev-config";

interface OutputStackProps {
    mysql_server: MysqlServer;
    application_insights: ApplicationInsights;
    docker_registry: ContainerRegistry;
    app_plan: AppServicePlan;
}

export class OutputConstruct extends Construct {
    public readonly mysql_server_hostname_output: TerraformOutput;
    public readonly mysql_server_identity_output: TerraformOutput;
    public readonly application_insights_key_output: TerraformOutput;
    public readonly application_insights_connection_output: TerraformOutput;
    public readonly docker_registry_username_output: TerraformOutput;
    public readonly docker_registry_password_output: TerraformOutput;
    public readonly docker_registry_identity_output: TerraformOutput;
    public readonly app_plan_name_output: TerraformOutput;

    constructor(scope: Construct, name: string, props: OutputStackProps) {
        super(scope, name);

        const {mysql_server, application_insights, docker_registry, app_plan} =
            props;

        // Output required value from Terraform Stack
        this.mysql_server_hostname_output = new TerraformOutput(
            this,
            "MySQL server hostname",
            {value: mysql_server.fqdn}
        );

        this.mysql_server_identity_output = new TerraformOutput(
            this,
            "MySQL server identity",
            {value: mysql_server.identity}
        );

        this.application_insights_key_output = new TerraformOutput(
            this,
            "application insights key",
            {value: application_insights.instrumentationKey, sensitive: true}
        );

        this.application_insights_connection_output = new TerraformOutput(
            this,
            "application insights connection string",
            {value: application_insights.connectionString, sensitive: true}
        );

        this.docker_registry_username_output = new TerraformOutput(
            this,
            "container registry adminUsername",
            {value: docker_registry.adminUsername}
        );

        this.docker_registry_password_output = new TerraformOutput(
            this,
            "container registry adminPassword",
            {value: docker_registry.adminPassword, sensitive: true}
        );

        this.docker_registry_identity_output = new TerraformOutput(
            this,
            "container registry identity",
            {value: docker_registry.identity}
        );

        this.app_plan_name_output = new TerraformOutput(
            this,
            "app service plan name",
            {
                value: app_plan.name,
            }
        );
    }
}
