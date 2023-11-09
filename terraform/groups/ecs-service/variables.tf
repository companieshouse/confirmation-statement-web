# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in envrionments vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}
variable "kms_alias" {
  type        = string
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type        = number
  description = "The desired ECS task count for this service"
  default     = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type        = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default     = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type        = number
  description = "The required memory for this service"
  default     = 256 # defaulted low for node service in dev environments, override for production
}
variable "use_fargate" {
  type        = bool
  description = "If true, sets the required capabilities for all containers in the task definition to use FARGATE, false uses EC2"
  default     = false
}
# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------
variable "log_level" {
  default     = "info"
  type        = string
  description = "The log level for services to use: trace, debug, info or error"
}

variable "confirmation_statement_web_version" {
  type        = string
  description = "The version of the confirmation statement web container to run."
}

variable "chs_url" {
  type        = string
}
variable "cdn_host" {
  type        = string
}
variable "account_local_url" {
  type        = string
}

variable "piwik_url" {
  type        = string
}
variable "piwik_site_id" {
  type        = string
}
variable "redirect_uri" {
  type        = string
  default     = "/"
}
variable "cache_pool_size" {
  type        = string
  default     = "8"
}

variable "cookie_domain" {
  type        = string
}
variable "cookie_name" {
  type        = string
  default     = "__SID"
}
variable "cookie_secure_only" {
  type        = string
  default     = "0"
}
variable "default_session_expiration" {
  type        = string
  default     = "3600"
}

variable "radio_button_value_log_length" {
  type        = string
  default     = "50"
}
variable "show_service_offline_page" {
  type        = string
  default     = "false"
}
variable "url_log_max_length" {
  type        = string
  default     = "400"
}
variable "url_param_max_length" {
  type        = string
  default     = "50"
}
variable "feature_flag_private_sdk_12052021" {
  type        = string
}
variable "feature_flag_active_officers_01072021" {
  type        = string
}
variable "feature_flag_five_or_less_officers_journey_21102021" {
  type        = string
}
variable "psc_statements_api_page_size" {
  type        = string
  default     = "100"
}
variable "ewf_url" {
  type        = string
}
variable "api_url" {
  type        = string
}
variable "piwik_start_goal_id" {
  type        = string
}
variable "feature_flag_ecct_start_date_14082023" {
  type        = string
}
