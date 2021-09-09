import { Construct } from "constructs";
import { MysqlServer, ResourceGroup } from "@cdktf/provider-azurerm";

interface MySQLServerStackProps {
  sql_rg: ResourceGroup;
}

export class MySQLServerStack extends Construct {
  public readonly server: MysqlServer;

  constructor(scope: Construct, name: string, props: MySQLServerStackProps) {
    super(scope, name);

    const { sql_rg } = props;

    // create MySQL Server
    // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/mysql_server
    this.server = new MysqlServer(this, "iShare lib MySQL Server", {
      name: process.env.MYSQL_SERVER_NAME! + process.env.SUFFIX,
      version: process.env.MYSQL_SERVER_VERSION!,
      skuName: process.env.MYSQL_SERVER_SKU_NAME!,
      storageMb: <number>(<unknown>process.env.MYSQL_SERVER_SKU_STORAGE_SIZE!),
      resourceGroupName: sql_rg.name,
      location: sql_rg.location,
      identity: [
        {
          type: process.env.MYSQL_SERVER_IDENTITY_TYPE!,
        },
      ],
      administratorLogin: process.env.MYSQL_SERVER_ADMIN_USERNAME!,
      administratorLoginPassword: process.env.MYSQL_SERVER_ADMIN_PASSWORD!,
      publicNetworkAccessEnabled: true,
      sslEnforcementEnabled: false,
      geoRedundantBackupEnabled: true,
      dependsOn: [sql_rg],
      tags: JSON.parse(process.env.TAG!),
    });
  }
}
