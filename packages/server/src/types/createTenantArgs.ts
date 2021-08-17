export type CreateTenantArgs = {
  slug: string;
  user_id: string;
  name?: string;
  db_name?: string;
  db_host?: string;
  db_username?: string;
  db_password?: string;
  db_port?: string;
};
