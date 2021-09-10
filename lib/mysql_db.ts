import {Construct} from "constructs";
import {MysqlDatabase, MysqlServer, ResourceGroup,} from "@cdktf/provider-azurerm";

interface MySQLDatabaseConstructProps {
    resourceGroup: ResourceGroup;
    mysqlServer: MysqlServer;
}

export class MySQLDatabaseConstruct extends Construct {
    public readonly mysqlDatabase: MysqlDatabase;

    constructor(scope: Construct, name: string, props: MySQLDatabaseConstructProps) {
        super(scope, name);

        const {resourceGroup, mysqlServer} = props;

        // create MySQL Database
        // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/mysql_database
        this.mysqlDatabase = new MysqlDatabase(
            this,
            "iShare lib MySQL Server Firewall",
            {
                name: process.env.PROJECT_NAME! + process.env.ENV,
                resourceGroupName: resourceGroup.name,
                serverName: mysqlServer.name,
                charset: process.env.MYSQL_DATABASE_CHARSET!,
                collation: process.env.MYSQL_DATABASE_COLLATION!,
                dependsOn: [mysqlServer],
            }
        );
    }
}
