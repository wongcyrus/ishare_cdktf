import {Construct} from "constructs";
import {MysqlFirewallRule, MysqlServer, ResourceGroup,} from "@cdktf/provider-azurerm";

interface MySQLFirewallConstructProps {
    sql_rg: ResourceGroup;
    mysql_server: MysqlServer;
}

export class MySQLFirewallConstruct extends Construct {
    public readonly my_sql_firewall: MysqlFirewallRule;

    constructor(scope: Construct, name: string, props: MySQLFirewallConstructProps) {
        super(scope, name);

        const {sql_rg, mysql_server} = props;

        // create application insights
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_insights#attributes-reference
        this.my_sql_firewall = new MysqlFirewallRule(
            this,
            "iShare lib MySQL Server Firewall",
            {
                name: process.env.MYSQL_FIREWALL_NAME! + process.env.SUFFIX,
                resourceGroupName: sql_rg.name,
                serverName: mysql_server.name,
                startIpAddress: process.env.MYSQL_FIREWALL_START_IP!,
                endIpAddress: process.env.MYSQL_FIREWALL_END_IP!,
                dependsOn: [mysql_server],
            }
        );
    }
}
