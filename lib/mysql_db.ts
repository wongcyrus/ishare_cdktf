import {Construct} from "constructs";
import {MysqlDatabase, MysqlServer, ResourceGroup,} from "@cdktf/provider-azurerm";

interface MySQLDatabaseConstructProps {
    sql_rg: ResourceGroup;
    mysql_server: MysqlServer;
}

export class MySQLDatabaseConstruct extends Construct {
    public readonly my_sql_firewall: MysqlDatabase;

    constructor(scope: Construct, name: string, props: MySQLDatabaseConstructProps) {
        super(scope, name);

        const {sql_rg, mysql_server} = props;

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/mysql_database
        this.my_sql_firewall = new MysqlDatabase(
            this,
            "iShare lib MySQL Server Firewall",
            {
                name: process.env.MYSQL_DATABASE_NAME! + process.env.SUFFIX,
                resourceGroupName: sql_rg.name,
                serverName: mysql_server.name,
                charset: process.env.MYSQL_DATABASE_CHARSET!,
                collation: process.env.MYSQL_DATABASE_COLLATION!,
                dependsOn: [mysql_server],
            }
        );
    }
}