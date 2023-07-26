# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "filing-maintain" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "confirmation-statement-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "confirmation-statement-web"
  lb_listener_rule_priority = 10
  lb_listener_paths         = ["/*"]
  #healthcheck_path          = "/" #healthcheck path for confirmation statement web
  #healthcheck_matcher       = "302" # no explicit healthcheck in this service yet, change this when added!

  secrets                   = jsondecode(data.vault_generic_secret.secrets.data_json)
  vpc_name                  = local.secrets["vpc_name"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  task_secrets = [
    # { "name": "CHS_DEVELOPER_CLIENT_ID", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-id}" },
    # { "name": "CHS_DEVELOPER_CLIENT_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-secret}" },
    # { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
    # { "name": "DEVELOPER_OAUTH2_REQUEST_KEY", "valueFrom": "${local.secrets_arn_map.web-oauth2-request-key}" }
  ]

  task_environment = [
    { "name": "NODE_PORT", "value": "${local.container_port}" },
    { "name": "LOGLEVEL", "value": "${var.log_level}" },
    { "name": "CDN_HOST", "value": "//${var.cdn_host}" },
    { "name": "CHS_URL", "value": "${var.chs_url}" },
    { "name": "ACCOUNT_LOCAL_URL", "value": "${var.account_local_url}" },
    { "name": "PIWIK_URL", "value": "${var.piwik_url}" },
    { "name": "PIWIK_SITE_ID", "value": "${var.piwik_site_id}" },
    { "name": "REDIRECT_URI", "value": "${var.redirect_uri}" },
    { "name": "CACHE_POOL_SIZE", "value": "${var.cache_pool_size}" },
    { "name": "CACHE_SERVER", "value": "${var.cache_server}" },
    { "name": "COOKIE_DOMAIN", "value": "${var.cookie_domain}" },
    { "name": "COOKIE_NAME", "value": "${var.cookie_name}" },
    { "name": "COOKIE_SECURE_ONLY", "value": "${var.cookie_secure_only}" },
    { "name": "DEFAULT_SESSION_EXPIRATION", "value": "${var.default_session_expiration}" },
    { "name": "OAUTH2_REDIRECT_URI", "value": "${var.oauth2_redirect_uri}" },
    { "name": "OAUTH2_AUTH_URI", "value": "${var.oauth2_auth_uri}" },
    { "name": "APPLICATIONS_API_URL", "value": "${var.account_local_url}" }
  ]
}
